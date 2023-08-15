import { convertToRaw, EditorState } from "draft-js";
import { convertToHTML } from "draft-convert";
import { Content, generateJSON, JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "./color";
import Underline from "@tiptap/extension-underline";
import { colorStyleMap, fontSizeStyleMap } from "./style-map";
import { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { usePrevious } from "../../common/lifecycle";
import { Paper, Stack } from "@mui/material";
import { TiptapToolbar } from "./tiptap-toolbar";
import { styled } from "@mui/material/styles";
import { FontSize } from "./font-size";
import { IMESupport } from "./ime-support";

const StyledEditorContent = styled(EditorContent)(() => ({
  "& .ProseMirror": {
    outline: "unset",
  },
  "& p": {
    margin: 0,
  },
}));

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

  // console.log(html);

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

type Props = {
  value: EditorState;
  readonly?: boolean;
};

export const TiptapEditor = ({ value, readonly = false }: Props) => {
  const editorContent = useMemo(() => toTiptapData(value), [value]);

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Underline, Color, FontSize, IMESupport],
    content: editorContent,
    editable: !readonly,
    editorProps: {
      attributes: {
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      console.log(editor.getJSON());
    },
  });

  const prevValue = usePrevious(value);
  if (prevValue !== value) {
    editor?.commands.setContent(toTiptapData(value));
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        // ...(variant === "initial" ? { border: "none" } : {}),
        height: "100%",
      }}
    >
      <Stack spacing={1} height="100%">
        <TiptapToolbar editor={editor} />
        <StyledEditorContent editor={editor} />
      </Stack>
    </Paper>
  );
};
