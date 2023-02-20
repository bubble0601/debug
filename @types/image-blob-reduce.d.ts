declare module 'image-blob-reduce' {
  import type { Pica, PicaResizeOptions } from 'pica'

  export interface ResizeOptions extends PicaResizeOptions {
    max?: number
  }

  export interface ImageBlobReduce {
    toBlob(blob: Blob, options?: ResizeOptions): Promise<Blob>
  }

  export interface ImageBlobReduceOptions {
    pica?: Pica
  }

  export interface ImageBlobReduceConstructor {
    new (options?: ImageBlobReduceOptions): ImageBlobReduce
    (options?: ImageBlobReduceOptions): ImageBlobReduce
  }

  const ImageBlobReduceConstructor: ImageBlobReduceConstructor
  export default ImageBlobReduceConstructor
}
