import { connect, disconnect } from 'echarts';
import {
  FORBIT_METHOD_SET,
  FORBIT_PROP_SET,
  INIT_OPTIONS_PROP_SET,
  NOT_ALLOW_METHOD_SET,
  OPT_PROP_SET,
  READONLY_PROP_SET
} from './contants';
import type {
  ECBasicOption,
  EChartsInitOpts,
  EChartsType,
  ExtraOptOption,
  Merge,
  SetOptionOpts,
  ThemeOptions
} from './types';

export const noop = () => {};

export const dispose = (echarts?: EChartsType | null) => {
  if (!echarts || !echarts.dispose || echarts.isDisposed()) {
    return;
  }

  echarts.dispose();
};

export const splitInitOpts = (
  initOpts?: SetOptionOpts &
    EChartsInitOpts & {
      theme?: ThemeOptions;
      imperativeMode?: boolean;
      resize?: boolean;
      deepCompare?: boolean;
    }
) => {
  const {
    theme,
    notMerge,
    lazyUpdate,
    silent,
    replaceMerge,
    transition,
    imperativeMode,
    deepCompare,
    resize,
    ...echartsInitOpts
  } = initOpts ?? {};

  return {
    theme,
    echartsInitOpts: echartsInitOpts as EChartsInitOpts,
    setOptions: { notMerge, lazyUpdate, silent, replaceMerge, transition } as SetOptionOpts,
    imperativeMode,
    deepCompare: imperativeMode === true ? false : deepCompare,
    resize
  };
};

// manage echarts group
export const groupMap = new Map<string, number>();

export const joinGroup = (instance?: EChartsType | null, name?: string) => {
  if (!instance || !name) {
    return;
  }
  instance.group = name;
  groupMap.set(name, (groupMap.get(name) || 0) + 1);
  connect(name);
  return;
};

export const leaveGroup = (instance?: EChartsType | null, name?: string) => {
  if (!instance || !name || !groupMap.has(name)) {
    return;
  }
  const result = groupMap.get(name)! - 1;
  groupMap.set(name, result);
  if (result <= 0) {
    groupMap.delete(name);
    disconnect(name);
  }
  // @ts-ignore
  instance.group = undefined;
  return;
};

// create proxy instance.
export const createProxyEChartsInstance = (instance?: EChartsType | null, imperativeMode?: boolean): EChartsType => {
  if (!instance) {
    return null as any;
  }
  return new Proxy(instance, {
    get(target, p) {
      if (FORBIT_PROP_SET.has(p)) {
        console.warn(`Prop '${String(p)}' is now managed by useECharts. This method will be no longer applicable.`);
        return undefined;
      }
      if (FORBIT_METHOD_SET.has(p) || (!imperativeMode && NOT_ALLOW_METHOD_SET.has(p))) {
        console.warn(`Method '${String(p)}' is now managed by useECharts. This method will be no longer applicable.`);
        return noop;
      }
      return target[p as keyof typeof target];
    },
    set(target, p, value) {
      if (READONLY_PROP_SET.has(p)) {
        console.warn(`Prop '${String(p)}' is protected and cannot be modified.`);
        // not throw error.
        return true;
      }
      target[p as keyof typeof target] = value;
      return true;
    }
  });
};

export const isOptType = (val: any): val is Merge<ECBasicOption, ExtraOptOption> => {
  for (const key in val) {
    if (Object.hasOwnProperty.call(val, key) && key !== 'constructor') {
      // If first prop is opt prop then it is opt.
      // If first prop is initOptions prop then it is initOptions.
      if (OPT_PROP_SET.has(key)) {
        return true;
      }
      if (INIT_OPTIONS_PROP_SET.has(key)) {
        return false;
      }
    }
  }
  return false;
};

export const setLoadingStatus = (instance?: EChartsType, loading?: ExtraOptOption['loading']) => {
  if (!instance) {
    return;
  }
  if (loading) {
    const params = [(loading as any)?.type, (loading as any)?.cfg].filter(Boolean) as Parameters<
      EChartsType['showLoading']
    >;
    instance.showLoading(...params);
  } else {
    instance.hideLoading();
  }
};
