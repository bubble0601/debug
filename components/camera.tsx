import { Camera as CameraIcon, Close as CloseIcon } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Snackbar,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'
import { useLongPress } from '../common/click'

const StyledImage = styled('img')({
  display: 'block',
  height: '48px',
  objectFit: 'contain',
})

type PhotoSnackbarProps = {
  data: Blob
}
const PhotoSnackbar = ({ data }: PhotoSnackbarProps) => {
  const [open, setOpen] = useState(true)
  const url = URL.createObjectURL(data)
  const handleClose = () => {
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      sx={{ /* スマホ用 */ right: 'auto' }}
    >
      <Box
        sx={{
          background: 'grey',
          padding: '1px',
          borderRadius: '2px',
        }}
      >
        <StyledImage src={url} alt="captured" />
      </Box>
    </Snackbar>
  )
}

const StyledIconButton = styled(IconButton)({
  backgroundColor: 'white',
  borderRadius: '50%',
  padding: 2,
  '&:hover': {
    backgroundColor: 'lightgrey',
  },
})

// 撮影した画像を描画するためのキャンバス
const canvas =
  typeof window !== 'undefined' ? document.createElement('canvas') : null
const ctx =
  canvas &&
  canvas.getContext('2d', {
    // パフォーマンスのために透過を無効化
    alpha: false,
  })

type Props = {
  onClose: () => void
  onTakePhoto: (name: string, data: Blob) => Promise<void>
}

export const Camera = ({ onClose, onTakePhoto }: Props) => {
  const { enqueueSnackbar } = useSnackbar()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const cleanup = useRef<() => void>()
  const [denied, setDenied] = useState(false)
  const [snackbars, setSnackbars] = useState<
    Array<{ key: string } & PhotoSnackbarProps>
  >([])

  const initializeCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    if (devices.every((d) => d.kind !== 'videoinput')) {
      enqueueSnackbar('カメラが見つかりません', { variant: 'error' })
      onClose()
      return
    }

    const videoStream = await navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })
      .catch(() => {
        setDenied(true)
      })
    if (!videoStream) return

    cleanup.current = () =>
      videoStream.getTracks().forEach((track) => track.stop())
    if (!videoRef.current) return

    videoRef.current.srcObject = videoStream
    videoRef.current.addEventListener('play', () => {
      setPlaying(true)
    })
  }

  useEffect(() => {
    initializeCamera()

    return () => {
      cleanup.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const takePhoto = async () => {
    if (!videoRef.current || !ctx) throw new Error()

    const [width, height] = [
      videoRef.current.videoWidth,
      videoRef.current.videoHeight,
    ]
    canvas.width = width
    canvas.height = height
    ctx.drawImage(videoRef.current, 0, 0, width, height)

    const photo = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((data) => {
        if (data) resolve(data)
        else reject()
      }, 'image/jpeg')
    })

    const name = `auto.jpg`
    setSnackbars((prev) => [...prev, { key: name, data: photo }])
    await onTakePhoto(name, photo)
  }

  const { handlePointerDown, handlePointerUp } = useLongPress(
    takePhoto,
    takePhoto,
    { interval: 200, threshold: 1000 }
  )

  return (
    <Dialog open fullScreen>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          height: '100%',
          backgroundColor: 'black',
          // Safariでは必要
          zIndex: 0,
        }}
      >
        <track kind="captions" />
      </video>
      {/* ボタン */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 1,
          justifyContent: 'space-between',
          '@media (orientation: landscape)': {
            paddingRight: 2,
          },
          '@media (orientation: portrait)': {
            flexDirection: 'column',
            paddingBottom: 2,
          },
        }}
      >
        <Box sx={{ color: 'white' }}>
          <IconButton color="inherit" onClick={onClose} sx={{ mt: 1, ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {playing && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <StyledIconButton
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            >
              <CameraIcon sx={{ fontSize: '36px' }} />
            </StyledIconButton>
          </Box>
        )}
      </Box>
      {/* メッセージ等 */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {denied && (
          <Box color={(theme) => theme.palette.error.main}>
            カメラの使用を許可してください
          </Box>
        )}
        {!denied && !playing && <CircularProgress />}
      </Box>
      {snackbars.map(({ key, ...props }) => (
        <PhotoSnackbar key={key} {...props} />
      ))}
    </Dialog>
  )
}
