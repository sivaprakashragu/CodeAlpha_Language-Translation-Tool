// BCP-47-style codes the Lara API expects (language-REGION).
const LANGUAGES = {
  "en-US": "English", "es-ES": "Spanish", "fr-FR": "French", "de-DE": "German",
  "it-IT": "Italian", "pt-PT": "Portuguese", "nl-NL": "Dutch", "ru-RU": "Russian",
  "hi-IN": "Hindi", "ta-IN": "Tamil", "te-IN": "Telugu", "kn-IN": "Kannada",
  "ml-IN": "Malayalam", "bn-IN": "Bengali", "gu-IN": "Gujarati", "mr-IN": "Marathi",
  "pa-IN": "Punjabi", "ur-PK": "Urdu", "zh-CN": "Chinese (Simplified)", "ja-JP": "Japanese",
  "ko-KR": "Korean", "ar-SA": "Arabic", "tr-TR": "Turkish", "vi-VN": "Vietnamese",
  "th-TH": "Thai", "id-ID": "Indonesian", "pl-PL": "Polish", "uk-UA": "Ukrainian",
  "el-GR": "Greek", "he-IL": "Hebrew", "sv-SE": "Swedish", "fi-FI": "Finnish"
};

const sourceSel = document.getElementById('sourceLang');
const targetSel = document.getElementById('targetLang');
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapBtn');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const statusEl = document.getElementById('status');
const charCount = document.getElementById('charCount');
const clockEl = document.getElementById('clock');
const footNote = document.getElementById('footNote');

function populateSelect(sel, entries, defaultCode){
  entries.forEach(([code, name]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    if (code === defaultCode) opt.selected = true;
    sel.appendChild(opt);
  });
}
populateSelect(sourceSel, [['auto', 'Auto-detect'], ...Object.entries(LANGUAGES)], 'auto');
populateSelect(targetSel, Object.entries(LANGUAGES), 'fr-FR');

sourceText.addEventListener('input', () => {
  charCount.textContent = sourceText.value.length;
});

function setStatus(msg, type){
  statusEl.textContent = msg || '';
  statusEl.className = 'status' + (type ? ' ' + type : '');
}

// Warn early if the server has no Lara credentials configured.
fetch('/api/health').then(r => r.json()).then(data => {
  if (!data.laraConfigured){
    footNote.classList.add('warn');
    footNote.textContent = 'Lara API credentials are not set on the server. Copy .env.example to .env, add your LARA_ACCESS_KEY_ID / LARA_ACCESS_KEY_SECRET, then restart the Flask app.';
  }
}).catch(() => {});

async function translate(){
  const text = sourceText.value.trim();
  if (!text){
    setStatus('Enter some text first.', 'error');
    sourceText.focus();
    return;
  }

  translateBtn.disabled = true;
  setStatus('Translating…', 'busy');
  targetText.value = '';
  copyBtn.disabled = true;
  speakBtn.disabled = true;

  try{
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source: sourceSel.value,
        target: targetSel.value
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Translation failed');

    targetText.value = data.translation || '';
    finishSuccess();
  }catch(err){
    setStatus(err.message || 'Could not translate right now — check the server and try again.', 'error');
  }finally{
    translateBtn.disabled = false;
  }
}

function finishSuccess(){
  setStatus('Done.', '');
  copyBtn.disabled = false;
  speakBtn.disabled = ('speechSynthesis' in window) ? false : true;
}

translateBtn.addEventListener('click', translate);
sourceText.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') translate();
});

swapBtn.addEventListener('click', () => {
  if (sourceSel.value === 'auto') return; // nothing meaningful to swap from
  const s = sourceSel.value;
  sourceSel.value = targetSel.value;
  targetSel.value = s;
  const t = sourceText.value;
  sourceText.value = targetText.value;
  targetText.value = t;
  charCount.textContent = sourceText.value.length;
  if (targetText.value){
    copyBtn.disabled = false;
    speakBtn.disabled = ('speechSynthesis' in window) ? false : true;
  }
});

copyBtn.addEventListener('click', async () => {
  if (!targetText.value) return;
  try{
    await navigator.clipboard.writeText(targetText.value);
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 1200);
  }catch(e){
    targetText.select();
    document.execCommand('copy');
  }
});

speakBtn.addEventListener('click', () => {
  if (!('speechSynthesis' in window) || !targetText.value) return;
  const utter = new SpeechSynthesisUtterance(targetText.value);
  utter.lang = targetSel.value;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
});

function tick(){
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
tick();
setInterval(tick, 1000 * 30);
