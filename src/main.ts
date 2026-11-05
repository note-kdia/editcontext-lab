const editor = expectElement<HTMLDivElement>("#editor");
const ecState = expectElement<HTMLPreElement>("#ec-state");
const log = expectElement<HTMLOListElement>("#log");

const ec = new EditContext();
editor.editContext = ec;

ec.addEventListener("textupdate", () => {
  editor.textContent = ec.text;
  renderEcState();
});

// EditContextの状態表示用のハンドラ
function renderEcState() {
  ecState.textContent = [
    `text: ${JSON.stringify(ec.text)}`,
    `selection: ${ec.selectionStart}-${ec.selectionEnd}`,
  ].join("\n");
}

// イベントログの登録
ec.addEventListener("textupdate", (e) => {
  addLog(
    `textupdate range=${e.updateRangeStart}-${e.updateRangeEnd} text=${JSON.stringify(e.text)} selection=${e.selectionStart}-${e.selectionEnd}`,
  );
});

ec.addEventListener("compositionstart", (e) => {
  addLog(
    `compositionstart text=${JSON.stringify(e.data)}`,
  );
});

ec.addEventListener("compositionend", (e) => {
  addLog(
    `compositionend text=${JSON.stringify(e.data)}`,
  );
});

ec.addEventListener("textformatupdate", (e) => {
  const formats = e.getTextFormats().map((f) => ({
    range: `${f.rangeStart}-${f.rangeEnd}`,
    underlineStyle: f.underlineStyle,
    underlineThickness: f.underlineThickness,
  }));
  addLog(`textformatupdate formats=${JSON.stringify(formats)}`);
});

ec.addEventListener("characterboundsupdate", (e) => {
  addLog(`characterboundsupdate range=${e.rangeStart}-${e.rangeEnd}`);
});

editor.addEventListener("keydown", (e) => {
  addLog(`keydown key=${JSON.stringify(e.key)} isComposing=${e.isComposing}`);
});

editor.addEventListener("beforeinput", (e) => {
  addLog(`beforeinput inputType=${e.inputType} data=${JSON.stringify(e.data)}`);
});

document.addEventListener("selectionchange", () => {
  addLog("selectionchange");
});

// イベントログの表示用のハンドラ
function addLog(message: string) {
  const li = document.createElement("li");
  li.textContent = `${performance.now().toFixed(0)} ${message}`
  log.prepend(li);
}

// イベントログのクリア
const clearLog = expectElement<HTMLButtonElement>("#clear-log");
clearLog.addEventListener("click", () => {
  log.replaceChildren();
})

// util
function expectElement<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`${selector} not found`);
  return el;
}
