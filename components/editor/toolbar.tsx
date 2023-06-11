import {
  ArrowDropDown as ArrowDropDownIcon,
  FormatBold as FormatBoldIcon,
  FormatColorText as FormatColorTextIcon,
  FormatItalic as FormatItalicIcon,
  FormatSize as FormatSizeIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  Lens as LensIcon,
} from '@mui/icons-material'
import {
  Box,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material'
import { EditorState } from 'draft-js'
import { MouseEvent, useCallback, useState } from 'react'
import {
  colors,
  colorStyles,
  colorTable,
  fontSizes,
  fontSizeStyles,
} from './style-map'

type Props = {
  editorState: EditorState
  onClickInlineStyle: (
    e: MouseEvent<HTMLSpanElement> | undefined,
    style: string
  ) => void
  onChangeGroupStyle: (
    e: MouseEvent<HTMLSpanElement> | undefined,
    toggleStyle: string,
    groupStyles: string[]
  ) => void
}

export const WysiwygToolbar = (props: Props) => {
  const { editorState, onClickInlineStyle, onChangeGroupStyle } = props

  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null)
  const [fontSizeAnchorEl, setFontSizeAnchorEl] = useState<HTMLElement | null>(
    null
  )

  const handleColorClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault()
      setColorAnchorEl(event.currentTarget)
    },
    []
  )

  const handleColorClose = () => {
    setColorAnchorEl(null)
  }

  const handleClickColor = (
    event: React.MouseEvent<HTMLSpanElement>,
    color: string
  ) => {
    event.preventDefault()
    setColorAnchorEl(null)
    onChangeGroupStyle(event, color, colorStyles)
  }

  const handleFontSizeClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault()
      setFontSizeAnchorEl(event.currentTarget)
    },
    []
  )

  const handleFontSizeClose = () => {
    setFontSizeAnchorEl(null)
  }

  const handleClickFontSize = (
    event: React.MouseEvent<HTMLSpanElement>,
    fontSize: string
  ) => {
    event.preventDefault()
    setFontSizeAnchorEl(null)
    onChangeGroupStyle(event, fontSize, fontSizeStyles)
  }

  const currentStyle = editorState.getCurrentInlineStyle()
  const colorOpen = Boolean(colorAnchorEl)
  const fontSizeOpen = Boolean(fontSizeAnchorEl)

  return (
    <Box>
      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bold"
          selected={currentStyle.has('BOLD')}
          onMouseDown={(e: React.MouseEvent<HTMLSpanElement> | undefined) =>
            onClickInlineStyle(e, 'BOLD')
          }
        >
          <Tooltip title={'太字'}>
            <FormatBoldIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={currentStyle.has('ITALIC')}
          onMouseDown={(e: React.MouseEvent<HTMLSpanElement> | undefined) =>
            onClickInlineStyle(e, 'ITALIC')
          }
        >
          <Tooltip title={'斜体'}>
            <FormatItalicIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          selected={currentStyle.has('UNDERLINE')}
          value="underlined"
          onMouseDown={(e: React.MouseEvent<HTMLSpanElement> | undefined) =>
            onClickInlineStyle(e, 'UNDERLINE')
          }
        >
          <Tooltip title={'下線'}>
            <FormatUnderlinedIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="color" onMouseDown={handleColorClick}>
          <Tooltip title={'色'}>
            <FormatColorTextIcon
              style={{
                color: colors.find(
                  (item) =>
                    currentStyle.filter((style) => style === item.name).size > 0
                )?.color,
              }}
            />
          </Tooltip>
          <ArrowDropDownIcon />
        </ToggleButton>
        <ToggleButton value="fontSize" onMouseDown={handleFontSizeClick}>
          <Tooltip title={'文字サイズ'}>
            <FormatSizeIcon />
          </Tooltip>
          <ArrowDropDownIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <Popover
        open={colorOpen}
        anchorEl={colorAnchorEl}
        onClose={handleColorClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        disableAutoFocus
        disableEnforceFocus
      >
        <Stack spacing={1} sx={{ p: 2 }}>
          {colorTable.map((colorRow, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Stack key={index} direction="row" spacing={1}>
              {colorRow.map((colorObj) => (
                <Box
                  key={colorObj.name}
                  onMouseDown={(e) => handleClickColor(e, colorObj.name)}
                  sx={{
                    color: colorObj.color,
                    cursor: 'pointer',
                  }}
                >
                  <LensIcon
                    sx={{
                      stroke: currentStyle.has(colorObj.name)
                        ? (theme) => theme.palette.action.selected
                        : 'white',
                      strokeWidth: 4,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          ))}
        </Stack>
      </Popover>
      <Popover
        anchorEl={fontSizeAnchorEl}
        open={fontSizeOpen}
        onClose={handleFontSizeClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        disableAutoFocus
        disableEnforceFocus
      >
        <Stack spacing={1} p={1}>
          {fontSizes.map((fontSizeObj) => (
            <Box
              key={fontSizeObj.name}
              onMouseDown={(e) => handleClickFontSize(e, fontSizeObj.name)}
              sx={{
                bgcolor: currentStyle.has(fontSizeObj.name)
                  ? 'action.selected'
                  : 'background.paper',
                fontSize: fontSizeObj.size,
                cursor: 'pointer',
              }}
            >
              {fontSizeObj.label}
            </Box>
          ))}
        </Stack>
      </Popover>
    </Box>
  )
}
