import {
  DEFAULT_FONT_NAME,
  Font,
  b64toUint8Array,
  getDefaultFont,
  getFallbackFontName,
} from "@pdfme/common";
import { PDFFont, PDFDocument, rgb } from "@pdfme/pdf-lib";
import { TextFieldSchema } from "./pdf-text-field";
import * as fontkit from "fontkit";
import { Font as FontKitFont } from "fontkit";

const isHexValid = (hex: string): boolean => {
  return /^#(?:[A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/i.test(hex);
};

export const hex2rgb = (hex: string) => {
  if (hex.slice(0, 1) === "#") hex = hex.slice(1);
  if (hex.length === 3)
    hex =
      hex.slice(0, 1) +
      hex.slice(0, 1) +
      hex.slice(1, 2) +
      hex.slice(1, 2) +
      hex.slice(2, 3) +
      hex.slice(2, 3);

  return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((str) =>
    parseInt(str, 16)
  );
};

export const rgb2hex = (r: number, g: number, b: number) => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

export const hex2RgbColor = (hexString: string | undefined) => {
  if (hexString) {
    const isValid = isHexValid(hexString);

    if (!isValid) {
      throw new Error(`Invalid hex color value ${hexString}`);
    }

    const [r, g, b] = hex2rgb(hexString);

    return rgb(r / 255, g / 255, b / 255);
  }

  return undefined;
};

export const embedAndGetFontObj = async (arg: {
  pdfDoc: PDFDocument;
  font: Font;
  _cache: Map<any, any>;
}) => {
  const { pdfDoc, font, _cache } = arg;
  if (_cache.has(pdfDoc)) {
    return _cache.get(pdfDoc) as { [key: string]: PDFFont };
  }

  const fontValues = await Promise.all(
    Object.values(font).map(async (v) => {
      let fontData = v.data;
      if (typeof fontData === "string" && fontData.startsWith("http")) {
        fontData = await fetch(fontData).then((res) => res.arrayBuffer());
      }
      return pdfDoc.embedFont(fontData, {
        subset: typeof v.subset === "undefined" ? true : v.subset,
      });
    })
  );

  const fontObj = Object.keys(font).reduce(
    (acc, cur, i) => Object.assign(acc, { [cur]: fontValues[i] }),
    {} as { [key: string]: PDFFont }
  );

  _cache.set(pdfDoc, fontObj);
  return fontObj;
};

export const getFontProp = async ({
  value,
  font,
  schema,
  _cache,
}: {
  value: string;
  font: Font;
  schema: TextFieldSchema;
  _cache: Map<any, any>;
}) => {
  const fontSize = schema.fontSize ?? 13;
  const color = hex2RgbColor(schema.fontColor || "#000000");

  return {
    alignment: schema.alignment ?? "left",
    verticalAlignment: schema.verticalAlignment ?? "top",
    lineHeight: schema.lineHeight ?? 1,
    characterSpacing: schema.characterSpacing ?? 0,
    fontSize,
    color,
  };
};

const getFallbackFont = (font: Font) => {
  const fallbackFontName = getFallbackFontName(font);
  return font[fallbackFontName];
};

const getCacheKey = (fontName: string) => `getFontKitFont-${fontName}`;

export const getFontKitFont = async (
  textSchema: TextFieldSchema,
  font: Font,
  _cache: Map<any, any>
) => {
  const fontName = textSchema.fontName || getFallbackFontName(font);
  const cacheKey = getCacheKey(fontName);
  if (_cache.has(cacheKey)) {
    return _cache.get(cacheKey) as fontkit.Font;
  }

  const currentFont =
    font[fontName] ||
    getFallbackFont(font) ||
    getDefaultFont()[DEFAULT_FONT_NAME];
  let fontData = currentFont.data;
  if (typeof fontData === "string") {
    fontData = fontData.startsWith("http")
      ? await fetch(fontData).then((res) => res.arrayBuffer())
      : b64toUint8Array(fontData);
  }

  const fontKitFont = fontkit.create(
    fontData instanceof Buffer ? fontData : Buffer.from(fontData as ArrayBuffer)
  );
  _cache.set(cacheKey, fontKitFont);

  return fontKitFont;
};

export const getFontDescentInPt = (
  fontKitFont: FontKitFont,
  fontSize: number
) => {
  const { descent, unitsPerEm } = fontKitFont;

  return (descent / unitsPerEm) * fontSize;
};

export const heightOfFontAtSize = (
  fontKitFont: FontKitFont,
  fontSize: number
) => {
  const { ascent, descent, bbox, unitsPerEm } = fontKitFont;

  const scale = 1000 / unitsPerEm;
  const yTop = (ascent || bbox.maxY) * scale;
  const yBottom = (descent || bbox.minY) * scale;

  let height = yTop - yBottom;
  height -= Math.abs(descent * scale) || 0;

  return (height / 1000) * fontSize;
};
