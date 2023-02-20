import { ImageUpload } from '../../components/image-upload'
import styles from './index.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <ImageUpload />
      </main>
    </div>
  )
}
