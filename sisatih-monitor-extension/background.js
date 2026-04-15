const ALARM_NAME = "sisatih-neurologia-check";
const CHECK_INTERVAL_MINUTES = 5;

const CONFIG = {
  loginUrl: "https://regulacao.saobernardo.sp.gov.br/sisatih",
  registro: "237722",
  senha: "pmsbc@123",
  especialidade: "neurologia"
};

let isRunning = false;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStorage(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function setStorage(values) {
  return new Promise((resolve) => chrome.storage.local.set(values, resolve));
}

function createAlarm() {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: CHECK_INTERVAL_MINUTES });
}

async function ensureMonitoringDefaults() {
  const data = await getStorage(["monitorEnabled"]);
  if (typeof data.monitorEnabled === "undefined") {
    await setStorage({ monitorEnabled: true });
  }
}

function waitForTabReady(tabId, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    let timeoutId;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };

    const onUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        cleanup();
        resolve();
      }
    };

    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Tempo limite ao aguardar carregamento da aba."));
    }, timeoutMs);

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        cleanup();
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (tab?.status === "complete") {
        cleanup();
        resolve();
        return;
      }

      chrome.tabs.onUpdated.addListener(onUpdated);
    });
  });
}

function sendAutomationStep(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        action: "runSisatihAutomationStep",
        payload: CONFIG
      },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({
            status: "message_error",
            error: chrome.runtime.lastError.message
          });
          return;
        }

        resolve(response || { status: "empty_response" });
      }
    );
  });
}

async function runAutomationInTab(tabId) {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await waitForTabReady(tabId, 45000);
    } catch (error) {
      return { ok: false, reason: error.message };
    }

    const response = await sendAutomationStep(tabId);

    if (response.status === "counted") {
      return {
        ok: true,
        count: response.count,
        totalRows: response.totalRows,
        url: response.url
      };
    }

    if (response.status === "fatal_error") {
      return {
        ok: false,
        reason: response.error || "Falha inesperada no content script."
      };
    }

    await delay(2500);
  }

  return {
    ok: false,
    reason: "Nao foi possivel concluir o fluxo de automacao no tempo esperado."
  };
}

async function runCheckCycle(trigger) {
  if (isRunning) {
    return { ok: false, reason: "Ja existe uma verificacao em execucao." };
  }

  isRunning = true;
  let tabId;

  try {
    await setStorage({
      lastStatus: `Executando verificacao (${trigger})...`,
      lastRunAt: new Date().toISOString()
    });

    const tab = await chrome.tabs.create({
      url: CONFIG.loginUrl,
      active: false
    });
    tabId = tab.id;

    const result = await runAutomationInTab(tabId);
    if (result.ok) {
      await setStorage({
        lastCount: result.count,
        lastCheckedUrl: result.url || "",
        lastStatus: `OK - ${result.count} item(ns) de neurologia encontrado(s).`,
        lastSuccessAt: new Date().toISOString(),
        lastError: null
      });
    } else {
      await setStorage({
        lastStatus: "Falha na verificacao.",
        lastError: result.reason || "Erro desconhecido."
      });
    }

    return result;
  } catch (error) {
    await setStorage({
      lastStatus: "Erro inesperado durante verificacao.",
      lastError: error.message
    });
    return { ok: false, reason: error.message };
  } finally {
    if (typeof tabId === "number") {
      chrome.tabs.remove(tabId, () => {
        if (chrome.runtime.lastError) {
          // Aba pode ter sido fechada manualmente.
        }
      });
    }
    isRunning = false;
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureMonitoringDefaults();
  createAlarm();
  const data = await getStorage(["monitorEnabled"]);
  if (data.monitorEnabled) {
    await runCheckCycle("instalacao");
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureMonitoringDefaults();
  createAlarm();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) {
    return;
  }

  const data = await getStorage(["monitorEnabled"]);
  if (!data.monitorEnabled) {
    return;
  }

  await runCheckCycle("alarme");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === "toggleMonitor") {
    (async () => {
      const enabled = Boolean(message.enabled);
      await setStorage({ monitorEnabled: enabled });

      if (enabled) {
        createAlarm();
        await runCheckCycle("ativacao_manual");
      } else {
        chrome.alarms.clear(ALARM_NAME);
        await setStorage({ lastStatus: "Monitoramento pausado." });
      }

      sendResponse({ ok: true });
    })();
    return true;
  }

  if (message?.action === "runCheckNow") {
    (async () => {
      const result = await runCheckCycle("execucao_manual");
      sendResponse(result);
    })();
    return true;
  }

  if (message?.action === "getMonitorState") {
    (async () => {
      const data = await getStorage([
        "monitorEnabled",
        "lastCount",
        "lastStatus",
        "lastRunAt",
        "lastSuccessAt",
        "lastError",
        "lastCheckedUrl"
      ]);
      sendResponse({
        ...data,
        isRunning
      });
    })();
    return true;
  }

  return undefined;
});
