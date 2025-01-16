import { useState, useSyncExternalStore } from "react";
import {
  createPortalNode,
  InPortal,
  OutPortal,
} from "../../components/reverse-portal";

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
};

const Content = () => {
  const [portalNode] = useState(() => createPortalNode());
  const [mode, setMode] = useState<1 | 2>(1);

  return (
    <>
      <InPortal node={portalNode}>
        <Counter />
      </InPortal>
      <div>
        <p>1</p>
        {mode === 1 && (
          <div style={{ minHeight: "100px", border: "1px solid lightgray" }}>
            <OutPortal node={portalNode} />
          </div>
        )}
        <p>2</p>
        {mode === 2 && (
          <div style={{ minHeight: "100px", border: "1px solid lightblue" }}>
            <OutPortal node={portalNode} />
          </div>
        )}
        <button onClick={() => setMode(1)}>Mode 1</button>
        <button onClick={() => setMode(2)}>Mode 2</button>
      </div>
    </>
  );
};

export default function Page() {
  const isServer = useSyncExternalStore(
    () => () => {},
    () => false,
    () => true
  );

  return (
    <div>
      <h1>Reverse Portal</h1>
      {!isServer && <Content />}
    </div>
  );
}
