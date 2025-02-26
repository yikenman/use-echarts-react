import { useEffect, useRef } from 'react';
import { CHART_INSTANCE } from './contants';
import type { EChartsRef, EChartsType, EventType, HandlerType, QueryType } from './types';

/**
 * Automatically handling event binding to ECharts instance.
 *
 * @param ref - The return value of `useECharts`.
 * @param event - Same as [echartsInstance.on——eventName](https://echarts.apache.org/en/api.html#echartsInstance.on).
 * @param query - Same as [echartsInstance.on——query](https://echarts.apache.org/en/api.html#echartsInstance.on).
 * @param handler - Same as [echartsInstance.on——handler](https://echarts.apache.org/en/api.html#echartsInstance.on).
 */
export function useEChartsEvent<E extends HTMLElement>(
  ref: EChartsRef<E>,
  event: EventType,
  handler: HandlerType
): void;
export function useEChartsEvent<E extends HTMLElement>(
  ref: EChartsRef<E>,
  event: EventType,
  query: QueryType,
  handler: HandlerType
): void;
export function useEChartsEvent<E extends HTMLElement>(ref: EChartsRef<E>, event: EventType, p2: any, p3?: any): void {
  const query: QueryType = p3 ? p2 : undefined;
  const handler: HandlerType = query ? p3 : p2;

  const instanceRef: EChartsType | null = ref?.[CHART_INSTANCE];

  const handlerRef = useRef<typeof handler>(null);
  handlerRef.current = handler;

  useEffect(() => {
    if (instanceRef) {
      const eventListener = (params: any) => {
        return handlerRef.current?.(params);
      };

      if (query) {
        instanceRef.on(event, query, eventListener);
      } else {
        instanceRef.on(event, eventListener);
      }

      return () => {
        // disposed instance dosen't need to call 'off' method.
        // ref: https://github.com/apache/echarts/blob/d54443d44d9a7a9b034bb064db83eec3592dd864/src/core/echarts.ts#L238
        if (instanceRef && !instanceRef.isDisposed()) {
          instanceRef.off(event, eventListener);
        }
      };
    }
  }, [instanceRef?.id, event, query]);

  return;
}
