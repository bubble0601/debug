import { JSONContent } from "@tiptap/core";
import {
  ChangeEvent,
  forwardRef,
  SyntheticEvent,
  useImperativeHandle,
  useState,
} from "react";

import { convertStringToTiptap, convertTiptapToString } from "./tiptap-util";
import { TextField } from "@mui/material";

export interface TiptapToStringEditorEditorHandles {
  onAppendText: (newState: JSONContent) => void;
}

type Props = {
  data: JSONContent;
  onChange?: (data: JSONContent) => void;
  readonly?: boolean;
  disabled?: boolean;
  rows?: number;
};

export const TiptapToStringEditor = forwardRef<
  TiptapToStringEditorEditorHandles,
  Props
>(({ data, onChange, readonly = false, disabled = false, rows }, ref) => {
  const inputData = convertTiptapToString(data);
  console.log({
    data,
    inputData,
  });
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    onChange?.(convertStringToTiptap(e.target.value));
  };

  const handleSelect = (e: SyntheticEvent<HTMLDivElement, Event>) => {
    // カーソルの位置を取得する
    const target = e.target as HTMLInputElement;
    setCursorPosition(
      target.selectionStart || target.selectionStart === 0
        ? target.selectionStart
        : null
    );
  };
  /**
   * 外部からテキストに差し込みを行いたい場合
   */
  useImperativeHandle(ref, () => ({
    currentJSONContent: inputData, // 関数の中からは最新のstateにアクセス出来ないので引数で受け取るようにする
    onAppendText: (content: JSONContent) => {
      const base = convertTiptapToString(content);

      const text =
        cursorPosition !== null
          ? `${inputData.substring(
              0,
              cursorPosition
            )}${base}${inputData.substring(cursorPosition)}`
          : `${inputData}${base}`;

      onChange?.(convertStringToTiptap(text));
    },
  }));

  return (
    <TextField
      multiline
      rows={rows}
      value={inputData}
      onChange={handleChange}
      onSelect={handleSelect}
      disabled={readonly || disabled}
      fullWidth
      sx={{ height: "100%", lineHeight: "normal" }}
      spellCheck={false}
    />
  );
});
