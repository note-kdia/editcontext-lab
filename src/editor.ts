export function setupEditor(el: HTMLElement): EditContext {
  const ec = new EditContext();
  el.editContext = ec;

  // on textupdate
  ec.addEventListener("textupdate", () => render(el, ec));

  // on beforeinput
  el.addEventListener("beforeinput", (e) => {
    // handled by EditContext (via textupdate)
    if (
      e.inputType === "insertText" ||
      e.inputType === "deleteContentBackward" ||
      e.inputType === "deleteContentForward"
    )
      return;

    // Enter || Shift + Enter
    if (
      e.inputType === "insertParagraph" ||
      e.inputType === "insertLineBreak"
    ) {
      e.preventDefault();

      const start = ec.selectionStart;
      const end = ec.selectionEnd;
      const min = Math.min(start, end);
      ec.updateText(start, end, "\n");
      ec.updateSelection(min + 1, min + 1);
      render(el, ec);
    }
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

  return ec;
}

// renders editor DOM from EditContext
function render(el: HTMLElement, ec: EditContext): void {
  // text sync
  const children: Node[] = [document.createTextNode(ec.text)];
  if (ec.text.endsWith("\n")) children.push(document.createElement("br")); // add <br> to handle empty last line
  el.replaceChildren(...children);

  // selection sync: EditContext -> DOM
  const start = offsetToDom(el, ec.selectionStart);
  const end = offsetToDom(el, ec.selectionEnd);
  document
    .getSelection()
    ?.setBaseAndExtent(start.node, start.offset, end.node, end.offset);
}

// selection sync: EditContext -> DOM
type DomPosition = { node: Node; offset: number };

function offsetToDom(el: HTMLElement, offset: number): DomPosition {
  const text = el.firstChild;
  if (!text) return { node: el, offset: 0 };
  return { node: text, offset };
}

// selection sync: DOM -> EditContext
function domToOffset(el: HTMLElement, node: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(el, 0);
  range.setEnd(node, offset);
  return range.toString().length;
}
