declare module 'exif-parser' {
  interface ExifParserStatic {
    create: (buf: ArrayBuffer) => ExifParser
  }

  interface ExifParser {
    parse: () => any
  }

  const ep: ExifParserStatic
  export = ep
}

declare module 'exif-js' {
  interface ExifJsStatic {
    getData: (img: HTMLImageElement, callback: () => void) => void
    getAllTags: (img: HTMLImageElement) => any
    readFromBinaryFile: (file: ArrayBuffer) => any
  }
  const EXIF: ExifJsStatic
  export = EXIF
}
