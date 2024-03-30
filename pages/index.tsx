import Link from "next/link";

export default () => (
  <div>
    <h1>Index</h1>
    <p>
      <Link href="/image/device-orientation">Device orientation</Link>
    </p>
    <p>
      <Link href="/image/exif">Exif</Link>
    </p>
    <p>
      <Link href="/camera">Camera</Link>
    </p>
    <p>
      <Link href="/draft">Editor</Link>
    </p>
    <p>
      <Link href="/tiptap">New Editor</Link>
    </p>
    <p>
      <Link href="/recoil">Recoil</Link>
    </p>
    <p>
      <Link href="/line/leave">Line leave</Link>
    </p>
    <p>
      <Link href="/lifecycle">Lifecycle</Link>
    </p>
    <p>
      <Link href="/ua">UA</Link>
    </p>
    <p>
      <Link href="/pdf">PDF</Link>
    </p>
    <p>
      <Link href="/dynamic/hoge">Dynamic</Link>
    </p>
  </div>
);
