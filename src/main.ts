import { expectElement } from "./dom";
import { setupEditor } from "./editor";
import { setupDebug } from "./debug";

const editor = expectElement<HTMLDivElement>("#editor");
const ec = setupEditor(editor);
setupDebug(editor, ec);
