import { TextAlignment } from "@pdfme/pdf-lib";
import {
  DEFAULT_FONT_NAME,
  PDFRenderProps,
  Plugin,
  PropPanel,
  Schema,
  UIRenderProps,
  getDefaultFont,
  getFallbackFontName,
} from "@pdfme/common";
import { embedAndGetFontObj, getFontProp, hex2RgbColor } from "./helper";
import { convertForPdfLayoutProps } from "@pdfme/schemas";
import { CSSProperties } from "react";

export type ALIGNMENT = "left" | "center" | "right";
export type VERTICAL_ALIGNMENT = "top" | "middle" | "bottom";
export type DYNAMIC_FONT_SIZE_FIT = "horizontal" | "vertical";

const HEX_COLOR_PATTERN =
  "^#(?:[A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$";

export interface TextFieldSchema extends Schema {
  fontName?: string;
  alignment: ALIGNMENT;
  // verticalAlignment: VERTICAL_ALIGNMENT;
  fontSize: number;
  // lineHeight: number;
  characterSpacing: number;
  // dynamicFontSize?: {
  //   min: number;
  //   max: number;
  //   fit: DYNAMIC_FONT_SIZE_FIT;
  // };

  fontColor: string;
  backgroundColor: string;
}

const propPanel: PropPanel<TextFieldSchema> = {
  schema: ({ options, activeSchema, i18n }) => {
    const font = options.font || {
      [DEFAULT_FONT_NAME]: { data: "", fallback: true },
    };
    const fontNames = Object.keys(font);
    const fallbackFontName = getFallbackFontName(font);

    const enableDynamicFont = Boolean((activeSchema as any)?.dynamicFontSize);

    return {
      fontName: {
        title: i18n("schemas.text.fontName"),
        type: "string",
        widget: "select",
        default: fallbackFontName,
        props: {
          options: fontNames.map((name) => ({ label: name, value: name })),
        },
        span: 12,
      },
      fontSize: {
        title: i18n("schemas.text.size"),
        type: "number",
        widget: "inputNumber",
        span: 6,
        disabled: enableDynamicFont,
      },
      characterSpacing: {
        title: i18n("schemas.text.spacing"),
        type: "number",
        widget: "inputNumber",
        span: 6,
      },
      alignment: {
        title: i18n("schemas.text.textAlign"),
        type: "string",
        widget: "select",
        props: {
          options: [
            { label: i18n("schemas.left"), value: "left" },
            { label: i18n("schemas.center"), value: "center" },
            { label: i18n("schemas.right"), value: "right" },
          ],
        },
        span: 8,
      },
      // verticalAlignment: {
      //   title: i18n("schemas.text.verticalAlign"),
      //   type: "string",
      //   widget: "select",
      //   props: {
      //     options: [
      //       { label: i18n("schemas.top"), value: "top" },
      //       { label: i18n("schemas.middle"), value: "middle" },
      //       { label: i18n("schemas.bottom"), value: "bottom" },
      //     ],
      //   },
      //   span: 8,
      // },
      // lineHeight: {
      //   title: i18n("schemas.text.lineHeight"),
      //   type: "number",
      //   widget: "inputNumber",
      //   props: {
      //     step: 0.1,
      //   },
      //   span: 8,
      // },
      // useDynamicFontSize: {
      //   type: "boolean",
      //   widget: "UseDynamicFontSize",
      //   bind: false,
      //   span: 16,
      // },
      // dynamicFontSize: {
      //   type: "object",
      //   widget: "card",
      //   column: 3,
      //   properties: {
      //     min: {
      //       title: i18n("schemas.text.min"),
      //       type: "number",
      //       widget: "inputNumber",
      //       hidden: !enableDynamicFont,
      //     },
      //     max: {
      //       title: i18n("schemas.text.max"),
      //       type: "number",
      //       widget: "inputNumber",
      //       hidden: !enableDynamicFont,
      //     },
      //     fit: {
      //       title: i18n("schemas.text.fit"),
      //       type: "string",
      //       widget: "select",
      //       hidden: !enableDynamicFont,
      //       props: {
      //         options: [
      //           { label: i18n("schemas.horizontal"), value: "horizontal" },
      //           { label: i18n("schemas.vertical"), value: "vertical" },
      //         ],
      //       },
      //     },
      //   },
      // },
      fontColor: {
        title: i18n("schemas.textColor"),
        type: "string",
        widget: "color",
        rules: [
          {
            pattern: HEX_COLOR_PATTERN,
            message: "Please enter a valid hex color code.",
          },
        ],
      },
      backgroundColor: {
        title: i18n("schemas.bgColor"),
        type: "string",
        widget: "color",
        rules: [
          {
            pattern: HEX_COLOR_PATTERN,
            message: "Please enter a valid hex color code.",
          },
        ],
      },
    };
  },
  defaultValue: "穴埋めテキスト",
  defaultSchema: {
    type: "textField",
    position: { x: 0, y: 0 },
    width: 80,
    height: 16,
    // rotate: 0,
    alignment: "left",
    // verticalAlignment: "top",
    fontSize: 13,
    // lineHeight: 1,
    characterSpacing: 0,
    fontColor: "#000000",
    fontName: undefined,
    backgroundColor: "",
    // opacity: 1,
  },
};

const pdfRender = async ({
  key,
  pdfDoc,
  pdfLib,
  page,
  options,
  schema,
  _cache,
}: PDFRenderProps<TextFieldSchema>) => {
  const { font = getDefaultFont() } = options;
  const [pdfFontObj, /* fontKitFont, */ fontProp] = await Promise.all([
    embedAndGetFontObj({ pdfDoc, font, _cache }),
    // getFontKitFont(schema, font, _cache),
    getFontProp({ value: "", font, schema, _cache }),
  ]);

  const {
    fontSize,
    color,
    alignment,
    // verticalAlignment,
    // lineHeight,
    characterSpacing,
  } = fontProp;
  const fontName = (
    schema.fontName ? schema.fontName : getFallbackFontName(font)
  ) as keyof typeof pdfFontObj;
  const pdfFontValue = pdfFontObj[fontName];

  const pageHeight = page.getHeight();
  const {
    width,
    height,
    // rotate,
    position: { x, y },
    // opacity,
  } = convertForPdfLayoutProps({
    schema,
    pageHeight,
    applyRotateTranslate: false,
  });

  // if (schema.backgroundColor) {
  //   const color = hex2RgbColor(schema.backgroundColor);
  //   page.drawRectangle({ x, y, width, height, rotate, color });
  // }

  page.pushOperators(pdfLib.setCharacterSpacing(characterSpacing ?? 0));

  const textField = pdfDoc.getForm().createTextField(key);
  textField.setAlignment(
    alignment === "right"
      ? TextAlignment.Right
      : alignment === "center"
      ? TextAlignment.Center
      : TextAlignment.Left
  );
  if (height > fontSize * 2.5) {
    textField.enableMultiline();
  }
  textField.addToPage(page, {
    x,
    y,
    width: width,
    height: height,
    textColor: color,
    backgroundColor: hex2RgbColor(schema.backgroundColor),
    font: pdfFontValue,
    // rotate,
  });
  textField.setFontSize(fontSize);
};

const addAlphaToHex = (hex: string, alphaPercentage: number) => {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(hex)) {
    throw new Error("Invalid HEX color code");
  }
  const alphaValue = Math.round((alphaPercentage / 100) * 255);
  let alphaHex = alphaValue.toString(16);
  if (alphaHex.length === 1) alphaHex = "0" + alphaHex;
  return hex + alphaHex;
};

const getBackgroundColor = (
  mode: "form" | "viewer" | "designer",
  value: string,
  schema: Schema,
  defaultBackgroundColor: string
) => {
  if (
    (mode === "form" || mode === "designer") &&
    value &&
    schema.backgroundColor
  ) {
    return schema.backgroundColor as string;
  } else if (mode === "viewer") {
    return (schema.backgroundColor as string) ?? "transparent";
  } else {
    return defaultBackgroundColor;
  }
};

const uiRender = async ({
  key: value,
  schema,
  rootElement,
  mode,
  onChange,
  stopEditing,
  tabIndex,
  placeholder,
  options,
  theme,
}: UIRenderProps<TextFieldSchema>) => {
  // const font = options?.font || getDefaultFont();
  // const fontKitFont = await getFontKitFont(schema, font, new Map());

  const container = document.createElement("div");

  const containerStyle: CSSProperties = {
    padding: 0,
    resize: "none",
    backgroundColor: getBackgroundColor(
      mode,
      value,
      schema,
      addAlphaToHex(theme.colorPrimaryBg, 30)
    ),
    border: "none",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    opacity: schema.opacity,
  };
  Object.assign(container.style, containerStyle);
  rootElement.innerHTML = "";
  rootElement.appendChild(container);

  const fontStyles: CSSProperties = {
    fontFamily: schema.fontName ? `'${schema.fontName}'` : "inherit",
    color: schema.fontColor ? schema.fontColor : "#000000",
    fontSize: `${schema.fontSize ?? 13}pt`,
    letterSpacing: `${schema.characterSpacing ?? 0}pt`,
    // lineHeight: `${schema.lineHeight ?? 1}em`,
    textAlign: schema.alignment ?? "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const textarea = document.createElement("textarea");
  const textareaStyle: CSSProperties = {
    padding: 0,
    resize: "none",
    border: "none",
    outline: "none",
    // paddingTop: topAdjustment + 'px',
    backgroundColor: "transparent",
    width: "100%",
    height: "100%",
  };
  Object.assign(textarea.style, textareaStyle, fontStyles);
  textarea.rows = 1;
  textarea.placeholder = placeholder || "";
  textarea.tabIndex = tabIndex || 0;

  textarea.addEventListener(
    "change",
    (e) => onChange && onChange((e.target as HTMLTextAreaElement).value)
  );
  textarea.addEventListener("blur", () => stopEditing && stopEditing());
  textarea.value = value;
  container.appendChild(textarea);
  if (mode === "designer") {
    textarea.setSelectionRange(value.length, value.length);
    textarea.focus();
  }
};

export const textField: Plugin<TextFieldSchema> = {
  pdf: pdfRender,
  ui: uiRender,
  propPanel,
};
