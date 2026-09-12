let calcExpression = "";
function calculatorHTML() {
  return `<div class="page">
    <div class="section-head"><div><p class="eyebrow">Tools</p><h2>Kalkulator</h2><p class="muted">Hitung cepat kebutuhan usaha kamu.</p></div></div>
    <div class="card">
      <div class="calc-display"><div class="calc-expression" id="calc-expression"></div><div class="calc-result" id="calc-result">0</div></div>
      <div class="calc-keys">
        ${["C","⌫","%","÷","7","8","9","×","4","5","6","−","1","2","3","+","0",".","00","="].map(key => `<button class="calc-key ${["÷","×","−","+","=","%"].includes(key) ? "operator":""} ${key==="="?"equal":""}" data-calc="${key}">${key}</button>`).join("")}
      </div>
    </div>
  </div>`;
}
function updateCalcDisplay() {
  document.getElementById("calc-expression").textContent = calcExpression;
  document.getElementById("calc-result").textContent = calcExpression || "0";
}
function calculateExpression() {
  try {
    let exp = calcExpression.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
    if (!/^[0-9+\-*/().\s]+$/.test(exp)) throw new Error();
    const result = Function(`"use strict"; return (${exp})`)();
    if (!Number.isFinite(result)) throw new Error();
    calcExpression = String(Math.round(result * 100000000) / 100000000);
  } catch { showToast("Perhitungan tidak valid"); }
  updateCalcDisplay();
}