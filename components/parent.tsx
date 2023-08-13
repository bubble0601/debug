import { Theme, useMediaQuery } from "@mui/material";
import { PropsWithChildren } from "react";

const Parent2 = ({ children }: PropsWithChildren) => {
  const isUpMd = useMediaQuery<Theme>((theme) => theme.breakpoints.up("md"));

  if (isUpMd) {
    return (
      <article>
        <p>Parent2</p>
        {children}
      </article>
    );
  }

  return (
    <div>
      <p>Parent2</p>
      {children}
    </div>
  );
};

export const Parent = ({ children }: PropsWithChildren) => {
  const isUpMd = useMediaQuery<Theme>((theme) => theme.breakpoints.up("md"));

  if (isUpMd) {
    return (
      <Parent2>
        <p>Parent</p>
        {children}
      </Parent2>
    );
  }

  return (
    <Parent2>
      <p>Parent</p>
      {children}
    </Parent2>
  );
};
