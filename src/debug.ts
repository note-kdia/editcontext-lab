import { expectElement, describeNode } from "./dom";

export function setupDebug(editor: HTMLElement, ec: EditContext): void {
  const ecState = expectElement<HTMLPreElement>("#ec-state");
  const domHtml = expectElement<HTMLPreElement>("#dom-html");
  const domSelection = expectElement<HTMLPreElement>("#dom-selection");
  const log = expectElement<HTMLOListElement>("#log");

  ec.addEventListener("textupdate", (e) => {
    renderEcState();
    renderDomHtml();
    renderDomSelection();
    addLog(
      `textupdate range=${e.updateRangeStart}-${e.updateRangeEnd} text=${JSON.stringify(e.text)} selection=${e.selectionStart}-${e.selectionEnd}`,
    );
  });

  ec.addEventListener("compositionstart", (e) => {
    addLog(`compositionstart text=${JSON.stringify(e.data)}`);
  });

  ec.addEventListener("compositionend", (e) => {
    addLog(`compositionend text=${JSON.stringify(e.data)}`);
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
    addLog(
      `beforeinput inputType=${e.inputType} data=${JSON.stringify(e.data)}`,
    );
  });

  document.addEventListener("selectionchange", () => {
    const sel = document.getSelection();
    if (!sel || !sel.anchorNode || !sel.focusNode) return;
    if (!editor.contains(sel.anchorNode) || !editor.contains(sel.focusNode))
      return;
    renderEcState();
    renderDomHtml();
    renderDomSelection();
    addLog("selectionchange");
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

  // イベントログのクリア
  const clearLog = expectElement<HTMLButtonElement>("#clear-log");
  clearLog.addEventListener("click", () => {
    log.replaceChildren();
  });

  // イベントログの表示用ハンドラ
  function addLog(message: string) {
    const li = document.createElement("li");
    li.textContent = `${performance.now().toFixed(0)} ${message}`;
    log.prepend(li);
  }
}
