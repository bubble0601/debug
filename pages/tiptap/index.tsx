import { Box } from "@mui/material";
import { EditorState } from "draft-js";
import { useEffect, useState } from "react";
import { WysiwygEditor } from "../../components/editor/editor";
import { TiptapEditor } from "../../components/editor/tiptap-editor";

export default () => {
  const [editorState, setEditorState] = useState<EditorState>();

  useEffect(() => {
    const init = async () => {
      // const raw = (await import(
      //   '../../components/editor/data4.json'
      // )) as RawDraftContentState
      setEditorState(EditorState.createEmpty());
    };
    init();
  }, []);

  const handleChange = (data: EditorState) => {
    setEditorState(data);
  };

  if (!editorState) return null;

  return (
    <Box
      sx={{
        display: "grid",
        height: "100vh",
        width: "100vw",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        p: 2,
      }}
    >
      <WysiwygEditor
        data={editorState}
        minHeight={300}
        onChange={handleChange}
      />
      <TiptapEditor value={editorState} />
    </Box>
  );
};
