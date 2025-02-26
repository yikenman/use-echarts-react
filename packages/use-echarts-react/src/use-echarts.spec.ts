import { act, renderHook } from '@testing-library/react';
import { EChartsType, init } from 'echarts';
import useResizeObserver from 'use-resize-observer';
import { CHART_INSTANCE } from './contants';
import { useECharts } from './use-echarts';
import { useOnValueChanged } from './use-on-value-changed';
import {
  createProxyEChartsInstance,
  isOptType,
  joinGroup,
  leaveGroup,
  noop,
  setLoadingStatus,
  splitInitOpts
} from './utils';

jest.mock('echarts', () => {
  const actual = jest.requireActual('echarts');

  return {
    ...actual,
    init: jest.fn(actual.init)
  };
});

jest.mock('use-resize-observer', () => {
  return {
    __esModule: true,
    default: jest.fn()
  };
});

jest.mock('./utils', () => {
  const actual = jest.requireActual('./utils');

  return {
    ...actual,
    setLoadingStatus: jest.fn(actual.setLoadingStatus),
    noop: jest.fn(actual.noop),
    createProxyEChartsInstance: jest.fn(actual.createProxyEChartsInstance),
    splitInitOpts: jest.fn(actual.splitInitOpts),
    isOptType: jest.fn(actual.isOptType),
    joinGroup: jest.fn(actual.joinGroup),
    leaveGroup: jest.fn(actual.leaveGroup)
  };
});

jest.mock('./use-on-value-changed', () => {
  const actual = jest.requireActual('./use-on-value-changed');

  return {
    ...actual,
    useOnValueChanged: jest.fn(actual.useOnValueChanged)
  };
});

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('useECharts', () => {
  let mockInstance: EChartsType;
  let node: HTMLDivElement;
  let opt: any;
  let initOptions: any;

  beforeEach(() => {
    mockInstance = {
      setOption: jest.fn(),
      resize: jest.fn(),
      dispose: jest.fn(),
      isDisposed: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn()
    } as any;
    jest.mocked(init).mockReturnValue(mockInstance);

    node = document.createElement('div');

    opt = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line',
          areaStyle: {}
        }
      ]
    };

    initOptions = {
      notMerge: true
    };
  });

  describe('csr', () => {
    it('returns a ref function with ECharts instance', () => {
      const { result } = renderHook(() => useECharts(opt, initOptions));

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();
      expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], undefined);

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should update instance options when opt changed', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' } } }
      });

      act(() => {
        result.current(node);
      });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));

      rerender({ options: { title: { text: 'Updated' } } });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));
    });

    it('should dispose instance on unmount', () => {
      const { result, unmount } = renderHook(() => useECharts());

      act(() => {
        result.current(node);
      });

      unmount();
      expect(mockInstance.dispose).toHaveBeenCalled();
    });

    it('should accept empty parameters', () => {
      const { result } = renderHook(() => useECharts());

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should accept only opt', () => {
      const { result } = renderHook(() => useECharts(opt));

      act(() => {
        result.current(node);
      });

      expect(isOptType).toHaveBeenCalledWith(opt);
      expect(jest.mocked(isOptType).mock.results[0].value).toBe(true);

      expect(splitInitOpts).toHaveBeenCalledWith(undefined);

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should accept only initOptions', () => {
      const { result } = renderHook(() => useECharts(initOptions));

      act(() => {
        result.current(node);
      });

      expect(isOptType).toHaveBeenCalledWith(initOptions);
      expect(jest.mocked(isOptType).mock.results[0].value).toBe(false);

      expect(splitInitOpts).toHaveBeenCalledWith(initOptions);

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should not initialize ECharts instance when no binding to dom', () => {
      const { result } = renderHook(() => useECharts());

      expect(init).not.toHaveBeenCalled();

      act(() => {
        // @ts-ignore
        result.current();
      });

      expect(init).not.toHaveBeenCalled();

      // @ts-ignore
      expect(result.current.current).toBe(null);
      expect(result.current.chart).toBe(null);
    });

    it('should use dom width and height by default', () => {
      // @ts-ignore
      jest.spyOn(node, 'getBoundingClientRect').mockReturnValue({
        width: 321,
        height: 123
      });

      const { result } = renderHook(() => useECharts());

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalledWith(
        node,
        undefined,
        expect.objectContaining({
          width: 321,
          height: 123
        })
      );
    });

    it('should accept custom width and height if provided', () => {
      // @ts-ignore
      jest.spyOn(node, 'getBoundingClientRect').mockReturnValue({
        width: 321,
        height: 123
      });

      const { result } = renderHook(() =>
        useECharts(
          {},
          {
            width: 123,
            height: 321
          }
        )
      );

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalledWith(
        node,
        undefined,
        expect.objectContaining({
          width: 123,
          height: 321
        })
      );
    });

    it('should re-initialize ECharts instance when dom changed', () => {
      const { result } = renderHook(() => useECharts());

      act(() => {
        result.current(node);
      });
      expect(init).toHaveBeenCalledWith(node, undefined, expect.any(Object));

      act(() => {
        result.current(null);
      });
      expect(mockInstance.dispose).toHaveBeenCalled();

      const newNode = document.createElement('div');
      act(() => {
        result.current(newNode);
      });
      expect(init).toHaveBeenCalledWith(newNode, undefined, expect.any(Object));
    });

    it('should use latest options when ECharts instance initialized', () => {
      const { result } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' } } }
      });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));
    });

    it('should update with latest options when dom changed', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' } } }
      });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));

      rerender({ options: { title: { text: 'Updated' } } });
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));

      act(() => {
        result.current(null);
      });
      jest.mocked(mockInstance.setOption).mockReset();
      expect(mockInstance.setOption).not.toHaveBeenCalled();

      const newNode = document.createElement('div');
      act(() => {
        result.current(newNode);
      });
      expect(init).toHaveBeenCalledWith(newNode, undefined, expect.any(Object));
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));
    });

    it('should not handle ECharts resize event by default', () => {
      const { result } = renderHook(() => useECharts());

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(useResizeObserver).toHaveBeenCalledWith({
        ref: node,
        onResize: noop
      });

      jest.mocked(useResizeObserver).mock.calls[0][0]?.onResize!({
        width: 345,
        height: 456
      });

      expect(mockInstance.resize).not.toHaveBeenCalled();
      expect(noop).toHaveBeenCalled();
    });

    it('should handle ECharts resize event if enabled', () => {
      const { result } = renderHook(() => useECharts({}, { resize: true }));

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(useResizeObserver).toHaveBeenCalledWith({
        ref: node,
        onResize: expect.any(Function)
      });

      jest.mocked(useResizeObserver).mock.calls[0][0]?.onResize!({
        width: 345,
        height: 456
      });

      expect(mockInstance.resize).toHaveBeenCalledWith({
        width: 345,
        height: 456
      });
    });

    it('should handle ECharts instance group when provided', () => {
      const { result, unmount } = renderHook(() => useECharts({ group: 'group' }));

      act(() => {
        result.current(node);
      });

      const instance = result.current[CHART_INSTANCE];
      expect(joinGroup).toHaveBeenCalledWith(instance, 'group');

      unmount();

      expect(leaveGroup).toHaveBeenCalledWith(instance, 'group');
    });

    it('should handle ECharts instance loading state when provided', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' }, loading: true } }
      });

      expect(mockInstance.showLoading).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));
      expect(setLoadingStatus).toHaveBeenCalledWith(result.current[CHART_INSTANCE], true);

      rerender({ options: { title: { text: 'Updated' }, loading: false } });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));
      expect(setLoadingStatus).toHaveBeenCalledWith(result.current[CHART_INSTANCE], false);
    });

    it('should use deep comparing when enabled', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options, { deepCompare: true }), {
        initialProps: { options: { title: { text: 'Test' } } }
      });

      expect(useOnValueChanged).toHaveBeenCalledWith({ title: { text: 'Test' } }, true);

      act(() => {
        result.current(node);
      });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));

      jest.mocked(mockInstance.setOption).mockReset();
      rerender({ options: { title: { text: 'Update' } } });
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Update' } }, expect.any(Object));

      jest.mocked(mockInstance.setOption).mockReset();
      rerender({ options: { title: { text: 'Update' } } });
      expect(mockInstance.setOption).not.toHaveBeenCalledWith({ title: { text: 'Update' } }, expect.any(Object));
    });

    describe('Imperative Mode', () => {
      let spyWarn: jest.Mocked<any>;

      beforeEach(() => {
        spyWarn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

        initOptions.imperativeMode = true;
      });

      it('should enable imperative mode if provided', () => {
        const { result } = renderHook(() => useECharts(opt, initOptions));

        act(() => {
          result.current(node);
        });

        expect(spyWarn).toHaveBeenCalledWith(`Declaring chart options will be ignored in imperative mode.`);

        expect(init).toHaveBeenCalled();
        expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], true);

        expect(typeof result.current).toBe('function');
        // @ts-ignore
        expect(result.current.current).toBe(node);
        expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
      });

      it('should not update option in imperative mode', () => {
        const { result, rerender } = renderHook(({ options }) => useECharts(options, initOptions), {
          initialProps: { options: { title: { text: 'Test' } } }
        });

        act(() => {
          result.current(node);
        });

        expect(spyWarn).toHaveBeenCalledWith(`Declaring chart options will be ignored in imperative mode.`);

        expect(mockInstance.setOption).not.toHaveBeenCalled();

        rerender({ options: { title: { text: 'Updated' } } });

        expect(mockInstance.setOption).not.toHaveBeenCalled();
      });
    });

    describe('ECharts SSR Mode', () => {
      beforeEach(() => {
        initOptions.ssr = true;
      });

      it('should initialize ECharts instance with no dom', () => {
        const { result } = renderHook(() => useECharts(opt, initOptions));

        expect(init).toHaveBeenCalled();
        expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], undefined);

        expect(typeof result.current).toBe('function');
        // @ts-ignore
        expect(result.current.current).toBe(null);
        expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
      });

      it('should not initialize ECharts instance if dom provided', () => {
        const { result } = renderHook(() => useECharts(opt, initOptions));

        act(() => {
          result.current(node);
        });

        expect(init).toHaveBeenCalled();
        expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], undefined);

        expect(typeof result.current).toBe('function');
        // @ts-ignore
        expect(result.current.current).toBe(null);
        expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
      });
    });
  });

  describe('ssr', () => {
    it('returns a ref function with ECharts instance', () => {
      const { result } = renderHook(() => useECharts(opt, initOptions), { hydrate: true });

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();
      expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], undefined);

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should update instance options when opt changed', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' } } },
        hydrate: true
      });

      act(() => {
        result.current(node);
      });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));

      rerender({ options: { title: { text: 'Updated' } } });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));
    });

    it('should dispose instance on unmount', () => {
      const { result, unmount } = renderHook(() => useECharts(), { hydrate: true });

      act(() => {
        result.current(node);
      });

      unmount();
      expect(mockInstance.dispose).toHaveBeenCalled();
    });

    it('should accept empty parameters', () => {
      const { result } = renderHook(() => useECharts(), { hydrate: true });

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should accept only opt', () => {
      const { result } = renderHook(() => useECharts(opt), { hydrate: true });

      act(() => {
        result.current(node);
      });

      expect(isOptType).toHaveBeenCalledWith(opt);
      expect(jest.mocked(isOptType).mock.results[0].value).toBe(true);

      expect(splitInitOpts).toHaveBeenCalledWith(undefined);

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should accept only initOptions', () => {
      const { result } = renderHook(() => useECharts(initOptions), { hydrate: true });

      act(() => {
        result.current(node);
      });

      expect(isOptType).toHaveBeenCalledWith(initOptions);
      expect(jest.mocked(isOptType).mock.results[0].value).toBe(false);

      expect(splitInitOpts).toHaveBeenCalledWith(initOptions);

      expect(typeof result.current).toBe('function');
      // @ts-ignore
      expect(result.current.current).toBe(node);
      expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
    });

    it('should not initialize ECharts instance when no binding to dom', () => {
      const { result } = renderHook(() => useECharts(), { hydrate: true });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        // @ts-ignore
        result.current();
      });

      expect(init).not.toHaveBeenCalled();

      // @ts-ignore
      expect(result.current.current).toBe(null);
      expect(result.current.chart).toBe(null);
    });

    it('should use dom width and height by default', () => {
      // @ts-ignore
      jest.spyOn(node, 'getBoundingClientRect').mockReturnValue({
        width: 321,
        height: 123
      });

      const { result } = renderHook(() => useECharts(), { hydrate: true });

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalledWith(
        node,
        undefined,
        expect.objectContaining({
          width: 321,
          height: 123
        })
      );
    });

    it('should accept custom width and height if provided', () => {
      // @ts-ignore
      jest.spyOn(node, 'getBoundingClientRect').mockReturnValue({
        width: 321,
        height: 123
      });

      const { result } = renderHook(
        () =>
          useECharts(
            {},
            {
              width: 123,
              height: 321
            }
          ),
        { hydrate: true }
      );

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalledWith(
        node,
        undefined,
        expect.objectContaining({
          width: 123,
          height: 321
        })
      );
    });

    it('should re-initialize ECharts instance when dom changed', () => {
      const { result } = renderHook(() => useECharts(), { hydrate: true });

      act(() => {
        result.current(node);
      });
      expect(init).toHaveBeenCalledWith(node, undefined, expect.any(Object));

      act(() => {
        result.current(null);
      });
      expect(mockInstance.dispose).toHaveBeenCalled();

      const newNode = document.createElement('div');
      act(() => {
        result.current(newNode);
      });
      expect(init).toHaveBeenCalledWith(newNode, undefined, expect.any(Object));
    });

    it('should use latest options when ECharts instance initialized', () => {
      const { result } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' } } },
        hydrate: true
      });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));
    });

    it('should update with latest options when dom changed', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' } } },
        hydrate: true
      });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(init).toHaveBeenCalled();
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));

      rerender({ options: { title: { text: 'Updated' } } });
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));

      act(() => {
        result.current(null);
      });
      jest.mocked(mockInstance.setOption).mockReset();
      expect(mockInstance.setOption).not.toHaveBeenCalled();

      const newNode = document.createElement('div');
      act(() => {
        result.current(newNode);
      });
      expect(init).toHaveBeenCalledWith(newNode, undefined, expect.any(Object));
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));
    });

    it('should not handle ECharts resize event by default', () => {
      const { result } = renderHook(() => useECharts(), {
        hydrate: true
      });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(useResizeObserver).toHaveBeenCalledWith({
        ref: node,
        onResize: noop
      });

      jest.mocked(useResizeObserver).mock.calls[0][0]?.onResize!({
        width: 345,
        height: 456
      });

      expect(mockInstance.resize).not.toHaveBeenCalled();
      expect(noop).toHaveBeenCalled();
    });

    it('should handle ECharts resize event if enabled', () => {
      const { result } = renderHook(() => useECharts({}, { resize: true }), {
        hydrate: true
      });

      expect(init).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(useResizeObserver).toHaveBeenCalledWith({
        ref: node,
        onResize: expect.any(Function)
      });

      jest.mocked(useResizeObserver).mock.calls[0][0]?.onResize!({
        width: 345,
        height: 456
      });

      expect(mockInstance.resize).toHaveBeenCalledWith({
        width: 345,
        height: 456
      });
    });

    it('should handle ECharts instance group when provided', () => {
      const { result, unmount } = renderHook(() => useECharts({ group: 'group' }), {
        hydrate: true
      });

      act(() => {
        result.current(node);
      });

      const instance = result.current[CHART_INSTANCE];
      expect(joinGroup).toHaveBeenCalledWith(instance, 'group');

      unmount();

      expect(leaveGroup).toHaveBeenCalledWith(instance, 'group');
    });

    it('should handle ECharts instance loading state when provided', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options), {
        initialProps: { options: { title: { text: 'Test' }, loading: true } },
        hydrate: true
      });

      expect(mockInstance.showLoading).not.toHaveBeenCalled();

      act(() => {
        result.current(node);
      });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));
      expect(setLoadingStatus).toHaveBeenCalledWith(result.current[CHART_INSTANCE], true);

      rerender({ options: { title: { text: 'Updated' }, loading: false } });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Updated' } }, expect.any(Object));
      expect(setLoadingStatus).toHaveBeenCalledWith(result.current[CHART_INSTANCE], false);
    });

    it('should use deep comparing when enabled', () => {
      const { result, rerender } = renderHook(({ options }) => useECharts(options, { deepCompare: true }), {
        initialProps: { options: { title: { text: 'Test' } } },
        hydrate: true
      });

      expect(useOnValueChanged).toHaveBeenCalledWith({ title: { text: 'Test' } }, true);

      act(() => {
        result.current(node);
      });

      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Test' } }, expect.any(Object));

      jest.mocked(mockInstance.setOption).mockReset();
      rerender({ options: { title: { text: 'Update' } } });
      expect(mockInstance.setOption).toHaveBeenCalledWith({ title: { text: 'Update' } }, expect.any(Object));

      jest.mocked(mockInstance.setOption).mockReset();
      rerender({ options: { title: { text: 'Update' } } });
      expect(mockInstance.setOption).not.toHaveBeenCalledWith({ title: { text: 'Update' } }, expect.any(Object));
    });

    describe('Imperative Mode', () => {
      let spyWarn: jest.Mocked<any>;

      beforeEach(() => {
        spyWarn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

        initOptions.imperativeMode = true;
      });

      it('should enable imperative mode if provided', () => {
        const { result } = renderHook(() => useECharts(opt, initOptions), {
          hydrate: true
        });

        act(() => {
          result.current(node);
        });

        expect(spyWarn).toHaveBeenCalledWith(`Declaring chart options will be ignored in imperative mode.`);

        expect(init).toHaveBeenCalled();
        expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], true);

        expect(typeof result.current).toBe('function');
        // @ts-ignore
        expect(result.current.current).toBe(node);
        expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
      });

      it('should not update option in imperative mode', () => {
        const { result, rerender } = renderHook(({ options }) => useECharts(options, initOptions), {
          initialProps: { options: { title: { text: 'Test' } } },
          hydrate: true
        });

        act(() => {
          result.current(node);
        });

        expect(spyWarn).toHaveBeenCalledWith(`Declaring chart options will be ignored in imperative mode.`);

        expect(mockInstance.setOption).not.toHaveBeenCalled();

        rerender({ options: { title: { text: 'Updated' } } });

        expect(mockInstance.setOption).not.toHaveBeenCalled();
      });
    });

    describe('ECharts SSR Mode', () => {
      beforeEach(() => {
        initOptions.ssr = true;
      });

      it('should initialize ECharts instance with no dom', () => {
        const { result } = renderHook(() => useECharts(opt, initOptions), {
          hydrate: true
        });

        expect(init).toHaveBeenCalled();
        expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], undefined);

        expect(typeof result.current).toBe('function');
        // @ts-ignore
        expect(result.current.current).toBe(null);
        expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
      });

      it('should not initialize ECharts instance if dom provided', () => {
        const { result } = renderHook(() => useECharts(opt, initOptions), {
          hydrate: true
        });

        act(() => {
          result.current(node);
        });

        expect(init).toHaveBeenCalled();
        expect(createProxyEChartsInstance).toHaveBeenCalledWith(result.current[CHART_INSTANCE], undefined);

        expect(typeof result.current).toBe('function');
        // @ts-ignore
        expect(result.current.current).toBe(null);
        expect(result.current.chart).toBe(jest.mocked(createProxyEChartsInstance).mock.results[1].value);
      });
    });
  });
});
