import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// const isSafari =
//   typeof document !== "undefined"
//     ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
//     : false;

// https://github.com/ProseMirror/prosemirror/issues/934
export const SafariWorkaround = Extension.create<Record<string, never>>({
  name: "safariWorkaround",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("safariWorkaround"),
        props: {
          handleDOMEvents: {
            beforeinput: (_, event) => {
              // console.log("beforeinput", event);
              // return false;
              if (event.inputType !== "deleteCompositionText") {
                return false;
              }
              const selection = window.getSelection();
              const range = selection?.getRangeAt(0);
              if (!range) {
                return false;
              }
              const { startContainer, endContainer, endOffset, startOffset } =
                range;
              /**
               * On Safari when composition text is deleted, it deletes any empty elements it finds up the dom tree. Prosemirror can sometimes be confused by this
               * and will think that we meant to delete those elements. This fix forces the resulting node to not be empty.
               * The condition here checks to see if the entire text node is about to be swapped inside of an element
               */
              if (
                startContainer instanceof Text &&
                startContainer === endContainer &&
                startOffset === 0 &&
                endOffset === startContainer.length
              ) {
                console.log("insert");
                startContainer.parentElement?.insertBefore(
                  document.createTextNode("\u200b"),
                  startContainer
                );
              }
              return false;
            },
            compositionend: (view) => {
              let transaction = view.state.tr;
              view.state.doc.forEach((line, lineOffset) => {
                line.content.forEach((node, nodeOffset) => {
                  Array.from(node.text ?? "").forEach((char, charIndex) => {
                    if (char === "\u200b") {
                      transaction = transaction.delete(
                        lineOffset + nodeOffset + charIndex + 1,
                        lineOffset + nodeOffset + charIndex + 2
                      );
                    }
                  });
                });
              });
              if (transaction.steps.length > 0) {
                view.dispatch(transaction);
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
