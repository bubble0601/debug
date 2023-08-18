import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  MenuList,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { JSONContent } from "@tiptap/core";
import {
  EditorState,
  RawDraftContentState,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import { useEffect, useState } from "react";
import { WysiwygEditor } from "../../components/editor/editor";
import { TiptapEditor } from "../../components/editor/tiptap-editor";
import { TiptapToStringEditor } from "../../components/editor/tiptap-to-string-editor";
import {
  convertDraftToTiptap,
  createEmptyContent,
  isEmptyContent,
} from "../../components/editor/tiptap-util";

import tiptapSample from "../../components/editor/tiptap-sample.json";
import sample from "../../components/editor/sample.json";

if (typeof window !== "undefined") {
  if (localStorage.getItem("tiptap-data") == null) {
    localStorage.setItem(
      "tiptap-data",
      JSON.stringify({
        sample: tiptapSample,
      })
    );
  }
  if (localStorage.getItem("draft-data") == null) {
    localStorage.setItem(
      "draft-data",
      JSON.stringify({
        sample,
      })
    );
  }
}

export default () => {
  const [content, setContent] = useState<JSONContent>(createEmptyContent());
  const [editorState, setEditorState] = useState<EditorState | undefined>();
  const [strContent, setStrContent] = useState<JSONContent>(
    createEmptyContent()
  );

  const [mode, setMode] = useState<"draft" | "string">("draft");
  const [readonly, setReadonly] = useState(false);
  const [sync, setSync] = useState(false);

  const [storedData1, setStoredData1] = useState<Record<string, JSONContent>>(
    {}
  );
  const [storedData2, setStoredData2] = useState<
    Record<string, RawDraftContentState>
  >({});

  const handleChangeContent = (data: JSONContent) => {
    console.log(data);
    setContent(data);
  };

  const handleChangeDraft = (data: EditorState) => {
    setEditorState(data);
    const raw = convertToRaw(data.getCurrentContent());
    console.log(raw);
    if (sync) {
      setContent(convertDraftToTiptap(raw));
    }
  };

  const [anchorEl1, setAnchorEl1] = useState<HTMLElement | null>(null);
  const handleSave1 = () => {
    const name = prompt("名前を入力してください");
    if (!name) return;

    if (isEmptyContent(content)) {
      const newData = Object.fromEntries(
        Object.entries(storedData1).filter(([key]) => key !== name)
      );
      localStorage.setItem("tiptap-data", JSON.stringify(newData));
      setStoredData1(newData);
      return;
    }

    const newData = {
      ...storedData1,
      [name]: content,
    };
    localStorage.setItem("tiptap-data", JSON.stringify(newData));
    setStoredData1(newData);
  };

  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const handleSave2 = () => {
    if (!editorState) return;

    const name = prompt("名前を入力してください");
    if (!name) return;

    if (editorState.getCurrentContent().hasText() === false) {
      const newData = Object.fromEntries(
        Object.entries(storedData2).filter(([key]) => key !== name)
      );
      localStorage.setItem("draft-data", JSON.stringify(newData));
      setStoredData2(newData);
      return;
    }

    const newData = {
      ...storedData2,
      [name]: convertToRaw(editorState.getCurrentContent()),
    };
    localStorage.setItem("draft-data", JSON.stringify(newData));
    setStoredData2(newData);
  };

  useEffect(() => {
    setEditorState(EditorState.createEmpty());
    setStoredData1(JSON.parse(localStorage.getItem("tiptap-data") ?? "{}"));
    setStoredData2(JSON.parse(localStorage.getItem("draft-data") ?? "{}"));
  }, []);

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
      <Stack>
        <Typography variant="h4">新エディタ</Typography>
        <Stack direction="row">
          <FormControlLabel
            label="閲覧のみ"
            control={
              <Checkbox
                checked={readonly}
                onChange={(e) => setReadonly(e.target.checked)}
              />
            }
          />
          <Button
            onClick={(e) => setAnchorEl1(e.currentTarget)}
            sx={{ ml: "auto" }}
          >
            読込
          </Button>
          <Menu
            open={Boolean(anchorEl1)}
            anchorEl={anchorEl1}
            onClose={() => setAnchorEl1(null)}
          >
            <MenuList>
              {Object.entries(storedData1).map(([key, val]) => (
                <MenuItem
                  key={key}
                  onClick={() => {
                    setContent(val);
                    setAnchorEl1(null);
                  }}
                >
                  {key}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Button onClick={handleSave1}>保存</Button>
        </Stack>
        <TiptapEditor
          key={readonly ? "readonly" : "editable"}
          value={content}
          readonly={readonly}
          onChange={handleChangeContent}
        />
      </Stack>
      {mode === "draft" && (
        <Stack>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
          >
            <FormControlLabel
              value="draft"
              label="旧エディタ"
              control={<Radio />}
            />
            <FormControlLabel
              value="string"
              label="簡易版エディタ"
              control={<Radio />}
            />
          </RadioGroup>
          <Stack direction="row">
            <FormControlLabel
              label="←へ同期"
              control={
                <Checkbox
                  checked={sync}
                  onChange={(e) => setSync(e.target.checked)}
                />
              }
            />
            {/* https://www.notion.so/medicalforce/86277-d4f7120590c04783923b9a6baedac75e?pvs=4 */}
            {/* <Button
              onClick={async () => {
                const data = await import(
                  "../../components/editor/invalid-sample1.json"
                );
                setEditorState(
                  EditorState.createWithContent(convertFromRaw(data.default))
                );
              }}
            >
              不正データ1
            </Button> */}
            <Button
              onClick={async () => {
                const data = await import(
                  "../../components/editor/invalid-sample2.json"
                );
                setEditorState(
                  EditorState.createWithContent(convertFromRaw(data.default))
                );
              }}
            >
              不正データ
            </Button>
            <Button
              onClick={(e) => setAnchorEl2(e.currentTarget)}
              sx={{ ml: "auto" }}
            >
              読込
            </Button>
            <Menu
              open={Boolean(anchorEl2)}
              anchorEl={anchorEl2}
              onClose={() => setAnchorEl2(null)}
            >
              <MenuList>
                {Object.entries(storedData2).map(([key, val]) => (
                  <MenuItem
                    key={key}
                    onClick={() => {
                      setEditorState(
                        EditorState.createWithContent(convertFromRaw(val))
                      );
                      setAnchorEl2(null);
                    }}
                  >
                    {key}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Button onClick={handleSave2}>保存</Button>
          </Stack>
          <WysiwygEditor
            data={editorState}
            minHeight={300}
            onChange={handleChangeDraft}
          />
        </Stack>
      )}
      {mode === "string" && (
        <Stack>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
          >
            <FormControlLabel
              value="draft"
              label="旧エディタ"
              control={<Radio />}
            />
            <FormControlLabel
              value="string"
              label="簡易版エディタ"
              control={<Radio />}
            />
          </RadioGroup>
          <div>
            <FormControlLabel
              label="←→同期"
              control={
                <Checkbox
                  checked={sync}
                  onChange={(e) => setSync(e.target.checked)}
                />
              }
            />
          </div>
          <div style={{ flexGrow: 1 }}>
            <TiptapToStringEditor
              data={sync ? content : strContent}
              rows={25}
              onChange={sync ? setContent : setStrContent}
            />
          </div>
        </Stack>
      )}
    </Box>
  );
};
