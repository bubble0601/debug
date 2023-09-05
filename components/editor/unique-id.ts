import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const randomString = () => Math.random().toString(36).slice(2);

export type UniqueIdOptions = {
  types: string[];
  attributeName: string;
};

// nodeにidを付与する拡張
export const UniqueId = Extension.create<UniqueIdOptions>({
  name: "uniqueId",

  addOptions() {
    return {
      types: ["paragraph"],
      attributeName: "nodeId",
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("uniqueId"),
        appendTransaction: (transactions, _, newState) => {
          if (transactions.every((tr) => !tr.docChanged)) {
            return null;
          }

          const ids = new Set<string>();
          let tr = newState.tr;
          newState.doc.content.forEach((node, i) => {
            if (node.type.name === "paragraph") {
              if (
                node.attrs[this.options.attributeName] == null ||
                ids.has(node.attrs[this.options.attributeName])
              ) {
                tr = tr.setNodeAttribute(
                  i,
                  this.options.attributeName,
                  randomString()
                );
              }
              if (node.attrs[this.options.attributeName] != null) {
                ids.add(node.attrs[this.options.attributeName]);
              }
            }
          });
          return tr;
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.attributeName]: {
            default: null,
            parseHTML: (element) => {
              return element.getAttribute(`data-${this.options.attributeName}`);
            },
            renderHTML: (attributes) => {
              return {
                [`data-${this.options.attributeName}`]:
                  attributes[this.options.attributeName],
              };
            },
            keepOnSplit: false,
          },
        },
      },
    ];
  },
});
