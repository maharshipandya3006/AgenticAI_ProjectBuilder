// Core calculator script
const display = document.getElementById('display');
const buttons = document.querySelectorAll('#calculator button');
const OPERATORS = ['+', '-', '*', '/'];
let calculatorState = {
  currentInput: '',
  lastResult: null,
  error: null,
};
function updateDisplay() {
  const text = calculatorState.currentInput || calculatorState.lastResult || '0';
  display.textContent = text;
  if (calculatorState.error) {
    display.classList.add('error');
  } else {
    display.classList.remove('error');
  }
}
function appendInput(char) {
  // Allow only one decimal per number segment
  if (char === '.') {
    const parts = calculatorState.currentInput.split(/[+\-*/]/);
    const last = parts[parts.length - 1];
    if (last.includes('.')) return;
  }
  calculatorState.currentInput += char;
  calculatorState.error = null;
  updateDisplay();
}
function appendOperator(op) {
  if (!calculatorState.currentInput) return; // ignore leading operator
  const lastChar = calculatorState.currentInput.slice(-1);
  if (OPERATORS.includes(lastChar)) return; // prevent double operator
  calculatorState.currentInput += op;
  calculatorState.error = null;
  updateDisplay();
}
function clearAll() {
  calculatorState = { currentInput: '', lastResult: null, error: null };
  updateDisplay();
}
function backspace() {
  calculatorState.currentInput = calculatorState.currentInput.slice(0, -1);
  calculatorState.error = null;
  updateDisplay();
}
function evaluateExpression() {
  const expr = calculatorState.currentInput.trim();
  if (!expr) return;
  const lastChar = expr.slice(-1);
  if (OPERATORS.includes(lastChar)) {
    calculatorState.error = 'Incomplete expression';
    updateDisplay();
    return;
  }
  // Simple division by zero detection
  if (/\/\s*0(?!\d)/.test(expr)) {
    calculatorState.error = 'Division by zero';
    updateDisplay();
    return;
  }
  try {
    const result = Function('return ' + expr)();
    if (!Number.isFinite(result)) {
      calculatorState.error = 'Division by zero';
    } else {
      calculatorState.lastResult = result;
      calculatorState.currentInput = '';
      calculatorState.error = null;
    }
  } catch (e) {
    calculatorState.error = 'Invalid input';
  }
  updateDisplay();
}
function handleButtonClick(event) {
  const key = event.target.dataset.key;
  const action = event.target.dataset.action;
  if (action === 'clear') return clearAll();
  if (action === 'backspace') return backspace();
  if (action === 'equals') return evaluateExpression();
  if (key) {
    if (/[0-9]/.test(key) || key === '.') return appendInput(key);
    if (OPERATORS.includes(key)) return appendOperator(key);
  }
}
buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));
// Keyboard support
document.addEventListener('keydown', e => {
  const key = e.key;
  if (/[0-9]/.test(key) || key === '.') {
    e.preventDefault();
    return appendInput(key);
  }
  if (OPERATORS.includes(key)) {
    e.preventDefault();
    return appendOperator(key);
  }
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    return evaluateExpression();
  }
  if (key === 'Backspace') {
    e.preventDefault();
    return backspace();
  }
  if (key.toLowerCase() === 'c') {
    e.preventDefault();
    return clearAll();
  }
});
// Initial display
updateDisplay();
