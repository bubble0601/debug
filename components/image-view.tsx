import imageCompression from 'browser-image-compression'
import ImageBlobReduce from 'image-blob-reduce'
import { memo, useEffect, useRef, useState } from 'react'
import styles from './image-view.module.css'

// const reduce = new ImageBlobReduce()

const width = 320
const height = 240

const Image = ({ url }: { url: string }) => {
  return (
    <img
      src={url}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  )
}

const Canvas = ({ url }: { url: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const image = document.createElement('img')
    image.src = url
    image.onload = () => {
      ctx.drawImage(image, 0, 0, width, height)
    }

    return () => ctx.clearRect(0, 0, width, height)
  }, [url])
  return <canvas ref={canvasRef} width={width} height={height} />
}

const toBase64 = async (blob: File | Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsDataURL(blob)
  })

type Props = {
  file?: File
  compress?: boolean
  base64?: boolean
  canvas?: boolean
}
export const ImageView = memo(
  ({ file, compress = false, base64 = false, canvas = false }: Props) => {
    const [url, setUrl] = useState<string>()

    useEffect(() => {
      if (!file) return

      if (compress) {
        const reduce = new ImageBlobReduce()
        reduce.toBlob(file, { max: 1920 }).then((resized) => {
          const resizedFile = new File([resized], '', {
            type: resized.type,
          })
          imageCompression(resizedFile, {
            maxSizeMB: 0.1,
          }).then((compressedFile) => {
            if (base64) {
              imageCompression
                .getDataUrlFromFile(compressedFile)
                .then((result) => {
                  setUrl(result)
                })
            } else {
              setUrl(URL.createObjectURL(compressedFile))
            }
          })
        })
      } else if (base64) {
        toBase64(file).then((url) => {
          setUrl(url)
        })
      } else {
        setUrl(URL.createObjectURL(file))
      }

      return () => {
        if (url) URL.revokeObjectURL(url)
      }
    }, [file])

    if (!url) return null
    return (
      <div className={styles.container}>
        {canvas ? <Canvas url={url} /> : <Image url={url} />}
      </div>
    )
  }
)
