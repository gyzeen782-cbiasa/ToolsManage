async function exportBackup() {
  const payload = { files: await dbGetAll("files"), notes: await dbGetAll("notes"), settings: await dbGetAll("settings"), exportedAt: nowISO() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=`profit-kalkukator-backup-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(url); showToast("Backup berhasil dibuat");
}
function importBackup() {
  const input = document.createElement("input"); input.type="file"; input.accept=".json,application/json";
  input.onchange = async () => {
    const file = input.files[0]; if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.files) || !Array.isArray(payload.notes)) throw new Error();
      for (const item of payload.files) await dbPut("files", item);
      for (const item of payload.notes) await dbPut("notes", item);
      if (Array.isArray(payload.settings)) for (const item of payload.settings) await dbPut("settings", item);
      showToast("Backup berhasil dipulihkan"); navigate("home");
    } catch { showToast("File backup tidak valid"); }
  };
  input.click();
}