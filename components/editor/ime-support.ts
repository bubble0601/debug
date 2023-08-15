import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export type IMESupportOptions = {
  types: string[];
};

export const IMESupport = Extension.create<IMESupportOptions>({
  name: "imeSupport",

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey("imeSupport"),
        props: {
          handleDOMEvents: {
            compositionstart: (view) => {
              if (!view.state.selection.empty) {
                editor.commands.deleteSelection();
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
