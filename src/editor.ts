import "./editor.css";

export function setupEditor(el: HTMLElement): EditContext {
  const ec = new EditContext();
  el.editContext = ec;
  el.classList.add("editor");

  let formats: TextFormat[] = [];

  // on textupdate
  ec.addEventListener("textupdate", () => render(el, ec, formats));

  // on beforeinput
  el.addEventListener("beforeinput", (e) => {
    // handled cases `break` -> preventDefault -> render below
    // unhandled cases `return`
    switch (e.inputType) {
      // handled by EditContext (via textupdate)
      case "insertText":
      case "deleteContentBackward":
      case "deleteContentForward":
        return;

      // Enter || Shift + Enter
      case "insertParagraph":
      case "insertLineBreak":
        replaceSelection(ec, "\n");
        break;

      // Ctrl-V (Paste)
      case "insertFromPaste": {
        const text = e.dataTransfer?.getData("text/plain") ?? "";
        replaceSelection(ec, text.replace(/\r\n?/g, "\n"));
        break;
      }

      // Ctrl-X (Cut)
      case "deleteByCut":
        replaceSelection(ec, "");
        break;

      // not handled yet
      default:
        return;
    }

    e.preventDefault();
    render(el, ec, formats);
  });

  // on selectionchange
  document.addEventListener("selectionchange", () => {
    const sel = document.getSelection();
    if (!sel || !sel.anchorNode || !sel.focusNode) return;
    if (!el.contains(sel.anchorNode) || !el.contains(sel.focusNode)) return;

    const anchor = domToOffset(el, sel.anchorNode, sel.anchorOffset);
    const focus = domToOffset(el, sel.focusNode, sel.focusOffset);
    ec.updateSelection(anchor, focus);
  });

  // on textformatupdate
  ec.addEventListener("textformatupdate", (e) => {
    formats = e.getTextFormats();
    render(el, ec, formats);
  });

  // on characterboundsupdate
  ec.addEventListener("characterboundsupdate", (e) => {
    const rects: DOMRect[] = [];
    for (let i = e.rangeStart; i < e.rangeEnd; i++) {
      rects.push(charRect(el, i));
    }
    ec.updateCharacterBounds(e.rangeStart, rects);
  });

  // on compositionend
  ec.addEventListener("compositionend", () => {
    formats = []; // clear underlines on compositionend
    render(el, ec, formats);
  });

  return ec;
}

// replace selection with text
function replaceSelection(ec: EditContext, text: string): void {
  const start = Math.min(ec.selectionStart, ec.selectionEnd);
  ec.updateText(ec.selectionStart, ec.selectionEnd, text);
  ec.updateSelection(start + text.length, start + text.length);
}

// renders editor DOM from EditContext
function render(el: HTMLElement, ec: EditContext, formats: TextFormat[]): void {
  // text sync
  el.replaceChildren(...buildNodes(ec.text, formats));

  // selection sync: EditContext -> DOM
  const start = offsetToDom(el, ec.selectionStart);
  const end = offsetToDom(el, ec.selectionEnd);
  document
    .getSelection()
    ?.setBaseAndExtent(start.node, start.offset, end.node, end.offset);
}

function buildNodes(text: string, formats: TextFormat[]): Node[] {
  const nodes: Node[] = [];
  let pos = 0;
  const sorted = [...formats].sort((a, b) => a.rangeStart - b.rangeStart);

  for (const f of sorted) {
    if (pos < f.rangeStart) {
      nodes.push(document.createTextNode(text.slice(pos, f.rangeStart)));
    }
    const span = document.createElement("span");
    span.textContent = text.slice(f.rangeStart, f.rangeEnd);
    applyUnderline(span, f);
    nodes.push(span);
    pos = f.rangeEnd;
  }
  if (pos < text.length) {
    nodes.push(document.createTextNode(text.slice(pos)));
  }
  if (text.endsWith("\n")) nodes.push(document.createElement("br"));
  return nodes;
}

function applyUnderline(span: HTMLElement, f: TextFormat): void {
  span.dataset.underline = f.underlineStyle;
  span.dataset.thickness = f.underlineThickness;
}

// selection sync: EditContext -> DOM
type DomPosition = { node: Node; offset: number };

function offsetToDom(el: HTMLElement, offset: number): DomPosition {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const len = node.textContent?.length ?? 0;
    if (remaining <= len) return { node, offset: remaining };
    remaining -= len;
  }
  return { node: el, offset: 0 }; // テキストが空のとき
}

function charRect(el: HTMLElement, offset: number): DOMRect {
  const start = offsetToDom(el, offset);
  const end = offsetToDom(el, offset + 1);
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset);
  return range.getBoundingClientRect();
}

// selection sync: DOM -> EditContext
function domToOffset(el: HTMLElement, node: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(el, 0);
  range.setEnd(node, offset);
  return range.toString().length;
}
