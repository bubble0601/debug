import { Box, Paper, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import { JSONContent, generateHTML } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { notoSansJp } from "../../pages/_app";
import { FontSize } from "./font-size";
import { IMESupport } from "./ime-support";
import { TiptapToolbar } from "./tiptap-toolbar";
import { UniqueId } from "./unique-id";
import { SafariWorkaround } from "./safari-workaround";

const isWindows =
  typeof window !== "undefined"
    ? navigator.userAgent.toLowerCase().includes("windows nt")
    : false;

const StyledEditorContent = styled(EditorContent)(() => ({
  "& .ProseMirror": {
    outline: "unset",
    ...(isWindows ? notoSansJp.style : undefined),
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
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        code: false,
        codeBlock: false,
        dropcursor: false,
        gapcursor: false,
        hardBreak: false,
        heading: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,
        strike: false,
      }),
      TextStyle,
      Color,
      FontSize,
      Underline,
      IMESupport,
      UniqueId,
      SafariWorkaround,
    ],
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
