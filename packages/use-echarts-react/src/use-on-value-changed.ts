import equal from 'fast-deep-equal';
import { useRef } from 'react';

export const useOnValueChanged = (val: unknown, enable?: boolean) => {
  const ref = useRef<typeof val>(undefined);
  const signalRef = useRef<number>(0);

  if (enable && !equal(val, ref.current)) {
    signalRef.current += 1;
  }
  ref.current = val;

  return signalRef.current;
};
