
(() => {
    "use strict";

    // ==========================================
    // PART 1: LOGIC GATE SIMULATOR
    // ==========================================

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
            const output = document.querySelector(
                `[data-output="${gate}"]`
            );

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

    [inputA, inputB].forEach(button => {
        button?.addEventListener("click", () => {
            button.setAttribute(
                "aria-pressed",
                String(button.getAttribute("aria-pressed") !== "true")
            );

            updateGates();
        });
    });

    updateGates();

    // ==========================================
    // PART 2: NUMBER SYSTEM CONVERTER
    // ==========================================

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

    // Maximum displayed fractional digits.
    const MAX_FRACTION_DIGITS = 16;

    // ==========================================
    // PART 3: PARSE DIGITS
    // ==========================================

    function parseDigits(text, base) {
        if (!text) return 0n;

        let total = 0n;
        const radix = BigInt(base);

        for (const char of text) {
            const digit = digitValues.indexOf(char);

            if (digit < 0 || digit >= base) {
                throw new Error(
                    `"${char}" is not a valid digit in base ${base}.`
                );
            }

            total = total * radix + BigInt(digit);
        }

        return total;
    }

    // ==========================================
    // PART 4: PARSE WHOLE + FRACTIONAL NUMBERS
    // ==========================================

    function parseNumber(value, base) {
        let text = value
            .trim()
            .replaceAll("_", "")
            .toUpperCase();

        if (!text) {
            throw new Error("Enter a number to convert.");
        }

        let sign = 1n;

        if (text.startsWith("-")) {
            sign = -1n;
            text = text.slice(1);
        } else if (text.startsWith("+")) {
            text = text.slice(1);
        }

        if (!text) {
            throw new Error("Enter digits after the sign.");
        }

        // Check that only one decimal separator exists.
        const firstDot = text.indexOf(".");
        const lastDot = text.lastIndexOf(".");

        if (firstDot !== lastDot) {
            throw new Error("A number can contain only one decimal point.");
        }

        let integerText;
        let fractionText;

        if (firstDot === -1) {
            integerText = text;
            fractionText = "";
        } else {
            integerText = text.slice(0, firstDot);
            fractionText = text.slice(firstDot + 1);
        }

        if (!integerText && !fractionText) {
            throw new Error("Enter valid digits.");
        }

        // Convert integer and fractional parts separately.
        const integerValue = parseDigits(integerText, base);
        const fractionValue = parseDigits(fractionText, base);

        // For example, in base 10:
        // 10.12 = 1012 / 100
        //
        // In base 2:
        // 10.11 = 1011 / 100

        const denominator =
            BigInt(base) ** BigInt(fractionText.length);

        const numerator =
            (integerValue * denominator + fractionValue) * sign;

        return {
            numerator,
            denominator
        };
    }

    // ==========================================
    // PART 5: CONVERT TO ANOTHER BASE
    // ==========================================

    function convertToBase(number, targetBase) {
        let { numerator, denominator } = number;

        if (numerator === 0n) {
            return "0";
        }

        const negative = numerator < 0n;

        if (negative) {
            numerator = -numerator;
        }

        // Calculate whole number part.
        const integerPart = numerator / denominator;

        // Calculate fractional remainder.
        let remainder = numerator % denominator;

        let result = integerPart
            .toString(targetBase)
            .toUpperCase();

        // If the number has no fractional part.
        if (remainder === 0n) {
            return (negative ? "-" : "") + result;
        }

        let fraction = "";
        const radix = BigInt(targetBase);

        // Calculate fractional digits one by one.
        for (
            let i = 0;
            i < MAX_FRACTION_DIGITS && remainder !== 0n;
            i++
        ) {
            remainder *= radix;

            const digit = remainder / denominator;

            remainder %= denominator;

            fraction += digitValues[Number(digit)];
        }

        // Mark results that continue beyond 16 digits.
        if (remainder !== 0n) {
            fraction += "…";
        }

        const sign = negative ? "-" : "";

        return sign + result + "." + fraction;
    }

    // ==========================================
    // PART 6: UPDATE ALL CONVERSION RESULTS
    // ==========================================

    function resetOutputs() {
        Object.values(outputs).forEach(output => {
            if (output) {
                output.textContent = "—";
            }
        });
    }

    function convert() {
        if (!numberInput || !fromBase) return;

        const rawValue = numberInput.value.trim();

        if (!rawValue) {
            resetOutputs();

            if (errorBox) {
                errorBox.hidden = true;
            }

            numberInput.setAttribute("aria-invalid", "false");
            return;
        }

        try {
            const sourceBase = Number(fromBase.value);

            if (![2, 8, 10, 16].includes(sourceBase)) {
                throw new Error("Select a valid number system.");
            }

            const number = parseNumber(rawValue, sourceBase);

            // Convert into all four number systems.
            Object.entries(outputs).forEach(([base, output]) => {
                if (output) {
                    output.textContent = convertToBase(
                        number,
                        Number(base)
                    );
                }
            });

            if (errorBox) {
                errorBox.hidden = true;
            }

            numberInput.setAttribute("aria-invalid", "false");

        } catch (error) {
            resetOutputs();

            if (errorBox) {
                errorBox.textContent = error.message;
                errorBox.hidden = false;
            }

            numberInput.setAttribute("aria-invalid", "true");
        }
    }

    // ==========================================
    // PART 7: INPUT EVENT LISTENERS
    // ==========================================

    numberInput?.addEventListener("input", convert);

    fromBase?.addEventListener("change", convert);

    // ==========================================
    // PART 8: CLEAR BUTTON
    // ==========================================

    document
        .getElementById("clearConverter")
        ?.addEventListener("click", () => {

            if (!numberInput) return;

            numberInput.value = "";

            convert();

            numberInput.focus();
        });

    // ==========================================
    // PART 9: COPY RESULT BUTTONS
    // ==========================================

    document.querySelectorAll("[data-copy]").forEach(button => {

        button.addEventListener("click", async () => {

            const target = document.getElementById(
                button.dataset.copy
            );

            const value = target?.textContent || "";

            if (!value || value === "—") return;

            try {
                await navigator.clipboard.writeText(value);

                const original = button.textContent;

                button.textContent = "Copied";

                window.setTimeout(() => {
                    button.textContent = original;
                }, 1000);

            } catch {
                if (errorBox) {
                    errorBox.textContent =
                        "Clipboard access is unavailable. Please copy the result manually.";

                    errorBox.hidden = false;
                }
            }
        });
    });

})();
