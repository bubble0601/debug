// import "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";

export type FontSizeOptions = {
  types: string[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the text fontSize
       */
      setFontSize: (fontSize: string) => ReturnType;
      /**
       * Unset the text fontSize
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

const recursiveGetStyle = (
  element: HTMLElement | null,
  styleName: string
): string | undefined => {
  if (!element) {
    return undefined;
  }

  const value = element.style.getPropertyValue(styleName);
  if (value !== "") {
    return value;
  }

  return recursiveGetStyle(element.parentElement, styleName);
};

export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => recursiveGetStyle(element, "font-size"),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
