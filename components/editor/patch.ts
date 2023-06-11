import { Editor, EditorState, Modifier, SelectionState } from 'draft-js'
import { RefObject, useCallback, useEffect } from 'react'

export interface WysiwygEditorHandles {
  currentEditorState: EditorState // 関数の中からは最新のstateにアクセス出来ないので引数で受け取るようにする
  onAppendTextToCurrentPosition: (
    newState: EditorState,
    currentState: EditorState
  ) => void
}

type UseDraftjsPatchProps = {
  editorRef: RefObject<Editor>
  updateEditorState: (value: (prev: EditorState) => EditorState) => void
}
export const useDraftjsPatch = ({
  editorRef,
  updateEditorState,
}: UseDraftjsPatchProps) => {
  // Editor内のテキストを選択してIMEがONの状態で入力すると消えたテキストが変換確定後に出現してしまうバグの対策
  // https://github.com/pomelovico/keep/issues/30
  useEffect(() => {
    if (editorRef.current) {
      const el = editorRef.current.editor
      const handler = () => {
        updateEditorState((prevEditorState) => {
          try {
            const selection = prevEditorState.getSelection()
            if (selection.isCollapsed()) return prevEditorState

            const contentState = prevEditorState.getCurrentContent()
            const nextContentState = Modifier.replaceText(
              contentState,
              selection,
              ''
            )
            return EditorState.push(
              prevEditorState,
              nextContentState,
              'insert-characters'
            )
          } catch (e) {
            return prevEditorState
          }
        })
      }
      el?.addEventListener('compositionstart', handler)
      return () => {
        el?.removeEventListener('compositionstart', handler)
      }
    }
    return undefined
  }, [editorRef, updateEditorState])

  /*
    【IME入力対策】
    inline styleは存在しているが, content stateにinline styleを含むblockが存在していないと
    on change発火時にinline styleを失ってしまうのでstateを上書きする
    NOTE: この処理で時間がかかるとIMEでの入力と確定を連続して行ったときにEditorの状態がおかしくなり、入力している内容が改行がつめられた状態で上部に現れるなどのバグが発生しやすくなる。
    */
  const patchToKeepStylesOnIMEInput = useCallback(
    (prevState: EditorState, nextState: EditorState): EditorState => {
      // IME入力中でなければそのまま
      if (!prevState.isInCompositionMode()) return nextState

      const prevSelection = prevState.getSelection()
      const nextSelection = nextState.getSelection()
      const anchorKey = nextSelection.getAnchorKey()
      const isSameBlock = prevSelection.getAnchorKey() === anchorKey
      // 別のblockに移動した変更であればそのまま
      if (!isSameBlock) return nextState

      const prevInlineStyle = prevState.getCurrentInlineStyle()
      const prevText = prevState
        .getCurrentContent()
        .getBlockForKey(anchorKey)
        .getText()
      const nextText = nextState
        .getCurrentContent()
        .getBlockForKey(anchorKey)
        .getText()
      const lengthDiff = nextText.length - prevText.length
      // IME入力状態が解除されてかつ長さが増えたとき以外は、inline style をキープしたまま内部のデータは特に操作しない
      if (nextState.isInCompositionMode() || lengthDiff < 1) {
        return EditorState.setInlineStyleOverride(nextState, prevInlineStyle)
      }

      const anchorOffset = prevSelection.getAnchorOffset()
      const startOffset = anchorOffset - lengthDiff
      const addedText = nextText.slice(startOffset, anchorOffset)
      const startSelection = SelectionState.createEmpty(anchorKey).merge({
        anchorOffset: startOffset,
        focusOffset: startOffset,
      })
      // IME入力確定時に入力されたテキストをstyleを上書きしてinsert
      return EditorState.set(
        EditorState.push(
          // undoしたときにcursor位置も適切に戻るように
          EditorState.forceSelection(prevState, startSelection),
          Modifier.insertText(
            prevState.getCurrentContent(),
            startSelection,
            addedText,
            prevInlineStyle
          ),
          'adjust-depth'
        ),
        { inCompositionMode: false }
      )
    },
    []
  )

  return {
    patchToKeepStylesOnIMEInput,
  }
}
