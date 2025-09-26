(function () {
  function $(selector) { return document.querySelector(selector); }

  var input = $('#input-url');
  var output = $('#output-url');
  var result = $('#result');
  var convertBtn = $('#convert-btn');
  var clearBtn = $('#clear-btn');
  var copyBtn = $('#copy-btn');
  var openBtn = $('#open-btn');

  function extractStudyUID(url) {
    try {
      var u = new URL(url);
      if (!/^(https?:)?\/\/onelaudos\.mobilemed\.com\.br$/i.test(u.origin)) return null;
      var parts = u.pathname.split('/').filter(Boolean);
      var viewerIndex = parts.indexOf('viewer');
      if (viewerIndex === -1 || viewerIndex + 1 >= parts.length) return null;
      var xy = parts[viewerIndex + 1];
      if (!xy || !/^\d+(?:\.\d+)+$/.test(xy)) return null;
      return xy;
    } catch (e) {
      return null;
    }
  }

  function buildPmsbcUrl(studyUID) {
    var base = 'https://pmsbc.mobilemed.com.br/client-api/patients/download/zip';
    var params = new URLSearchParams({ studyUID: studyUID });
    return base + '?' + params.toString();
  }

  function convert() {
    var value = (input.value || '').trim();
    var uid = extractStudyUID(value);
    if (!uid) {
      result.classList.add('oculto');
      alert('URL inválida. Use um link do OneLaudos: https://onelaudos.mobilemed.com.br/viewer/XY/...');
      return;
    }
    var finalUrl = buildPmsbcUrl(uid);
    output.value = finalUrl;
    openBtn.href = finalUrl;
    result.classList.remove('oculto');
  }

  function clearAll() {
    input.value = '';
    output.value = '';
    result.classList.add('oculto');
    input.focus();
  }

  function copy() {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(function () {
      copyBtn.textContent = 'Copiado!';
      setTimeout(function () { copyBtn.textContent = 'Copiar'; }, 1200);
    });
  }

  convertBtn.addEventListener('click', convert);
  clearBtn.addEventListener('click', clearAll);
  copyBtn.addEventListener('click', copy);
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); convert(); }
  });

  // Auto-converter se houver ?url= na query string
  try {
    var qs = new URLSearchParams(location.search);
    var pre = qs.get('url');
    if (pre) { input.value = pre; convert(); }
  } catch (e) { /* ignore */ }
})();

