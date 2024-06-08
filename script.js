document.addEventListener("DOMContentLoaded", () => {
  const encodeBtn = document.getElementById("encodeBtn");
  const outputDiv = document.getElementById("output");

  encodeBtn.addEventListener("click", () => {
    const input = document.getElementById("binaryInput").value;
    const encodedData = reedSolomonEncode(input);
    outputDiv.innerText = `Encoded Data: ${encodedData}`;
  });

  // Galois Field parameters
  const gfSize = 256;
  const primitivePolynomial = 0x11d; // Primitive polynomial for GF(2^8)

  // Generate Galois Field tables
  const gfExp = new Array(gfSize * 2);
  const gfLog = new Array(gfSize);
  generateGaloisField();

  function reedSolomonEncode(data) {
    const k = 4; // Number of data symbols
    const n = 7; // Codeword length (n = 2^m - 1)
    const generator = generateGeneratorPolynomial(n - k);

    // Convert input binary string to array of integers
    let message = data.split("").map((bit) => parseInt(bit, 2));
    while (message.length < k) {
      message.push(0); // Padding if input is shorter than k
    }

    // Calculate parity symbols
    let parity = Array(n - k).fill(0);
    for (let i = 0; i < k; i++) {
      let coef = message[i] ^ parity[0];
      parity.shift();
      parity.push(0);
      if (coef !== 0) {
        for (let j = 0; j < generator.length; j++) {
          parity[j] ^= gfMultiply(coef, generator[j]);
        }
      }
    }

    // Combine message and parity
    return [...message, ...parity].join("");
  }

  function generateGaloisField() {
    let x = 1;
    for (let i = 0; i < gfSize; i++) {
      gfExp[i] = x;
      gfLog[x] = i;
      x <<= 1;
      if (x & gfSize) {
        x ^= primitivePolynomial;
      }
    }
    for (let i = gfSize; i < gfExp.length; i++) {
      gfExp[i] = gfExp[i - gfSize];
    }
  }

  function gfAdd(x, y) {
    return x ^ y;
  }

  function gfSubtract(x, y) {
    return x ^ y;
  }

  function gfMultiply(x, y) {
    if (x === 0 || y === 0) {
      return 0;
    }
    return gfExp[gfLog[x] + gfLog[y]];
  }

  function gfDivide(x, y) {
    if (y === 0) {
      throw new Error("Division by zero");
    }
    if (x === 0) {
      return 0;
    }
    return gfExp[(gfLog[x] + gfSize - gfLog[y]) % (gfSize - 1)];
  }

  function generateGeneratorPolynomial(degree) {
    let generator = [1];
    for (let i = 0; i < degree; i++) {
      let term = [1];
      for (let j = 0; j < i; j++) {
        term.push(gfMultiply(generator[j], gfExp[i]));
      }
      for (let j = 0; j < term.length; j++) {
        if (generator[j] !== undefined) {
          term[j] = gfAdd(term[j], generator[j]);
        }
      }
      generator = term;
    }
    return generator;
  }
});
