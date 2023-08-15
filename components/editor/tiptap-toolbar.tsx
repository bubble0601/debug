import { Editor } from "@tiptap/core";
import { useState, MouseEvent } from "react";
import {
  ArrowDropDown as ArrowDropDownIcon,
  FormatBold as FormatBoldIcon,
  FormatColorText as FormatColorTextIcon,
  FormatItalic as FormatItalicIcon,
  FormatSize as FormatSizeIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  Lens as LensIcon,
} from "@mui/icons-material";
import {
  Box,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import {
  colors,
  colorTable,
  fontSizes,
  colorStyles,
  fontSizeStyles,
} from "./style-map";

const toRGB = (color: string) => {
  if (color.length !== 7 || !color.startsWith("#")) {
    return color;
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
};

export const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [fontSizeAnchorEl, setFontSizeAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleClickColor = (
    event: MouseEvent<HTMLSpanElement>,
    color: string
  ) => {
    event.preventDefault();
    setColorAnchorEl(null);
    editor?.commands.setColor(color);
  };

  const handleClickFontSize = (
    event: MouseEvent<HTMLSpanElement>,
    fontSize: string
  ) => {
    event.preventDefault();
    setFontSizeAnchorEl(null);
    editor?.commands.toggleMark("heading", { level: fontSize });
  };

  return (
    <Box>
      <ToggleButtonGroup size="small">
        <ToggleButton
          value="bold"
          selected={editor?.isActive("bold")}
          onMouseDown={() => editor?.commands.toggleBold()}
        >
          <Tooltip title={"太字"}>
            <FormatBoldIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="italic"
          selected={editor?.isActive("italic")}
          onMouseDown={() => editor?.commands.toggleItalic()}
        >
          <Tooltip title={"斜体"}>
            <FormatItalicIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          selected={editor?.isActive("underline")}
          value="underlined"
          onMouseDown={() => editor?.commands.toggleUnderline()}
        >
          <Tooltip title={"下線"}>
            <FormatUnderlinedIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          value="color"
          onMouseDown={(e) => {
            e.preventDefault();
            setColorAnchorEl(e.currentTarget);
          }}
        >
          <Tooltip title={"色"}>
            <FormatColorTextIcon
              style={{
                color: colors.find(
                  (color) =>
                    editor?.isActive("textStyle", { color: color.color }) ||
                    editor?.isActive("textStyle", { color: toRGB(color.color) })
                )?.color,
              }}
            />
          </Tooltip>
          <ArrowDropDownIcon />
        </ToggleButton>
        <ToggleButton
          value="fontSize"
          onMouseDown={(e) => {
            e.preventDefault();
            setFontSizeAnchorEl(e.currentTarget);
          }}
        >
          <Tooltip title={"文字サイズ"}>
            <FormatSizeIcon />
          </Tooltip>
          <ArrowDropDownIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <Popover
        open={Boolean(colorAnchorEl)}
        anchorEl={colorAnchorEl}
        onClose={() => setColorAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
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
                  onMouseDown={(e) => handleClickColor(e, colorObj.color)}
                  sx={{
                    color: colorObj.color,
                    cursor: "pointer",
                  }}
                >
                  <LensIcon
                    sx={{
                      stroke:
                        editor?.isActive("textStyle", {
                          color: colorObj.color,
                        }) ||
                        editor?.isActive("textStyle", {
                          color: toRGB(colorObj.color),
                        })
                          ? (theme) => theme.palette.action.selected
                          : "white",
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
        open={Boolean(fontSizeAnchorEl)}
        onClose={() => setFontSizeAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        disableAutoFocus
        disableEnforceFocus
      >
        <Stack spacing={1} p={1}>
          {fontSizes.map((fontSizeObj) => (
            <Box
              key={fontSizeObj.name}
              onMouseDown={(e) => handleClickFontSize(e, fontSizeObj.size)}
              sx={{
                bgcolor: editor?.isActive("textStyle", {
                  fontSize: fontSizeObj.size,
                })
                  ? "action.selected"
                  : "background.paper",
                fontSize: fontSizeObj.size,
                cursor: "pointer",
              }}
            >
              {fontSizeObj.label}
            </Box>
          ))}
        </Stack>
      </Popover>
    </Box>
  );
};
