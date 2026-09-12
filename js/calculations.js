function calculateRow(row) {
  const stock = Number(row.stock) || 0;
  const modal = Number(row.modal) || 0;
  const percent = Number(row.percent) || 0;
  const profitValue = modal * (percent / 100);
  const sellingUnit = modal + profitValue;
  const total = stock * sellingUnit;
  return { stock, modal, percent, profitValue, sellingUnit, total };
}
function calculateFileTotals(file) {
  const rows = file.rows || [];
  return rows.reduce((total, row) => {
    const calc = calculateRow(row);
    total.stock += calc.stock;
    total.modal += calc.stock * calc.modal;
    total.afterPercent += calc.stock * calc.sellingUnit;
    total.total += calc.total;
    return total;
  }, { stock:0, modal:0, afterPercent:0, total:0 });
}