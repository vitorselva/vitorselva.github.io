(() => {
  const LOGIN_URL = "https://regulacao.saobernardo.sp.gov.br/sisatih";
  const RESULT_RETRY_MS = 1500;

  function normalize(text) {
    return (text || "").trim().toLowerCase();
  }

  function waitForElement(selector, timeoutMs = 20000) {
    return new Promise((resolve) => {
      const immediate = document.querySelector(selector);
      if (immediate) {
        resolve(immediate);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      window.setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeoutMs);
    });
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function runSisatihAutomationStep(payload) {
    const { registro, senha, especialidade } = payload;
    const currentUrl = window.location.href;

    try {
      const registroInput = document.querySelector("#registro");
      const senhaInput = document.querySelector("#senha");
      const btnAcessar = document.querySelector("button#btnAcessar[type='submit']");

      if (
        currentUrl.includes("/sisatih") &&
        registroInput &&
        senhaInput &&
        btnAcessar
      ) {
        registroInput.focus();
        registroInput.value = registro;
        registroInput.dispatchEvent(new Event("input", { bubbles: true }));
        registroInput.dispatchEvent(new Event("change", { bubbles: true }));

        senhaInput.focus();
        senhaInput.value = senha;
        senhaInput.dispatchEvent(new Event("input", { bubbles: true }));
        senhaInput.dispatchEvent(new Event("change", { bubbles: true }));

        btnAcessar.click();
        return {
          status: "continue",
          step: "login_submitted"
        };
      }

      const especialidadeCells = Array.from(
        document.querySelectorAll("td.coluna-especialidade")
      );

      if (especialidadeCells.length > 0) {
        const match = normalize(especialidade);
        const count = especialidadeCells.filter(
          (cell) => normalize(cell.textContent) === match
        ).length;

        return {
          status: "counted",
          count,
          totalRows: especialidadeCells.length,
          url: currentUrl,
          checkedAt: new Date().toISOString()
        };
      }

      const solicitacoesLink = document.querySelector(
        "a[href='#solicitacoesRecebidasDaUnidadeExecutante']"
      );
      if (solicitacoesLink) {
        solicitacoesLink.click();
        return {
          status: "continue",
          step: "solicitacoes_clicked"
        };
      }

      if (!currentUrl.includes(LOGIN_URL)) {
        window.location.href = LOGIN_URL;
        return {
          status: "continue",
          step: "redirect_login"
        };
      }

      await wait(RESULT_RETRY_MS);
      return {
        status: "continue",
        step: "waiting_elements"
      };
    } catch (error) {
      return {
        status: "fatal_error",
        error: error.message
      };
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action !== "runSisatihAutomationStep") {
      return undefined;
    }

    (async () => {
      const payload = message.payload || {};
      const response = await runSisatihAutomationStep(payload);
      sendResponse(response);
    })();

    return true;
  });

  waitForElement("body", 1000);
})();
