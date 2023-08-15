import { Box, Paper, Stack } from "@mui/material";
import {
  ContentBlock,
  ContentState,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import {
  forwardRef,
  ForwardRefRenderFunction,
  MouseEvent,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { useDraftjsPatch } from "./patch";
import { allStyleMap } from "./style-map";
import { WysiwygToolbar } from "./toolbar";

const randomString = () => Math.random().toString(32).substring(2);

interface WysiwygEditorHandles {
  currentEditorState: EditorState; // 関数の中からは最新のstateにアクセス出来ないので引数で受け取るようにする
  onAppendTextToCurrentPosition: (
    newState: EditorState,
    currentState: EditorState
  ) => void;
}

type Props = {
  data: EditorState;
  onChange?: (data: EditorState) => void;
  readonly?: boolean;
  disabled?: boolean;
  variant?: "outlined" | "initial";
  minHeight?: number;
};

const WysiwygEditorComponent: ForwardRefRenderFunction<
  WysiwygEditorHandles,
  Props
> = (
  {
    data: editorState,
    onChange,
    readonly = false,
    disabled = false,
    variant = "outlined",
    minHeight,
  },
  ref
) => {
  const editorRef = useRef<Editor>(null);

  const focusEditor = useCallback(() => {
    if (editorRef.current?.editor) editorRef.current.editor.focus();
  }, []);

  const { patchToKeepStylesOnIMEInput } = useDraftjsPatch({
    editorRef,
    updateEditorState: (updater: (prev: EditorState) => EditorState) => {
      onChange?.(updater(editorState));
    },
  });

  const handleClickInlineStyle = (
    e: MouseEvent<HTMLSpanElement> | undefined,
    inlineStyle: string
  ) => {
    if (e) {
      e.preventDefault();
    }
    onChange?.(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const handleToggleGroupStyleItem = (
    e: MouseEvent<HTMLSpanElement> | undefined,
    toggledStyle: string,
    groupStyles: string[]
  ) => {
    if (e) {
      e.preventDefault();
    }

    const otherStyles = groupStyles.filter((style) => style !== toggledStyle);

    const selection = editorState.getSelection();

    const nextEditorState = RichUtils.toggleInlineStyle(
      editorState,
      toggledStyle
    );

    if (selection.isCollapsed()) {
      const nextStyle = otherStyles.reduce(
        (styles, style) => (styles.has(style) ? styles.remove(style) : styles),
        nextEditorState.getCurrentInlineStyle()
      );

      onChange?.(
        EditorState.setInlineStyleOverride(nextEditorState, nextStyle)
      );

      return;
    }

    const nextContentState = otherStyles.reduce(
      (contentState, style) =>
        Modifier.removeInlineStyle(contentState, selection, style),
      nextEditorState.getCurrentContent()
    );

    onChange?.(
      EditorState.push(nextEditorState, nextContentState, "change-inline-style")
    );
  };

  // テキストエリア変更発火時
  const handleChange = (newState: EditorState) => {
    onChange?.(patchToKeepStylesOnIMEInput(editorState, newState));
  };

  /**
   * 外部からテキストに差し込みを行いたい場合
   *
   * エディタ用のオブジェクト情報や EditorStateへのコンバート処理を, このコンポーネントに閉じたいので
   * コンポーネントから貼り付けメソッドのみを外部に提供する形にしている
   */
  useImperativeHandle(
    ref,
    () => ({
      currentEditorState: editorState, // 関数の中からは最新のstateにアクセス出来ないので引数で受け取るようにする
      onAppendTextToCurrentPosition: (newState, currentState) => {
        // 渡されたデータ
        const _contentState = newState.getCurrentContent();
        const _blockMap = _contentState.getBlockMap();

        // 現在の状態
        const contentState = currentState.getCurrentContent();
        const blockMap = contentState.getBlockMap();

        // カーソル情報
        const selectionState = editorState.getSelection();
        const key = selectionState.getAnchorKey();

        // 新しい状態の生成
        const newContentBlockArray = blockMap.reduce<ContentBlock[]>(
          (acc, block) => {
            const result = acc ?? [];
            if (block) result.push(block);

            // current sectionの時に新しいデータを格納する
            if (block?.getKey() === key) {
              _blockMap.forEach((_block) => {
                if (_block) {
                  result.push(
                    _block.set("key", randomString()) as ContentBlock
                  );
                }
              });
            }

            return result;
          },
          []
        );

        const newContentState =
          ContentState.createFromBlockArray(newContentBlockArray);
        const newEditorState = EditorState.forceSelection(
          EditorState.createWithContent(newContentState),
          selectionState
        );

        onChange?.(newEditorState);
      },
    }),
    [onChange, editorState]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        ...(variant === "initial" ? { border: "none" } : {}),
        height: "100%",
      }}
    >
      <Stack spacing={1} height="100%">
        {!readonly && (
          <WysiwygToolbar
            editorState={editorState}
            onClickInlineStyle={handleClickInlineStyle}
            onChangeGroupStyle={handleToggleGroupStyleItem}
          />
        )}
        <Box onClick={focusEditor}>
          <Editor
            editorState={editorState}
            onChange={handleChange}
            ref={editorRef}
            customStyleMap={allStyleMap}
            readOnly={readonly || disabled}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export const WysiwygEditor = forwardRef(WysiwygEditorComponent);
