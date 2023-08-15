import { useRef } from "react";

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  const prevRef = useRef<T>();
  prevRef.current = ref.current;
  ref.current = value;
  return prevRef.current;
};
