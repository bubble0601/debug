import Link from 'next/link'

export default () => (
  <div>
    <h1>Index</h1>
    <p>
      <a href="/image/device-orientation">Device orientation</a>
    </p>
    <p>
      <a href="/image/exif">Exif</a>
    </p>
    <p>
      <a href="/camera">Camera</a>
    </p>
    <p>
      <a href="/draft">Editor</a>
    </p>
    <p>
      <a href="/recoil">Recoil</a>
    </p>
    <p>
      <Link href="/line/leave">Line leave</Link>
    </p>
  </div>
)
