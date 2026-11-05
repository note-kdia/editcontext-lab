// EditContext API type declarations (TypeScript's lib.dom does not include them yet).
// https://w3c.github.io/edit-context/

export {};

declare global {
  interface EditContextInit {
    text?: string;
    selectionStart?: number;
    selectionEnd?: number;
  }

  interface EditContextEventMap {
    textupdate: TextUpdateEvent;
    textformatupdate: TextFormatUpdateEvent;
    characterboundsupdate: CharacterBoundsUpdateEvent;
    compositionstart: CompositionEvent;
    compositionend: CompositionEvent;
  }

  interface EditContext extends EventTarget {
    readonly text: string;
    readonly selectionStart: number;
    readonly selectionEnd: number;
    readonly characterBoundsRangeStart: number;

    updateText(rangeStart: number, rangeEnd: number, text: string): void;
    updateSelection(start: number, end: number): void;
    updateControlBounds(controlBounds: DOMRect): void;
    updateSelectionBounds(selectionBounds: DOMRect): void;
    updateCharacterBounds(rangeStart: number, characterBounds: DOMRect[]): void;
    attachedElements(): HTMLElement[];
    characterBounds(): DOMRect[];

    ontextupdate: ((this: EditContext, ev: TextUpdateEvent) => unknown) | null;
    ontextformatupdate: ((this: EditContext, ev: TextFormatUpdateEvent) => unknown) | null;
    oncharacterboundsupdate: ((this: EditContext, ev: CharacterBoundsUpdateEvent) => unknown) | null;
    oncompositionstart: ((this: EditContext, ev: CompositionEvent) => unknown) | null;
    oncompositionend: ((this: EditContext, ev: CompositionEvent) => unknown) | null;

    addEventListener<K extends keyof EditContextEventMap>(
      type: K,
      listener: (this: EditContext, ev: EditContextEventMap[K]) => unknown,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof EditContextEventMap>(
      type: K,
      listener: (this: EditContext, ev: EditContextEventMap[K]) => unknown,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }

  var EditContext: {
    prototype: EditContext;
    new (options?: EditContextInit): EditContext;
  };

  interface TextUpdateEventInit extends EventInit {
    updateRangeStart?: number;
    updateRangeEnd?: number;
    text?: string;
    selectionStart?: number;
    selectionEnd?: number;
  }

  interface TextUpdateEvent extends Event {
    readonly updateRangeStart: number;
    readonly updateRangeEnd: number;
    readonly text: string;
    readonly selectionStart: number;
    readonly selectionEnd: number;
  }

  var TextUpdateEvent: {
    prototype: TextUpdateEvent;
    new (type: string, options?: TextUpdateEventInit): TextUpdateEvent;
  };

  type UnderlineStyle = "none" | "solid" | "dotted" | "dashed" | "wavy";
  type UnderlineThickness = "none" | "thin" | "thick";

  interface TextFormat {
    readonly rangeStart: number;
    readonly rangeEnd: number;
    readonly underlineStyle: UnderlineStyle;
    readonly underlineThickness: UnderlineThickness;
  }

  interface TextFormatUpdateEvent extends Event {
    getTextFormats(): TextFormat[];
  }

  var TextFormatUpdateEvent: {
    prototype: TextFormatUpdateEvent;
    new (type: string, options?: EventInit): TextFormatUpdateEvent;
  };

  interface CharacterBoundsUpdateEventInit extends EventInit {
    rangeStart?: number;
    rangeEnd?: number;
  }

  interface CharacterBoundsUpdateEvent extends Event {
    readonly rangeStart: number;
    readonly rangeEnd: number;
  }

  var CharacterBoundsUpdateEvent: {
    prototype: CharacterBoundsUpdateEvent;
    new (type: string, options?: CharacterBoundsUpdateEventInit): CharacterBoundsUpdateEvent;
  };

  interface HTMLElement {
    editContext: EditContext | null;
  }
}
