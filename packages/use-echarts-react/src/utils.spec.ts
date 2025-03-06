import { type EChartsType, connect, disconnect } from 'echarts';
import {
  FORBIT_METHOD_LIST,
  FORBIT_PROP_LIST,
  INIT_OPTIONS_PROP_SET,
  NOT_ALLOW_METHOD_LIST,
  OPT_PROP_SET,
  READONLY_PROP_LIST
} from './contants';
import {
  createProxyEChartsInstance,
  dispose,
  groupMap,
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
    connect: jest.fn(),
    disconnect: jest.fn()
  };
});

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('utils', () => {
  describe('noop function', () => {
    it('should not return anything', () => {
      expect(noop()).toBeUndefined();
    });
    it('should not throw any error when called', () => {
      expect(() => noop()).not.toThrow();
    });
  });

  describe('dispose function', () => {
    it('should call dispose when the echarts instance is valid and not disposed', () => {
      const mockDispose = jest.fn();
      const mockIsDisposed = jest.fn().mockReturnValue(false);

      const echartsMock = {
        dispose: mockDispose,
        isDisposed: mockIsDisposed
      } as unknown as EChartsType;

      dispose(echartsMock);

      expect(mockDispose).toHaveBeenCalled();
      expect(mockIsDisposed).toHaveBeenCalled();
    });

    it('should not call dispose when echarts is null or undefined', () => {
      const mockDispose = jest.fn();

      dispose(null);
      expect(mockDispose).not.toHaveBeenCalled();

      dispose(undefined);
      expect(mockDispose).not.toHaveBeenCalled();
    });

    it('should not call dispose when echarts is already disposed', () => {
      const mockDispose = jest.fn();
      const mockIsDisposed = jest.fn().mockReturnValue(true); // 模拟 isDisposed 返回 true

      const echartsMock = {
        dispose: mockDispose,
        isDisposed: mockIsDisposed
      } as unknown as EChartsType;

      dispose(echartsMock);

      expect(mockDispose).not.toHaveBeenCalled();
    });
  });

  describe('splitInitOpts function', () => {
    it('should return default values when no options are provided', () => {
      const result = splitInitOpts();

      expect(result).toEqual({
        theme: undefined,
        echartsInitOpts: {},
        setOptions: {
          notMerge: undefined,
          lazyUpdate: undefined,
          silent: undefined,
          replaceMerge: undefined,
          transition: undefined
        },
        imperativeMode: undefined,
        deepCompare: undefined,
        resize: undefined
      });
    });

    it('should correctly split provided options', () => {
      const initOptions = {
        theme: 'dark',
        notMerge: true,
        lazyUpdate: false,
        silent: true,
        replaceMerge: false,
        transition: 'scale',
        imperativeMode: true,
        deepCompare: true,
        resize: false,
        otherEchartsInitOpt: 'true'
      };

      const result = splitInitOpts(initOptions as any);

      expect(result).toEqual({
        theme: 'dark',
        echartsInitOpts: {
          otherEchartsInitOpt: 'true'
        },
        setOptions: {
          notMerge: true,
          lazyUpdate: false,
          silent: true,
          replaceMerge: false,
          transition: 'scale'
        },
        imperativeMode: true,
        deepCompare: false,
        resize: false
      });
    });

    it('should handle missing options correctly', () => {
      const initOptions = {
        theme: 'light',
        notMerge: true,
        resize: true
      };

      const result = splitInitOpts(initOptions);

      expect(result).toEqual({
        theme: 'light',
        echartsInitOpts: {},
        setOptions: {
          notMerge: true,
          lazyUpdate: undefined,
          silent: undefined,
          replaceMerge: undefined,
          transition: undefined
        },
        imperativeMode: undefined,
        deepCompare: undefined,
        resize: true
      });
    });

    it('should not modify deepCompare if imperativeMode is false', () => {
      const initOptions = {
        theme: 'dark',
        notMerge: true,
        imperativeMode: false,
        deepCompare: true
      };

      const result = splitInitOpts(initOptions);

      expect(result).toEqual({
        theme: 'dark',
        echartsInitOpts: {},
        setOptions: {
          notMerge: true,
          lazyUpdate: undefined,
          silent: undefined,
          replaceMerge: undefined,
          transition: undefined
        },
        imperativeMode: false,
        deepCompare: true,
        resize: undefined
      });
    });

    it('should set deepCompare to false if imperativeMode is true', () => {
      const initOptions = {
        theme: 'light',
        notMerge: false,
        imperativeMode: true,
        deepCompare: true
      };

      const result = splitInitOpts(initOptions);

      expect(result).toEqual({
        theme: 'light',
        echartsInitOpts: {},
        setOptions: {
          notMerge: false,
          lazyUpdate: undefined,
          silent: undefined,
          replaceMerge: undefined,
          transition: undefined
        },
        imperativeMode: true,
        deepCompare: false,
        resize: undefined
      });
    });
  });

  describe('ECharts Group Management', () => {
    let mockInstance: EChartsType;

    beforeEach(() => {
      jest.mocked(connect).mockImplementation(jest.fn());
      jest.mocked(disconnect).mockImplementation(jest.fn());

      mockInstance = { group: undefined } as unknown as EChartsType;
      groupMap.clear();
    });

    describe('joinGroup', () => {
      it('should assign a group to the instance and update groupMap', () => {
        joinGroup(mockInstance, 'group1');

        expect(mockInstance.group).toBe('group1');
        expect(groupMap.get('group1')).toBe(1);
      });

      it('should not do anything if instance or name is not provided', () => {
        joinGroup(undefined, 'group1');
        joinGroup(mockInstance, undefined);

        expect(mockInstance.group).toBeUndefined();
        expect(groupMap.size).toBe(0);
      });

      it('should call connect when a group is joined', () => {
        joinGroup(mockInstance, 'group1');

        expect(connect).toHaveBeenCalledWith('group1');
      });

      it('should increment groupMap count for existing groups', () => {
        joinGroup(mockInstance, 'group1');
        const mockInstance2 = { group: undefined } as unknown as EChartsType;

        joinGroup(mockInstance2, 'group1');

        expect(groupMap.get('group1')).toBe(2);
      });
    });

    describe('leaveGroup', () => {
      it('should remove the group from the instance and update groupMap', () => {
        joinGroup(mockInstance, 'group1');
        leaveGroup(mockInstance, 'group1');

        expect(mockInstance.group).toBeUndefined();
        expect(groupMap.get('group1')).toBeUndefined();
      });

      it('should delete the group from groupMap if count reaches 0', () => {
        joinGroup(mockInstance, 'group1');
        const mockInstance2 = { group: undefined } as unknown as EChartsType;
        joinGroup(mockInstance2, 'group1');

        expect(groupMap.get('group1')).toBe(2);

        leaveGroup(mockInstance, 'group1');
        expect(groupMap.get('group1')).toBe(1);

        leaveGroup(mockInstance2, 'group1');
        expect(groupMap.has('group1')).toBe(false);
      });

      it('should not do anything if instance or name is not provided', () => {
        leaveGroup(undefined, 'group1');
        leaveGroup(mockInstance, undefined);

        expect(mockInstance.group).toBeUndefined();
        expect(groupMap.size).toBe(0);
      });

      it('should call disconnect when the group count reaches 0 and is removed', () => {
        joinGroup(mockInstance, 'group1');
        const mockInstance2 = { group: undefined } as unknown as EChartsType;
        joinGroup(mockInstance2, 'group1');

        leaveGroup(mockInstance, 'group1');
        expect(disconnect).not.toHaveBeenCalled();

        leaveGroup(mockInstance2, 'group1');
        expect(disconnect).toHaveBeenCalledWith('group1');
      });
    });
  });

  describe('createProxyEChartsInstance', () => {
    let mockEChartsInstance: EChartsType;

    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(jest.fn);

      mockEChartsInstance = {
        id: `${Math.random()}`,
        setOption: jest.fn(),
        getOption: jest.fn(function () {
          return this.id;
        }),
        resize: jest.fn(),
        isDisposed: jest.fn().mockReturnValue(false)
      } as unknown as EChartsType;
    });

    it('should return null if instance is not provided', () => {
      const proxy = createProxyEChartsInstance(null);
      expect(proxy).toBeNull();
    });

    it('should allow accessing allowed properties', () => {
      const proxy = createProxyEChartsInstance(mockEChartsInstance);
      expect(proxy.getOption()).toBe(mockEChartsInstance.id);
      expect(mockEChartsInstance.getOption).toHaveBeenCalled();
    });

    it('should not allow accessing forbidden properties', () => {
      const proxy = createProxyEChartsInstance(mockEChartsInstance);

      FORBIT_PROP_LIST.forEach((prop) => {
        proxy[prop];
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            `Prop '${String(prop)}' is now managed by useECharts. This method will be no longer applicable.`
          )
        );
      });
      FORBIT_METHOD_LIST.forEach((prop) => {
        // @ts-ignore
        proxy[prop]();
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            `Method '${String(prop)}' is now managed by useECharts. This method will be no longer applicable.`
          )
        );
      });
    });

    it('should not allow accessing not-allowed properties', () => {
      const proxy = createProxyEChartsInstance(mockEChartsInstance);

      NOT_ALLOW_METHOD_LIST.forEach((prop) => {
        // @ts-ignore
        proxy[prop]();
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            `Method '${String(prop)}' is now managed by useECharts. This method will be no longer applicable.`
          )
        );
      });
    });

    it('should not allow setting readonly properties', () => {
      const proxy = createProxyEChartsInstance(mockEChartsInstance);

      READONLY_PROP_LIST.forEach((prop) => {
        proxy[prop] = 'value';
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(`Prop '${String(prop)}' is protected and cannot be modified.`)
        );
        expect(proxy[prop]).not.toBe('value');
      });
    });

    it('should allow setting non-readonly properties', () => {
      const proxy = createProxyEChartsInstance(mockEChartsInstance);
      proxy['otherProp'] = 'value';
      expect(proxy['otherProp']).toBe('value');
    });

    it('should handle imperative mode correctly', () => {
      const proxy = createProxyEChartsInstance(mockEChartsInstance, true);

      proxy.setOption({ animation: true });
      expect(mockEChartsInstance.setOption).toHaveBeenCalledWith({ animation: true });

      proxy.dispose();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          `Method 'dispose' is now managed by useECharts. This method will be no longer applicable.`
        )
      );
    });
  });

  describe('isOptType', () => {
    it('should return true when first prop is in OPT_PROP_SET', () => {
      const testObj = { [OPT_PROP_SET.values().next().value]: 'someValue' };

      expect(isOptType(testObj)).toBe(true);
    });

    it('should return false when first prop is in INIT_OPTIONS_PROP_SET', () => {
      const testObj = { [INIT_OPTIONS_PROP_SET.values().next().value]: 'someValue' };

      expect(isOptType(testObj)).toBe(false);
    });

    it('should return false when object is empty', () => {
      const testObj = {};

      expect(isOptType(testObj)).toBe(false);
    });

    it('should return false when object contains neither OPT_PROP_SET nor INIT_OPTIONS_PROP_SET properties', () => {
      const testObj = { randomProp: 'value' };

      expect(isOptType(testObj)).toBe(false);
    });
  });

  describe('setLoadingStatus', () => {
    let mockEChartsInstance: EChartsType;

    beforeEach(() => {
      mockEChartsInstance = {
        showLoading: jest.fn(),
        hideLoading: jest.fn()
      } as unknown as EChartsType;
    });

    it('should call showLoading with correct params when loading is provided', () => {
      const loading = { type: 'default', cfg: { text: 'Loading...' } } as const;

      setLoadingStatus(mockEChartsInstance, loading);

      expect(mockEChartsInstance.showLoading).toHaveBeenCalledWith('default', { text: 'Loading...' });
    });

    it('should call hideLoading when loading is not provided', () => {
      setLoadingStatus(mockEChartsInstance);

      expect(mockEChartsInstance.hideLoading).toHaveBeenCalled();
    });

    it('should not call any method if instance is not provided', () => {
      setLoadingStatus(undefined, {});

      expect(mockEChartsInstance.showLoading).not.toHaveBeenCalled();
      expect(mockEChartsInstance.hideLoading).not.toHaveBeenCalled();
    });

    it('should call showLoading with only valid params (filter out falsy values)', () => {
      const loading = { type: 'default', cfg: null } as const;

      // @ts-ignore
      setLoadingStatus(mockEChartsInstance as unknown as EChartsType, loading);

      expect(mockEChartsInstance.showLoading).toHaveBeenCalledWith('default');
    });

    it('should call showLoading without parameters when loading type and cfg are falsy', () => {
      const loading = { type: null, cfg: null };

      // @ts-ignore
      setLoadingStatus(mockEChartsInstance as unknown as EChartsType, loading);

      expect(mockEChartsInstance.showLoading).toHaveBeenCalled();
    });
  });
});
