import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const B = forwardRef(({}, ref) => {
  console.log("B");
  const [state, setState] = useState(0);
  useImperativeHandle(
    ref,
    () => ({
      setState,
    }),
    []
  );
  return <p>B</p>;
});

const C = ({ onClick }: { onClick: () => void }) => {
  console.log("C");
  return (
    <div style={{ border: "1px solid #dddddddd" }}>
      <p>C</p>
      <button onClick={onClick}>button</button>
    </div>
  );
};

const A = () => {
  const ref = useRef(null);
  return (
    <div style={{ margin: "16px" }}>
      <p>A</p>
      <B ref={ref} />
      <C
        onClick={() => {
          (ref.current as any).setState((p: number) => p + 1);
        }}
      />
    </div>
  );
};

export default A;
