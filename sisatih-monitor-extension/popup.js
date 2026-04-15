const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const lastRunEl = document.getElementById("lastRun");
const urlEl = document.getElementById("url");
const runNowBtn = document.getElementById("runNow");
const toggleBtn = document.getElementById("toggle");

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

async function loadStatus() {
  const data = await chrome.storage.local.get({
    monitorEnabled: true,
    lastCount: 0,
    lastRunAt: null,
    lastError: null,
    lastStatus: "Sem execucoes.",
    lastCheckedUrl: "-"
  });

  countEl.textContent = String(data.lastCount ?? 0);
  lastRunEl.textContent = formatDate(data.lastRunAt);
  urlEl.textContent = data.lastCheckedUrl || "-";

  const monitorText = data.monitorEnabled ? "Monitoramento ativo." : "Monitoramento pausado.";
  const errorText = data.lastError ? ` Erro: ${data.lastError}` : "";
  statusEl.textContent = `${monitorText} ${data.lastStatus || ""}${errorText}`.trim();
  toggleBtn.textContent = data.monitorEnabled ? "Pausar" : "Retomar";
}

runNowBtn.addEventListener("click", async () => {
  runNowBtn.disabled = true;
  runNowBtn.textContent = "Executando...";
  await chrome.runtime.sendMessage({ action: "runCheckNow" });
  await loadStatus();
  runNowBtn.disabled = false;
  runNowBtn.textContent = "Verificar agora";
});

toggleBtn.addEventListener("click", async () => {
  toggleBtn.disabled = true;
  const data = await chrome.storage.local.get({ monitorEnabled: true });
  await chrome.runtime.sendMessage({
    action: "toggleMonitor",
    enabled: !data.monitorEnabled
  });
  await loadStatus();
  toggleBtn.disabled = false;
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local") return;
  if (
    changes.lastCount ||
    changes.lastRunAt ||
    changes.lastCheckedUrl ||
    changes.lastError ||
    changes.monitorEnabled ||
    changes.lastStatus
  ) {
    await loadStatus();
  }
});

loadStatus();
