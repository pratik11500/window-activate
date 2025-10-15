document.getElementById("submitBtn").addEventListener("click", () => {
  const input = document.getElementById("passwordInput");
  const currentTime = new Date();
  const correctPassword =
    String(currentTime.getHours()).padStart(2, "0") +
    String(currentTime.getMinutes()).padStart(2, "0");

  if (input.value === correctPassword) {
    const step1 = document.getElementById("step1");
    step1.innerHTML = `
      <h2>Step 1: Activation Key</h2>
      <p class="key-display">Your Windows Key:</p>
      <h3>WINDO-WSKEY-2025-VALID</h3>
    `;
  } else {
    alert("❌ Wrong password! Try again.");
  }
});
