import { init } from 'echarts';
import { type RefCallback, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useResizeObserver, { type ResizeHandler } from 'use-resize-observer';
import { CHART_INSTANCE } from './contants';
import type {
  DeclarativeEChartsRef,
  DeclarativeModeInitOptionsType,
  DeclarativeModeOptType,
  ECBasicOption,
  EChartsType,
  ExtraOptOption,
  ImperativeEChartsRef,
  ImperativeModeInitOptionsType,
  ImperativeModeOptType,
  InitOptionsType,
  Merge,
  SetOptionOpts
} from './types';
import { useOnValueChanged } from './use-on-value-changed';
import {
  createProxyEChartsInstance,
  dispose,
  isOptType,
  joinGroup,
  leaveGroup,
  noop,
  setLoadingStatus,
  splitInitOpts
} from './utils';

/**
 * Configures the ECharts instance with the provided options.
 *
 * @param option - The configuration options for ECharts:
 * - Accepts all options for ECharts `setOption` method, see [configuration item manual](https://echarts.apache.org/en/option.html#title)
 * - `group`:  Sets the ECharts instance's `group` and automatically connects chart group, see [echartInstance.group](https://echarts.apache.org/zh/api.html#echartsInstance.group)
 * - `loading`: Controls the `loading` state of the ECharts instance, see [echartInstance.showLoading](https://echarts.apache.org/zh/api.html#echartsInstance.showLoading)
 *
 * @param initOpts - Initialization opts for the ECharts instance, can only be set once, including:
 * - `theme`: Same as [echarts.init——theme](https://echarts.apache.org/en/api.html#echarts.init).
 * - `locale`: Same as [echarts.init——locale](https://echarts.apache.org/en/api.html#echarts.init).
 * - `renderer`: Same as [echarts.init——renderer](https://echarts.apache.org/en/api.html#echarts.init).
 * - `devicePixelRatio`: Same as [echarts.init——devicePixelRatio](https://echarts.apache.org/en/api.html#echarts.init).
 * - `useDirtyRect`: Same as [echarts.init——useDirtyRect](https://echarts.apache.org/en/api.html#echarts.inithttps://echarts.apache.org/en/api.html#echarts.init).
 * - `useCoarsePointer`: Same as [echarts.init——useCoarsePointer](https://echarts.apache.org/en/api.html#echarts.init).
 * - `pointerSize`: Same as [echarts.init——pointerSize](https://echarts.apache.org/en/api.html#echarts.init).
 * - `ssr`: Same as [echarts.init——ssr](https://echarts.apache.org/en/api.html#echarts.init).
 * - `width`: Same as [echarts.init——width](https://echarts.apache.org/en/api.html#echarts.init).
 * - `height`: Same as [echarts.init——height](https://echarts.apache.org/en/api.html#echarts.init).
 * - `resize`: Automatically resizes the chart when the bound element's size change. Defaults to false.
 * - `imperativeMode`: Enables direct control of the ECharts instance. When enabled, the `option` parameter is ignored.
 * - `deepCompare`: Enables deep comparison for option before updating the instance. Defaults to false.
 *
 * @returns A **React ref** object used to bind the DOM element. This ref contains two properties:
 * - **`current`**: The current DOM element that the ref is bound to.
 * - **`chart`**: The current created ECharts instance with `restricted` APIs. If `imperativeMode` is enabled, this will return the complete ECharts instance, allowing direct interaction with all methods of ECharts.
 *
 */
export function useECharts<E extends HTMLElement, Opt extends ECBasicOption = ECBasicOption>(
  option?: DeclarativeModeOptType<Opt>,
  initOpts?: DeclarativeModeInitOptionsType
): DeclarativeEChartsRef<E>;
export function useECharts<E extends HTMLElement>(
  option: ImperativeModeOptType,
  initOpts: ImperativeModeInitOptionsType
): ImperativeEChartsRef<E>;
export function useECharts<E extends HTMLElement>(initOpts: ImperativeModeInitOptionsType): ImperativeEChartsRef<E>;
export function useECharts<E extends HTMLElement, Opt extends ECBasicOption = ECBasicOption>(p0?: any, p1?: any) {
  const option: Merge<Opt, ExtraOptOption> | undefined = p1 ? p0 : isOptType(p0) ? p0 : undefined;
  const initOpts: Merge<SetOptionOpts, InitOptionsType> | undefined = option ? p1 : p0;

  const [node, setNode] = useState<E | null>(null);
  const [isInstanceChanged, setIsInstanceChanged] = useState<number | undefined>();
  const [_firstMeaningfulUpdated, setFirstMeaningfulUpdated] = useState(false);
  const instanceRef = useRef<EChartsType | null>(null);

  const { theme, echartsInitOpts, setOptions, imperativeMode, deepCompare, resize } = useMemo(() => {
    return splitInitOpts(initOpts);
  }, []);

  // init echarts instance.
  useEffect(() => {
    if (node || echartsInitOpts.ssr) {
      const { width, height } = node?.getBoundingClientRect() ?? {};
      instanceRef.current = init(node ?? null, theme, { width, height, ...echartsInitOpts });
      setIsInstanceChanged(Math.random());
      return () => {
        dispose(instanceRef.current);
        instanceRef.current = null;
        setIsInstanceChanged(undefined);
      };
    }
  }, [node, theme, echartsInitOpts]);

  const onResize = useCallback<ResizeHandler>((size) => {
    if (instanceRef.current) {
      instanceRef.current.resize({ height: size.height, width: size.width });
    }
  }, []);
  useResizeObserver({ ref: node, onResize: resize ? onResize : noop });

  // conditional setOptions.
  const isOptChanged = useOnValueChanged(option, deepCompare);
  useEffect(() => {
    if (imperativeMode) {
      console.warn(`Declaring chart options will be ignored in imperative mode.`);
      return;
    }
    if (isInstanceChanged && instanceRef.current && option) {
      const { group, loading, ...restOpt } = option;
      setLoadingStatus(instanceRef.current, loading);
      instanceRef.current.setOption(restOpt, setOptions);
      // Ensure echartsInstance methods can return meaningful values after first update.
      setFirstMeaningfulUpdated(true);
    }
  }, [
    // initial change
    isInstanceChanged,
    imperativeMode
      ? // only trigger when node changed.
        undefined
      : deepCompare
        ? // will trigger after deeply compared.
          isOptChanged
        : // always trigger.
          option,
    imperativeMode,
    setOptions
  ]);

  // handle echarts group.
  useEffect(() => {
    if (node && option?.group) {
      const instance = instanceRef.current;
      joinGroup(instance, option.group);
      return () => {
        leaveGroup(instance, option.group);
      };
    }
  }, [node, option?.group]);

  const refCb = useCallback<RefCallback<E>>(
    (node) => {
      if (!echartsInitOpts.ssr) {
        if (node) {
          setNode(node);
        } else {
          setNode(null);
        }
      }
    },
    [echartsInitOpts.ssr]
  ) as Record<string, any>;
  refCb.current = node;
  // @ts-ignore
  refCb[CHART_INSTANCE] = instanceRef.current;
  // create proxy instance and remove some methods.
  refCb.chart = useMemo(() => {
    return createProxyEChartsInstance(instanceRef.current, imperativeMode);
  }, [isInstanceChanged, imperativeMode]);

  return refCb;
}
