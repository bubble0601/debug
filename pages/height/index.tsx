import { useEffect, useState } from "react";

export default function Page() {
  const [h1, setH1] = useState(0);
  useEffect(() => {
    setH1(window.innerHeight);
    window.addEventListener("resize", () => {
      setH1(window.innerHeight);
    });
  }, []);

  return (
    <>
      <div style={{ display: "flex", gap: "4px" }}>
        <div
          style={{ height: "100vh", border: "10px solid black", width: "50px" }}
        >
          vh
        </div>
        <div
          style={{
            height: "100svh",
            border: "10px solid black",
            width: "50px",
          }}
        >
          svh
        </div>
        <div
          style={{
            height: "100lvh",
            border: "10px solid black",
            width: "50px",
          }}
        >
          lvh
        </div>
        <div
          style={{
            height: "100dvh",
            border: "10px solid black",
            width: "50px",
          }}
        >
          dvh
        </div>
        <div style={{ height: h1, border: "10px solid black", width: "50px" }}>
          innerHeight
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 0, opacity: 0.5 }}>
        <input type="text" placeholder="input" style={{ width: "100vw" }} />
      </div>
    </>
  );
}
