import { useEffect } from "react";

export const Child = () => {
  useEffect(() => {
    console.log("mounted");
    return () => {
      console.log("unmounted");
    };
  }, []);

  return (
    <div>
      <p>Child</p>
    </div>
  );
};
