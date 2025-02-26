import { renderHook } from '@testing-library/react';
import type { EChartsType } from 'echarts';
import { CHART_INSTANCE } from './contants';
import type { EChartsRef } from './types';
import { useEChartsEvent } from './use-echarts-event';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('useEChartsEvent', () => {
  let instance: jest.Mocked<EChartsType>;
  let listeners: Function[];

  beforeEach(() => {
    listeners = [];
    instance = {
      handlers: [],
      on: jest.fn((_event, query, eventListener) => {
        const listener = eventListener ?? query;
        listeners.push(listener);
      }),
      off: jest.fn(),
      isDisposed: jest.fn().mockReturnValue(false),
      id: 'test-instance'
    } as any;
  });

  describe('csr', () => {
    it('should bind and unbind event listener', () => {
      const ref = { [CHART_INSTANCE]: instance } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();

      const { unmount } = renderHook(() => useEChartsEvent(ref, 'click', handler));

      expect(instance.on).toHaveBeenCalledWith('click', expect.any(Function));

      expect(listeners[0]).toBeDefined();
      listeners[0]();
      expect(handler).toHaveBeenCalled();

      unmount();
      expect(instance.off).toHaveBeenCalledWith('click', listeners[0]);
    });

    it('should not bind event if instance is null', () => {
      const ref = { [CHART_INSTANCE]: null } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();

      renderHook(() => useEChartsEvent(ref, 'click', handler));

      expect(instance.on).not.toHaveBeenCalled();
    });

    it('should unbind event only if instance is not disposed', () => {
      instance.isDisposed.mockReturnValue(true);

      const ref = { [CHART_INSTANCE]: instance } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();

      const { unmount } = renderHook(() => useEChartsEvent(ref, 'click', handler));

      unmount();
      expect(instance.off).not.toHaveBeenCalled();
    });

    it('should bind event with query', () => {
      const ref = { [CHART_INSTANCE]: instance } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();
      const query = { seriesIndex: 0 };

      const { unmount } = renderHook(() => useEChartsEvent(ref, 'click', query, handler));

      expect(instance.on).toHaveBeenCalledWith('click', query, expect.any(Function));

      expect(listeners[0]).toBeDefined();
      listeners[0]();
      expect(handler).toHaveBeenCalled();

      unmount();
      expect(instance.off).toHaveBeenCalledWith('click', listeners[0]);
    });
  });

  describe('ssr', () => {
    it('should bind and unbind event listener', () => {
      const ref = { [CHART_INSTANCE]: instance } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();

      const { unmount } = renderHook(() => useEChartsEvent(ref, 'click', handler), { hydrate: true });

      expect(instance.on).toHaveBeenCalledWith('click', expect.any(Function));

      expect(listeners[0]).toBeDefined();
      listeners[0]();
      expect(handler).toHaveBeenCalled();

      unmount();
      expect(instance.off).toHaveBeenCalledWith('click', listeners[0]);
    });

    it('should not bind event if instance is null', () => {
      const ref = { [CHART_INSTANCE]: null } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();

      renderHook(() => useEChartsEvent(ref, 'click', handler), { hydrate: true });

      expect(instance.on).not.toHaveBeenCalled();
    });

    it('should unbind event only if instance is not disposed', () => {
      instance.isDisposed.mockReturnValue(true);

      const ref = { [CHART_INSTANCE]: instance } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();

      const { unmount } = renderHook(() => useEChartsEvent(ref, 'click', handler), { hydrate: true });

      unmount();
      expect(instance.off).not.toHaveBeenCalled();
    });

    it('should bind event with query', () => {
      const ref = { [CHART_INSTANCE]: instance } as unknown as EChartsRef<HTMLElement>;
      const handler = jest.fn();
      const query = { seriesIndex: 0 };

      const { unmount } = renderHook(() => useEChartsEvent(ref, 'click', query, handler), { hydrate: true });

      expect(instance.on).toHaveBeenCalledWith('click', query, expect.any(Function));

      expect(listeners[0]).toBeDefined();
      listeners[0]();
      expect(handler).toHaveBeenCalled();

      unmount();
      expect(instance.off).toHaveBeenCalledWith('click', listeners[0]);
    });
  });
});
