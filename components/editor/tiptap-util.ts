import { JSONContent } from "@tiptap/core";
import {
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftEntityRange,
  RawDraftInlineStyleRange,
} from "draft-js";

import { colorStyleMap, fontSizeStyleMap } from "./style-map";

const randomString = () => Math.random().toString(32).substring(2);

const applyPatchToDraftContent = (
  original: RawDraftContentState
): RawDraftContentState => {
  const blocks = original.blocks.reduce<RawDraftContentBlock[]>(
    (blockAcc, block) => {
      if (!block.text.includes("\n")) return [...blockAcc, block];

      const chars = block.text.split("").map((c) => ({
        char: c,
        styles: [] as RawDraftInlineStyleRange["style"][],
        entities: [] as RawDraftEntityRange["key"][],
      }));
      block.inlineStyleRanges.forEach((range) => {
        for (let i = range.offset; i < range.offset + range.length; i++) {
          chars[i]!.styles.push(range.style);
        }
      });
      block.entityRanges.forEach((range) => {
        for (let i = range.offset; i < range.offset + range.length; i++) {
          chars[i]!.entities.push(range.key);
        }
      });

      const newBlocks = chars.reduce<RawDraftContentBlock[]>((acc, char) => {
        if (char.char === "\r") return acc;
        if (char.char === "\n")
          return [
            ...acc,
            {
              ...block,
              key: randomString(),
              text: "",
              inlineStyleRanges: [],
              entityRanges: [],
            },
          ];
        const lastBlock = acc[acc.length - 1];

        if (!lastBlock) {
          return [
            {
              ...block,
              key: randomString(),
              text: char.char,
              inlineStyleRanges: char.styles.map((style) => ({
                style,
                offset: 0,
                length: 1,
              })),
              entityRanges: char.entities.map((key) => ({
                key,
                offset: 0,
                length: 1,
              })),
            },
          ];
        }

        const newInlineStyleRanges: RawDraftInlineStyleRange[] =
          lastBlock.inlineStyleRanges.filter(
            (r) => r.offset + r.length !== lastBlock.text.length
          );
        const lastCharStyleRanges = lastBlock.inlineStyleRanges.filter(
          (r) => r.offset + r.length === lastBlock.text.length
        );
        lastCharStyleRanges.forEach((range) => {
          if (char.styles.includes(range.style)) {
            newInlineStyleRanges.push({ ...range, length: range.length + 1 });
          }
          return newInlineStyleRanges.push(range);
        });
        char.styles
          .filter(
            (style) => !lastCharStyleRanges.map((r) => r.style).includes(style)
          )
          .forEach((style) => {
            newInlineStyleRanges.push({
              style,
              offset: lastBlock.text.length,
              length: 1,
            });
          });

        const newEntityRanges: RawDraftEntityRange[] =
          lastBlock.entityRanges.filter(
            (e) => e.offset + e.length !== lastBlock.text.length
          );
        const lastCharEntityRanges = lastBlock.entityRanges.filter(
          (e) => e.offset + e.length === lastBlock.text.length
        );
        lastCharEntityRanges.forEach((range) => {
          if (char.entities.includes(range.key)) {
            newEntityRanges.push({ ...range, length: range.length + 1 });
          }
          return newEntityRanges.push(range);
        });
        char.entities
          .filter(
            (key) => !lastCharEntityRanges.map((r) => r.key).includes(key)
          )
          .forEach((key) => {
            newEntityRanges.push({
              key,
              offset: lastBlock.text.length,
              length: 1,
            });
          });

        return [
          ...acc.slice(0, acc.length - 1),
          {
            ...lastBlock,
            text: lastBlock.text + char.char,
            inlineStyleRanges: newInlineStyleRanges,
            entityRanges: newEntityRanges,
          },
        ];
      }, []);
      return [...blockAcc, ...newBlocks];
    },
    []
  );

  return {
    ...original,
    blocks,
  };
};

// textをスタイルごとにグループ化
const split = (text: string, draftStyles: RawDraftInlineStyleRange[]) => {
  if (text.length === 0) {
    return [];
  }

  // Array.fromでサロゲートペアを考慮して分割する
  // text.split('')はサロゲートペアを分割してしまう
  const chars = Array.from(text);
  // 文字のindexに対応するスタイル(i番目の文字のスタイルはcharStyles[i]に格納される)
  const charStyles: string[][] = chars.map(() => []);
  draftStyles.forEach((style) => {
    for (let i = style.offset; i < style.offset + style.length; i++) {
      charStyles[i]!.push(style.style);
    }
  });

  // スタイルごとにグループ化する
  const result = [];
  let currentText = chars[0]!; // text[0]だとサロゲートペアが分割されてしまう
  let currentStyles = charStyles[0]!;
  for (let i = 1; i < chars.length; i++) {
    const char = chars[i]!;
    const styles = charStyles[i]!;

    if (
      // currentStylesとstylesが一致しない場合
      currentStyles.some((x) => !styles.includes(x)) ||
      styles.length > currentStyles.length
    ) {
      result.push({
        text: currentText,
        styles: currentStyles,
      });
      currentText = char;
      currentStyles = styles;
    } else {
      currentText += char;
    }
  }
  result.push({
    text: currentText,
    styles: currentStyles,
  });

  return result;
};

export const convertDraftToTiptap = (
  draftContent: RawDraftContentState
): JSONContent => {
  const result: JSONContent = {
    type: "doc",
    content: [],
  };

  const patchedDraftContent = applyPatchToDraftContent(draftContent);
  patchedDraftContent.blocks.forEach((block) => {
    const items = split(block.text, block.inlineStyleRanges);
    if (items.length === 0) {
      result.content!.push({
        type: "paragraph",
      });
      return;
    }

    result.content!.push({
      type: "paragraph",
      content: items.map(({ text, styles }) => {
        const node: JSONContent = {
          type: "text",
          text,
          marks: [],
        };
        styles.forEach((style) => {
          if (style === "ITALIC") {
            node.marks!.push({
              type: "italic",
            });
          }
          if (style === "UNDERLINE") {
            node.marks!.push({
              type: "underline",
            });
          }
          if (style === "BOLD") {
            node.marks!.push({
              type: "bold",
            });
          }
          if (colorStyleMap[style]) {
            const textStyleMark = node.marks!.find(
              (x) => x.type === "textStyle"
            );
            if (textStyleMark) {
              textStyleMark.attrs = {
                ...textStyleMark.attrs,
                color: colorStyleMap[style]!.color,
              };
            } else {
              node.marks!.push({
                type: "textStyle",
                attrs: {
                  color: colorStyleMap[style]!.color,
                },
              });
            }
          }
          if (fontSizeStyleMap[style]) {
            const textStyleMark = node.marks!.find(
              (x) => x.type === "textStyle"
            );
            if (textStyleMark) {
              textStyleMark.attrs = {
                ...textStyleMark.attrs,
                fontSize: fontSizeStyleMap[style]!.fontSize,
              };
            } else {
              node.marks!.push({
                type: "textStyle",
                attrs: {
                  fontSize: fontSizeStyleMap[style]!.fontSize,
                },
              });
            }
          }
        });
        return node;
      }),
    });
  });

  return result;
};

export const createEmptyContent = (): JSONContent => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
});

export const isEmptyContent = (content: JSONContent): boolean =>
  content.content == null ||
  content.content.length === 0 ||
  (content.content.length === 1 &&
    content.content[0]!.type === "paragraph" &&
    content.content[0]!.content == null);

export const convertTiptapToString = (content: JSONContent): string => {
  const lines: string[] = [];
  content.content?.forEach((ct) => {
    let line = "";
    ct.content?.forEach((c) => {
      line += c.text;
    });
    lines.push(line);
  });
  return lines.join("\n");
};

export const convertStringToTiptap = (text: string): JSONContent => {
  const content = text.split(/\r\n|\r|\n/).map((line) =>
    line !== ""
      ? {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: line,
              marks: [],
            },
          ],
        }
      : {
          type: "paragraph",
        }
  );
  console.log(content);

  return {
    type: "doc",
    content,
  };
};
