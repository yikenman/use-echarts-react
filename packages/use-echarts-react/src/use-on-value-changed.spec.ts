import { renderHook } from '@testing-library/react';
import equal from 'fast-deep-equal';
import { useOnValueChanged } from './use-on-value-changed';

jest.mock('fast-deep-equal', () => {
  const actual = jest.requireActual('fast-deep-equal');

  return {
    __esModule: true,
    default: jest.fn(actual)
  };
});

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('useOnValueChanged', () => {
  describe('csr', () => {
    it('should increment signalRef.current when value changes', () => {
      const { result, rerender } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: 1 }
      });

      expect(result.current).toBe(1);

      rerender({ val: 2 });

      expect(result.current).toBe(2);
    });

    it('should not increment signalRef.current when value does not change', () => {
      const { result, rerender } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: 1 }
      });

      expect(result.current).toBe(1);

      rerender({ val: 1 });

      expect(result.current).toBe(1);
    });

    it('should not increment signalRef.current if initial value is undefined', () => {
      const { result } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: undefined }
      });

      expect(result.current).toBe(0);
    });

    it('should not increment signalRef.current if enable is false', () => {
      const { result, rerender } = renderHook(({ val, enable }) => useOnValueChanged(val, enable), {
        initialProps: { val: 1, enable: false }
      });

      // signalRef.current should be 0 initially
      expect(result.current).toBe(0);

      // Rerender with the same value and enable as false
      rerender({ val: 1, enable: false });

      // signalRef.current should remain 0 even if the value didn't change because enable is false
      expect(result.current).toBe(0);
    });

    it('should call equal() function when comparing values', () => {
      const { rerender } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: { a: 1 } }
      });

      rerender({ val: { a: 2 } });

      // Check if equal was called to compare the values
      expect(equal).toHaveBeenCalledWith({ a: 2 }, { a: 1 });
    });
  });

  describe('ssr', () => {
    it('should increment signalRef.current when value changes', () => {
      const { result, rerender } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: 1 },
        hydrate: true
      });

      expect(result.current).toBe(1);

      rerender({ val: 2 });

      expect(result.current).toBe(2);
    });

    it('should not increment signalRef.current when value does not change', () => {
      const { result, rerender } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: 1 },
        hydrate: true
      });

      expect(result.current).toBe(1);

      rerender({ val: 1 });

      expect(result.current).toBe(1);
    });

    it('should not increment signalRef.current if initial value is undefined', () => {
      const { result } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: undefined },
        hydrate: true
      });

      expect(result.current).toBe(0);
    });

    it('should not increment signalRef.current if enable is false', () => {
      const { result, rerender } = renderHook(({ val, enable }) => useOnValueChanged(val, enable), {
        initialProps: { val: 1, enable: false },
        hydrate: true
      });

      // signalRef.current should be 0 initially
      expect(result.current).toBe(0);

      // Rerender with the same value and enable as false
      rerender({ val: 1, enable: false });

      // signalRef.current should remain 0 even if the value didn't change because enable is false
      expect(result.current).toBe(0);
    });

    it('should call equal() function when comparing values', () => {
      const { rerender } = renderHook(({ val }) => useOnValueChanged(val, true), {
        initialProps: { val: { a: 1 } },
        hydrate: true
      });

      rerender({ val: { a: 2 } });

      // Check if equal was called to compare the values
      expect(equal).toHaveBeenCalledWith({ a: 2 }, { a: 1 });
    });
  });
});
