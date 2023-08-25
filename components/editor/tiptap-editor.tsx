import { Box, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Content, JSONContent, generateHTML } from "@tiptap/core";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { FontSize } from "./font-size";
import { IMESupport } from "./ime-support";
import { TiptapToolbar } from "./tiptap-toolbar";
import { useEffect } from "react";

const StyledEditorContent = styled(EditorContent)(() => ({
  "& .ProseMirror": {
    outline: "unset",
    fontFamily: [
      "Helvetica Neue",
      "Arial",
      "Hiragino Kaku Gothic ProN",
      "Hiragino Sans",
      "Meiryo",
      "sans-serif",
      "Roboto",
      "Noto Sans JP",
    ].join(","),
  },
  "& p": {
    margin: 0,
  },
}));

type Props = {
  value: JSONContent;
  readonly?: boolean;
  onChange?: (data: JSONContent) => void;
};

export const TiptapEditor = ({ value, readonly = false, onChange }: Props) => {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, FontSize, Underline, IMESupport],
    content: value,
    editable: !readonly,
    editorProps: {
      attributes: {
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      const data = editor.getJSON();
      onChange?.(data);
    },
  });

  useEffect(() => {
    if (editor == null) return;
    if (
      editor.getHTML() !==
      generateHTML(value, editor.extensionManager.extensions ?? [])
    ) {
      editor.commands.setContent(value);
    }
  }, [value]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        // ...(variant === "initial" ? { border: "none" } : {}),
        height: "100%",
      }}
    >
      <Stack
        spacing={1}
        height="100%"
        onClick={() => editor?.commands.focus()}
        sx={!readonly ? { cursor: "text" } : undefined}
      >
        {!readonly && <TiptapToolbar editor={editor} />}
        <Box>
          <StyledEditorContent editor={editor} />
        </Box>
      </Stack>
    </Paper>
  );
};
