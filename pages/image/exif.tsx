import EXIF from 'exif-js'
// import ep from 'exif-parser'
// import er from 'exif-reader'
import { ChangeEvent, useEffect, useState } from 'react'
import { ImageView } from '../../components/image-view'

const ImageViewWIthMetadata = ({ file }: { file: File }) => {
  const [metadata, setMetadata] = useState<any>()
  useEffect(() => {
    file.arrayBuffer().then((buf) => {
      setMetadata(EXIF.readFromBinaryFile(buf))
    })
    // file.arrayBuffer().then((buf) => {
    //   const parser = ep.create(buf)
    //   setMetadata(parser.parse())
    // })
    // file.arrayBuffer().then((buf) => {
    //   setMetadata(er(buf))
    // })
  }, [file])

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <ImageView file={file} />
      <div>
        <h2>Metadata</h2>
        {metadata === undefined && <div>loading...</div>}
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </div>
    </div>
  )
}

export default () => {
  const [files, setFiles] = useState<File[]>([])
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.currentTarget.files || []))
  }

  return (
    <div style={{ padding: 4 }}>
      <input type="file" multiple onChange={handleChange} />
      {files.map((file) => (
        <ImageViewWIthMetadata key={file.name} file={file} />
      ))}
    </div>
  )
}
