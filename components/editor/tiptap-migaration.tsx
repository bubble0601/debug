import { JSDOM } from "jsdom";
const { window } = new JSDOM();

// @ts-ignore
globalThis.window = window;

import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { convertToHTML } from "draft-convert";
import { Content, generateJSON } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "./color";
import Underline from "@tiptap/extension-underline";
import { colorStyleMap, fontSizeStyleMap } from "./style-map";
import { FontSize } from "./font-size";

const toTiptapData = (src: EditorState | undefined): Content => {
  if (!src) return null;

  console.log(convertToRaw(src.getCurrentContent()));
  const html = convertToHTML({
    styleToHTML: (style) => {
      let applyStyle = {};
      if (colorStyleMap[style]) {
        applyStyle = {
          color: colorStyleMap[style]?.color,
        };
      }

      if (style === "ITALIC") {
        applyStyle = {
          fontStyle: "italic",
        };
      }
      if (style === "UNDERLINE") {
        applyStyle = {
          textDecoration: "underline",
        };
      }
      if (style === "BOLD") {
        applyStyle = {
          fontWeight: "bold",
        };
      }

      if (fontSizeStyleMap[style]) {
        applyStyle = {
          fontSize: fontSizeStyleMap[style]?.fontSize,
        };
      }

      return <span style={applyStyle} />;
    },
    blockToHTML: (block) => {
      if (block.text === "") {
        return <br />;
      }
      return <p />;
    },
  })(src.getCurrentContent());

  console.log(html);

  const raw = generateJSON(html, [
    StarterKit,
    TextStyle,
    Underline,
    Color,
    FontSize,
  ]);

  console.log(raw);

  return {
    ...raw,
    content: raw.content.map((block: any) => {
      if (
        block.type === "paragraph" &&
        block.content?.every((x: any) => x.type === "hardBreak")
      ) {
        return {
          ...block,
          content: block.content.slice(1),
        };
      }
      return block;
    }),
  };
};

const main = async () => {
  const data = EditorState.createWithContent(
    convertFromRaw((await import("./data_5.json")) as any)
  );
  const tiptapData = toTiptapData(data);
  console.log(tiptapData);
};

main();
