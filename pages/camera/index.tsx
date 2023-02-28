import { Camera } from '../../components/camera'

export default () => {
  return (
    <Camera
      onTakePhoto={async (name, data) => console.log(name)}
      onClose={() => {}}
    />
  )
}
