import { blue, green, orange, pink, red, yellow } from "@mui/material/colors";

function sliceByNumber<T>(array: T[], number: number): T[][] {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill(undefined)
    .map((_, i) => array.slice(i * number, (i + 1) * number));
}

export const colors: { name: string; color: string }[] = [
  { name: "black", color: "black" },
  { name: "red", color: red[500] },
  { name: "blue", color: blue[500] },
  { name: "yellow", color: yellow[500] },
  { name: "orange", color: orange[500] },
  { name: "pink", color: pink[500] },
  { name: "green", color: green[500] },
];
export const colorStyles: string[] = colors.map((colorObj) => colorObj.name);

export const colorTable = sliceByNumber(colors, 4);

export const colorStyleMap = colors.reduce(
  (acc: { [key: string]: { color: string } }, colorObj) => {
    // eslint-disable-next-line no-param-reassign
    acc[colorObj.name] = { color: colorObj.color };
    return acc;
  },
  {}
);

export const fontSizes: {
  label: string;
  name: string;
  size: string;
}[] = [
  { label: "大文字1", name: "xxLarge", size: "xx-large" },
  { label: "大文字2", name: "xLarge", size: "x-large" },
  { label: "通常", name: "medium", size: "initial" },
];

export const fontSizeStyles: string[] = fontSizes.map(
  (fontSizeObj) => fontSizeObj.name
);

export const fontSizeStyleMap = fontSizes.reduce(
  (acc: { [key: string]: { fontSize: string } }, fontSizeObj) => {
    // eslint-disable-next-line no-param-reassign
    acc[fontSizeObj.name] = { fontSize: fontSizeObj.size };
    return acc;
  },
  {}
);

export const allStyleMap = { ...colorStyleMap, ...fontSizeStyleMap };
