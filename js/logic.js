(() => {
  "use strict";
  const inputA = document.querySelector('[data-bit="A"]');
  const inputB = document.querySelector('[data-bit="B"]');

  function updateGates() {
    const a = Number(inputA?.getAttribute("aria-pressed") === "true");
    const b = Number(inputB?.getAttribute("aria-pressed") === "true");
    const values = {
      AND: a & b,
      OR: a | b,
      NOT: Number(!a),
      NAND: Number(!(a & b)),
      NOR: Number(!(a | b)),
      XOR: a ^ b,
      XNOR: Number(!(a ^ b))
    };
    Object.entries(values).forEach(([gate, value]) => {
      const output = document.querySelector(`[data-output="${gate}"]`);
      if (output) {
        output.textContent = String(value);
        output.classList.toggle("output-one", value === 1);
      }
    });
    [inputA, inputB].forEach(button => {
      if (!button) return;
      const on = button.getAttribute("aria-pressed") === "true";
      button.textContent = on ? "1" : "0";
      button.classList.toggle("bit-on", on);
    });
  }
  [inputA, inputB].forEach(button => button?.addEventListener("click", () => {
    button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
    updateGates();
  }));
  updateGates();

  const numberInput = document.getElementById("numberInput");
  const fromBase = document.getElementById("fromBase");
  const errorBox = document.getElementById("conversionError");
  const outputs = {
    2: document.getElementById("binaryResult"),
    8: document.getElementById("octalResult"),
    10: document.getElementById("decimalResult"),
    16: document.getElementById("hexResult")
  };
  const digitValues = "0123456789ABCDEF";

  function parseInteger(value, base) {
    let text = value.trim().replaceAll("_", "");
    if (!text) throw new Error("Enter a number to convert.");
    let sign = 1n;
    if (text.startsWith("-")) {
      sign = -1n;
      text = text.slice(1);
    } else if (text.startsWith("+")) {
      text = text.slice(1);
    }
    if (!text) throw new Error("Enter digits after the sign.");
    text = text.toUpperCase();
    let total = 0n;
    const radix = BigInt(base);
    for (const char of text) {
      const digit = digitValues.indexOf(char);
      if (digit < 0 || digit >= base) {
        throw new Error(`"${char}" is not a valid digit in base ${base}.`);
      }
      total = total * radix + BigInt(digit);
    }
    return total * sign;
  }

  function convert() {
    if (!numberInput || !fromBase) return;
    try {
      const value = parseInteger(numberInput.value, Number(fromBase.value));
      outputs[2].textContent = value.toString(2);
      outputs[8].textContent = value.toString(8);
      outputs[10].textContent = value.toString(10);
      outputs[16].textContent = value.toString(16).toUpperCase();
      errorBox.hidden = true;
      numberInput.setAttribute("aria-invalid", "false");
    } catch (error) {
      Object.values(outputs).forEach(output => output.textContent = "—");
      if (numberInput.value.trim() === "") {
        errorBox.hidden = true;
        numberInput.setAttribute("aria-invalid", "false");
      } else {
        errorBox.textContent = error.message;
        errorBox.hidden = false;
        numberInput.setAttribute("aria-invalid", "true");
      }
    }
  }
  numberInput?.addEventListener("input", convert);
  fromBase?.addEventListener("change", convert);
  document.getElementById("clearConverter")?.addEventListener("click", () => {
    numberInput.value = "";
    convert();
    numberInput.focus();
  });
  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copy);
      const value = target?.textContent || "";
      if (!value || value === "—") return;
      try {
        await navigator.clipboard.writeText(value);
        const original = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = original; }, 1000);
      } catch {
        errorBox.textContent = "Clipboard access is unavailable. You can select and copy the result manually.";
        errorBox.hidden = false;
      }
    });
  });
})();
