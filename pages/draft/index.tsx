import { Grid } from "@mui/material";
import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftEntityRange,
  RawDraftInlineStyleRange,
} from "draft-js";
import { useEffect, useState } from "react";
import { WysiwygEditor } from "../../components/editor/editor";

const randomString = () => Math.random().toString(32).substring(2);

const fixContentData = (src: RawDraftContentState): RawDraftContentState => {
  const blocks = src.blocks.reduce<RawDraftContentBlock[]>((acc, block) => {
    if (!block.text.includes("\n")) return [...acc, block];

    const chars = block.text.split("").map((c) => ({
      char: c,
      styles: [] as RawDraftInlineStyleRange["style"][],
      entities: [] as RawDraftEntityRange["key"][],
    }));
    block.inlineStyleRanges.forEach((range) => {
      for (let i = range.offset; i < range.offset + range.length; i++) {
        chars[i].styles.push(range.style);
      }
    });
    block.entityRanges.forEach((range) => {
      for (let i = range.offset; i < range.offset + range.length; i++) {
        chars[i].entities.push(range.key);
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
        .filter((key) => !lastCharEntityRanges.map((r) => r.key).includes(key))
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
    return [...acc, ...newBlocks];
  }, []);

  return {
    ...src,
    blocks,
  };
};

export default () => {
  const [editorState1, setEditorState1] = useState<EditorState>();
  const editorState2 =
    editorState1 &&
    EditorState.createWithContent(
      convertFromRaw(
        fixContentData(convertToRaw(editorState1.getCurrentContent()))
      )
    );

  // useEffect(() => {
  //   const init = async () => {
  //     const raw = (await import(
  //       '../../components/editor/data4.json'
  //     )) as RawDraftContentState
  //     setEditorState1(EditorState.createWithContent(convertFromRaw(raw)))
  //   }
  //   init()
  // }, [])

  console.log(
    editorState1 && convertToRaw(editorState1.getCurrentContent()).blocks,
    editorState2 && convertToRaw(editorState2.getCurrentContent()).blocks
  );

  return (
    <Grid container>
      <Grid item xs={6}>
        {editorState1 && (
          <WysiwygEditor
            data={editorState1}
            minHeight={300}
            onChange={setEditorState1}
          />
        )}
      </Grid>
      <Grid item xs={6}>
        {editorState2 && <WysiwygEditor data={editorState2} minHeight={300} />}
      </Grid>
    </Grid>
  );
};
