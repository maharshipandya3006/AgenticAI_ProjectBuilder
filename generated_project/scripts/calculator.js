/**
 * Simple Calculator implementation.
 * This script expects the DOM structure defined in index.html.
 * It binds button clicks and keyboard events to build an expression,
 * evaluates it safely, and updates the display.
 */

// Mapping of operator symbols to their corresponding JavaScript functions.
const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

class Calculator {
  /**
   * @type {HTMLElement}
   */
  displayElement;
  /** @type {string} */
  currentInput = '';
  /** @type {string} */
  lastResult = '';

  constructor() {
    // Grab the display element.
    this.displayElement = document.getElementById('display');
    if (!this.displayElement) {
      console.error('Calculator: #display element not found');
      return;
    }

    // Bind button clicks.
    const buttons = document.querySelectorAll('button[data-key]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', this.handleButtonClick.bind(this));
    });

    // Bind keyboard input.
    document.addEventListener('keydown', this.handleKeyPress.bind(this));

    // Initialise display.
    this.updateDisplay('');
  }

  /** Handle click events from calculator buttons */
  handleButtonClick(event) {
    const key = event.target.dataset.key;
    if (key) {
      this.processInput(key);
    }
  }

  /** Handle physical keyboard presses */
  handleKeyPress(event) {
    const keyMap = {
      Enter: '=',
      '=': '=',
      Backspace: 'Backspace',
      Delete: 'c', // treat Delete as clear
    };
    let key = event.key;
    // Normalise to lower case for numbers and letters where appropriate.
    if (/^[0-9]$/.test(key) || key === '.' || ['+', '-', '*', '/'].includes(key)) {
      // use the key directly
    } else if (keyMap[key] !== undefined) {
      key = keyMap[key];
    } else {
      // ignore any other keys
      return;
    }
    event.preventDefault();
    this.processInput(key);
  }

  /** Process a logical key (from button or keyboard) */
  processInput(key) {
    const isOperator = Object.keys(OPERATORS).includes(key);
    switch (key) {
      case 'c':
      case 'C':
        this.clear();
        break;
      case 'Backspace':
        this.backspace();
        break;
      case 'Enter': // button click provides "Enter"
      case '=':
        this.evaluate();
        break;
      case '.':
        // Prevent multiple decimals in a single number segment.
        if (!this._canAppendDecimal()) return;
        this.currentInput += '.';
        this.updateDisplay(this.currentInput);
        break;
      default:
        if (/^[0-9]$/.test(key)) {
          this.currentInput += key;
          this.updateDisplay(this.currentInput);
        } else if (isOperator) {
          // Add spacing around operators for readability.
          this.currentInput = this.currentInput.trimEnd();
          this.currentInput += ` ${key} `;
          this.updateDisplay(this.currentInput);
        }
        break;
    }
  }

  /** Determine if a decimal point can be appended to the current number segment */
  _canAppendDecimal() {
    // Look at the part after the last operator (or whole string).
    const parts = this.currentInput.split(/\s[+\-*/]\s/);
    const lastPart = parts[parts.length - 1];
    return !lastPart.includes('.');
  }

  /** Evaluate the current expression safely */
  evaluate() {
    // Trim whitespace.
    const expression = this.currentInput.trim();
    if (!expression) {
      this.updateDisplay('', false);
      return;
    }

    // Simple division‑by‑zero detection before evaluation.
    if (/\/\s*0(?!\d)/.test(expression)) {
      this.updateDisplay('Error: Division by zero', true);
      return;
    }

    // Sanitize: allow only numbers, operators, decimal points, parentheses and whitespace.
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    let result;
    try {
      // Using Function constructor for evaluation.
      // eslint-disable-next-line no-new-func
      result = Function('return ' + sanitized)();
    } catch (e) {
      this.updateDisplay('Error', true);
      return;
    }

    if (typeof result === 'number' && !Number.isFinite(result)) {
      this.updateDisplay('Error', true);
      return;
    }

    // Round result to a reasonable number of decimal places to avoid floating point noise.
    const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/\.?(0)+$/, '');
    this.lastResult = formatted;
    this.currentInput = formatted;
    this.updateDisplay(formatted, false);
  }

  /** Clear the current input and reset display */
  clear() {
    this.currentInput = '';
    this.lastResult = '';
    this.updateDisplay('', false);
  }

  /** Remove the last character (or operator spacing) from the input */
  backspace() {
    if (!this.currentInput) return;
    // Remove trailing whitespace first.
    this.currentInput = this.currentInput.replace(/\s+$/g, '');
    // Remove the last character.
    this.currentInput = this.currentInput.slice(0, -1);
    this.updateDisplay(this.currentInput, false);
  }

  /** Update the visual display. If `isError` is true, apply the .error CSS class. */
  updateDisplay(value, isError = false) {
    if (!this.displayElement) return;
    this.displayElement.textContent = value;
    if (isError) {
      this.displayElement.classList.add('error');
    } else {
      this.displayElement.classList.remove('error');
    }
  }
}

// Export a singleton instance for potential external use.
const calculator = new Calculator();

// Ensure the calculator is initialised after the DOM is ready.
document.addEventListener('DOMContentLoaded', () => new Calculator());
