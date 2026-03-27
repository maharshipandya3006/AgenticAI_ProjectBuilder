from dotenv import load_dotenv
from langchain_groq.chat_models import ChatGroq
from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent   # <-- unchanged, works
from langchain_core.messages import SystemMessage
from typing import TypedDict, Optional

from agent.prompts import *
from agent.states import *
from agent.tools import (
    write_file,
    read_file,
    get_current_directory,
    list_files,
    list_file,
    run_cmd,
    init_project_root
)

# ----------------------------------------------------------------------
# Define a typed state for the graph
# ----------------------------------------------------------------------
class GraphState(TypedDict):
    user_prompt: str
    plan: Optional[Plan]
    task_plan: Optional[TaskPlan]
    coder_state: Optional[CoderState]
    status: Optional[str]

# ----------------------------------------------------------------------
# Setup
# ----------------------------------------------------------------------
_ = load_dotenv()
init_project_root()

llm = ChatGroq(model="openai/gpt-oss-120b",)

coder_tools = [
    read_file,
    write_file,
    list_files,
    list_file,
    get_current_directory,
    run_cmd
]

# ✅ Use the working version
react_agent = create_react_agent(
    llm,
    coder_tools,
    prompt=SystemMessage(coder_system_prompt())
)

# ----------------------------------------------------------------------
# Node functions
# ----------------------------------------------------------------------
def planner_agent(state: GraphState) -> dict:
    """Converts user prompt into a structured Plan."""
    user_prompt = state["user_prompt"]
    resp = llm.with_structured_output(Plan).invoke(planner_prompt(user_prompt))
    if resp is None:
        raise ValueError("Planner did not return a valid response.")
    return {"plan": resp}

def architect_agent(state: GraphState) -> dict:
    """Creates TaskPlan from Plan."""
    plan: Plan = state["plan"]  # type: ignore
    resp = llm.with_structured_output(TaskPlan).invoke(
        architect_prompt(plan=plan.model_dump_json())
    )
    if resp is None:
        raise ValueError("Architect did not return a valid response.")
    resp.plan = plan
    print(resp.model_dump_json())
    return {"task_plan": resp}

def coder_agent(state: GraphState) -> dict:
    """LangGraph tool-using coder agent."""
    coder_state = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)  # type: ignore

    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    current_task = steps[coder_state.current_step_idx]

    # Read existing file content (if any)
    existing_content = read_file.invoke({"path": current_task.filepath})

    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n"
        "Write concise code. Avoid unnecessary comments. Keep files under 300 lines. "
        "Use write_file(path, content) to save."
    )

    # Invoke the agent and capture the result
    result = react_agent.invoke({
        "messages": [{"role": "user", "content": user_prompt}]
    })

    # (optional) inspect result["messages"] for errors or final answer

    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}

# ----------------------------------------------------------------------
# Build the graph
# ----------------------------------------------------------------------
graph = StateGraph(GraphState)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")

graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")

agent = graph.compile()