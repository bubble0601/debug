import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteCloseReason,
  AutocompleteHighlightChangeReason,
  AutocompleteInputChangeReason,
  AutocompleteRenderInputParams,
  ClickAwayListener,
  Container,
  Grid,
  TextField,
} from '@mui/material'
import {
  ChangeEvent,
  CompositionEvent,
  FormEvent,
  useRef,
  useState,
} from 'react'

type Option = { id: string; label: string }
const options = [
  { id: 'foo', label: 'アップデート' },
  { id: 'bar', label: 'アガペー' },
  { id: 'baz', label: 'アシンメトリー' },
  { id: 'qux', label: 'アイルランド' },
  { id: 'quux', label: 'アサンドルチェ' },
  { id: 'corge', label: 'アーキテクチャ' },
  { id: 'grault', label: 'アランカーディガン' },
  { id: 'garply', label: 'アベンジャーズ' },
  { id: 'waldo', label: 'アレンジ' },
  { id: 'fred', label: 'あばら骨' },
  { id: 'plugh', label: 'アイスクリーム' },
  { id: 'xyzzy', label: 'アート' },
]

const convertCompositionEventToFormEvent = (
  e: CompositionEvent<HTMLInputElement>
): FormEvent<HTMLInputElement> => ({
  ...e,
  currentTarget: { ...e.currentTarget, value: e.data },
})

let time = performance.now()
const AutocompleteInput = (params: AutocompleteRenderInputParams) => {
  const shouldIgnoreInput = useRef(false)
  const handleCompositionStart = (e: CompositionEvent<HTMLInputElement>) => {
    console.log('compositionstart', e.data)
    shouldIgnoreInput.current = false
  }
  const handleCompositionUpdate = (e: CompositionEvent<HTMLInputElement>) => {
    console.log('compositionupdate', e.data)
  }
  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    console.log('compositionend', e.data)
    time = performance.now()
    shouldIgnoreInput.current = true
    setTimeout(() => {
      shouldIgnoreInput.current = false
    }, 50)
  }
  const handleBeforeInput = (e: FormEvent<HTMLInputElement>) => {
    console.log('beforeinput', e.currentTarget.value)
  }
  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    console.log(performance.now() - time)
    console.log('input', e.currentTarget.value)
    console.log({ ...e })
    if (shouldIgnoreInput.current) return
    params.inputProps.onInput?.(e)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log('change', e.currentTarget.value)
    if (shouldIgnoreInput.current) return
    params.inputProps.onChange?.(e)
  }
  const handleClickAway = () => {
    console.log('clickaway')
  }
  return (
    <ClickAwayListener onClickAway={handleClickAway} mouseEvent="onPointerDown">
      <TextField
        {...params}
        inputProps={{
          ...params.inputProps,
          onCompositionStart: handleCompositionStart,
          onCompositionUpdate: handleCompositionUpdate,
          onCompositionEnd: handleCompositionEnd,
          onBeforeInput: handleBeforeInput,
          onInput: handleInput,
          onChange: handleChange,
        }}
      />
      {/* <input
        {...params.inputProps}
        type="text"
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
      /> */}
      {/* <Input
        {...params.InputProps}
        type="text"
        fullWidth
        inputProps={{
          ...params.inputProps,
          onCompositionStart: handleCompositionStart,
          onCompositionEnd: handleCompositionEnd,
          onInput: handleInput,
        }}
      /> */}
      {/* <InputBase
        {...params.InputProps}
        type="text"
        fullWidth
        inputProps={{
          ...params.inputProps,
          onCompositionStart: handleCompositionStart,
          onCompositionEnd: handleCompositionEnd,
          onInput: handleInput,
        }}
      /> */}
      {/* <InputBaseComponent
        {...params.inputProps}
        type="text"
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
      /> */}
    </ClickAwayListener>
  )
}

export default function IndexPage() {
  const [value, setValue] = useState<Option | null>(null)
  const handleOpen = (_: unknown) => {
    console.log('onOpen')
  }
  const handleClose = (_: unknown, reason: AutocompleteCloseReason) => {
    console.log('onClose', reason)
  }
  const handleChange = (
    _: unknown,
    newValue: Option | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<Option>
  ) => {
    console.log('onChange', newValue, reason, details)
    setValue(newValue)
  }
  const handleInputChange = (
    _: unknown,
    newValue: string,
    reason: AutocompleteInputChangeReason
  ) => {
    console.log('onInputChange', newValue, reason)
  }
  const handleHighlightChange = (
    _: unknown,
    newValue: Option | null,
    reason: AutocompleteHighlightChangeReason
  ) => {
    console.log('onHighlightChange', newValue, reason)
  }

  return (
    <Container>
      <Grid container mt={2}>
        <Grid item xs>
          <Autocomplete
            value={value}
            options={options}
            renderInput={AutocompleteInput}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onOpen={handleOpen}
            onClose={handleClose}
            onChange={handleChange}
            onInputChange={handleInputChange}
            onHighlightChange={handleHighlightChange}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
