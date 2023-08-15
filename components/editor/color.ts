// import "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";

export type ColorOptions = {
  types: string[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    color: {
      /**
       * Set the text color
       */
      setColor: (color: string) => ReturnType;
      /**
       * Unset the text color
       */
      unsetColor: () => ReturnType;
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

export const Color = Extension.create<ColorOptions>({
  name: "color",

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
          color: {
            default: null,
            parseHTML: (element) =>
              recursiveGetStyle(element, "color")?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.color) {
                return {};
              }

              return {
                style: `color: ${attributes.color}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setColor:
        (color) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { color }).run();
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { color: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
