export function expectElement<T extends Element>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`${selector} not found`);
  return el;
}

export function describeNode(node: Node | null): string {
  if (!node) return "null";
  if (node.nodeType === Node.TEXT_NODE) {
    return `#text ${JSON.stringify(node.textContent)}`;
  }
  if (node instanceof Element) {
    return `<${node.localName}${node.id ? `#${node.id}` : ""}>`;
  }
  return node.nodeName;
}
