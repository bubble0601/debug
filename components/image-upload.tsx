import imageCompression from 'browser-image-compression'
import { ChangeEvent, useEffect, useState } from 'react'
import { ImageView } from './image-view'

export const ImageUpload = () => {
  const [file, setFile] = useState<File>()
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.currentTarget.files?.[0] || undefined)
  }

  const [orientation, setOrientation] = useState<number>()
  useEffect(() => {
    if (file) {
      imageCompression.getExifOrientation(file).then((result) => {
        setOrientation(result)
      })
    }
  }, [file])

  return (
    <div>
      <input type="file" multiple onChange={handleChange} />
      <div>{`Exif Orientation: ${orientation}`}</div>
      <div>
        <p>plain</p>
        <ImageView file={file} />
      </div>
      <div>
        <p>canvas</p>
        <ImageView file={file} canvas />
      </div>
      <div>
        <p>base64</p>
        <ImageView file={file} base64 />
      </div>
      <div>
        <p>base64, canvas</p>
        <ImageView file={file} base64 canvas />
      </div>
      <div>
        <p>compress</p>
        <ImageView file={file} compress />
      </div>
      <div>
        <p>compress, canvas</p>
        <ImageView file={file} compress canvas />
      </div>
      <div>
        <p>base64, compress</p>
        <ImageView file={file} base64 compress />
      </div>
      <div>
        <p>base64, compress, canvas</p>
        <ImageView file={file} base64 compress canvas />
      </div>
    </div>
  )
}
