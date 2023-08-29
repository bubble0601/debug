import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export type IMESupportOptions = {
  types: string[];
};

// 選択範囲の始点が行の最後(改行文字)のときにIME入力を開始すると、次の行の先頭に1文字入力されてしまう問題の対処
export const IMESupport = Extension.create<IMESupportOptions>({
  name: "imeSupport",

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey("imeSupport"),
        props: {
          handleDOMEvents: {
            compositionstart: (view, e) => {
              // e.data.length > 0: テキストを選択してIME入力・変換して未確定の状態で入力を開始すると未確定のテキストが消えてしまう問題の対処
              if (!view.state.selection.empty && e.data.length > 0) {
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
