import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { atom, useRecoilState, useSetRecoilState } from "recoil";

const RecoilExp = dynamic(
  async () => (await import("../../components/recoil-exp")).RecoilExp,
  { ssr: false }
);

const atom1 = atom({
  key: "atom1",
  default: [0],
});

const RecoilExp2 = () => {
  const a = [1];
  const [isInitialized1, setIsInitialized1] = useState(false);
  const [isInitialized2, setIsInitialized2] = useState(false);
  const [, setState1] = useState(0);
  const setState2 = useSetRecoilState(atom1);
  const [, setState3] = useState(0);

  useEffect(() => {
    console.log("init1", isInitialized1);
    if (isInitialized1) return;

    setState1((prev) => prev + a.length);
    setIsInitialized1(true);
  }, [isInitialized1, a]);

  useEffect(() => {
    console.log("init2", isInitialized2);
    if (isInitialized2) return;

    setState2((prev) => [...prev, ...a]);
    setIsInitialized2(true);
  }, [a, isInitialized2, setState2]);

  return (
    <button onClick={() => setState3((prev) => prev + 1)}>increment</button>
  );
};

export default () => {
  return (
    <div>
      <p>recoil</p>
      {/* <RecoilExp /> */}
      <RecoilExp2 />
    </div>
  );
};
