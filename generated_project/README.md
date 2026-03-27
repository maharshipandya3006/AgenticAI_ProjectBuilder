# SimpleCalculator

A lightweight web-based calculator that performs basic arithmetic operations directly in the browser. No build steps or server required—just open the HTML file.

<img width="2560" height="1664" alt="image" src="https://github.com/user-attachments/assets/81e9e4a0-9503-4756-8254-020e347896d4" />
<img width="2560" height="1664" alt="image" src="https://github.com/user-attachments/assets/323f972c-35ce-431e-a5be-624f7e0818cc" />


## Setup

1. Clone or download the repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari). The calculator loads instantly; no npm install or build process is needed.

## Usage

- **Click Buttons**: Use the on‑screen buttons to input numbers and operators.
- **Keyboard**: Type numbers (`0‑9`), operators (`+ - * /`), `Enter` to evaluate, `Backspace` to delete the last character, and `Esc` to clear the display.
- **Clear**: Press the `C` button or `Esc` to reset the calculator.
- **Backspace**: Press the `←` button or the `Backspace` key to remove the most recent entry.
- **Display**: The top display shows the current expression. After evaluation, the result replaces the expression.

### Error Messages
- **Division by zero** – Shows `Error: Division by zero` when attempting to divide a number by zero.
- **Incomplete expression** – Shows `Error: Incomplete expression` if the expression ends with an operator or is otherwise malformed.

## Features

- Basic arithmetic: addition, subtraction, multiplication, division
- Keyboard support for numbers, operators, evaluation, clear, and backspace
- Real‑time expression display
- Graceful error handling for division by zero and malformed expressions
- Responsive design for desktop and mobile browsers

## Tech Stack

- **HTML** – Structure of the calculator UI
- **CSS** – Styling and responsive layout
- **JavaScript** – Core logic, event handling, and calculations

## Contributing

1. Fork the repository.
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/simple-calculator.git
   cd simple-calculator
   ```
3. (Optional) Run a local server to test changes, e.g., `python -m http.server` or any static file server.
4. Make your improvements.
5. Commit and push to your fork.
6. Open a Pull Request describing the changes.

## License

MIT License (see `LICENSE` file).
