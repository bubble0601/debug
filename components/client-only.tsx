import { PropsWithChildren, useEffect, useState } from "react";

export const ClientOnly = ({ children }: PropsWithChildren) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
};
