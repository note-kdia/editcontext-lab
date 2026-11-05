export function setupEditor(el: HTMLElement): EditContext {
  const ec = new EditContext();
  el.editContext = ec;

  ec.addEventListener("textupdate", () => render(el, ec));
  return ec;
}

function render(el: HTMLElement, ec: EditContext) {
  el.textContent = ec.text;
}
