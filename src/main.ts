const editor = expectElement<HTMLDivElement>("#editor");
const ecState = expectElement<HTMLPreElement>("#ec-state");
const domHtml = expectElement<HTMLPreElement>("#dom-html");
const domSelection = expectElement<HTMLPreElement>("#dom-selection");
const log = expectElement<HTMLOListElement>("#log");

const ec = new EditContext();
editor.editContext = ec;

ec.addEventListener("textupdate", () => {
  editor.textContent = ec.text;
  renderEcState();
  renderDomHtml();
});

document.addEventListener("selectionchange", () => {
  const sel = document.getSelection();
  if (!sel || !editor.contains(sel.anchorNode)) return;
  renderDomSelection();
});

// EditContextの状態表示用のハンドラ
function renderEcState() {
  ecState.textContent = [
    ec.text,
    "",
    `selection: ${ec.selectionStart}-${ec.selectionEnd}`,
  ].join("\n");
}

// DOMペインへのHTML表示ハンドラ
function renderDomHtml() {
  domHtml.textContent = editor.innerHTML;
}

// DOMペインのselection表示ハンドラ
function renderDomSelection() {
  const sel = document.getSelection();
  if (!sel) {
    domSelection.textContent = "no selection";
    return;
  }
  domSelection.textContent = [
    `${describeNode(sel.anchorNode)} offset=${sel.anchorOffset}`,
    `${describeNode(sel.focusNode)} offset=${sel.focusOffset}`,
  ].join("\n");
}

function describeNode(node: Node | null): string {
  if (!node) return "null";
  if (node.nodeType === Node.TEXT_NODE) {
    return `#text ${JSON.stringify(node.textContent)}`;
  }
  if (node instanceof Element) {
    return `<${node.localName}${node.id ? `#${node.id}` : ""}>`;
  }
  return node.nodeName;
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
  const sel = document.getSelection();
  if (!sel || !editor.contains(sel.anchorNode)) return;
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
