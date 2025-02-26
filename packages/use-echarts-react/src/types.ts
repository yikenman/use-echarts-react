import type { ECElementEvent, EChartsInitOpts, EChartsType, init } from 'echarts';
import type { RefCallback } from 'react';
import type { FORBIT_PROP_LIST, NOT_ALLOW_METHOD_LIST } from './contants';

export type { EChartsInitOpts, EChartsType } from 'echarts';

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};
export type Merge<T, U> = T extends U ? U : Simplify<T & U>;
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

export type ThemeOptions = Parameters<typeof init>[1];
export type ECBasicOption = Parameters<EChartsType['setOption']>[0];
export type SetOptionOpts = NonNullable<Parameters<EChartsType['setOption']>[1]>;

export type InitOptionsType = EChartsInitOpts & {
  theme?: ThemeOptions;
  resize?: boolean;
  imperativeMode?: boolean;
  deepCompare?: boolean;
};

export type GroupOptions = { group?: string };

export type ExtraOptOption = GroupOptions & { loading?: boolean | { type?: 'default'; cfg?: Record<string, any> } };

export type BaseEChartsRef<E, I> = RefCallback<E> & {
  chart: I | null;
};

export type DeclarativeModeOptType<Opt extends ECBasicOption = ECBasicOption> = Merge<Opt, ExtraOptOption>;
export type DeclarativeModeInitOptionsType = Merge<
  SetOptionOpts,
  Merge<InitOptionsType, { imperativeMode?: false; deepCompare?: boolean }>
>;
export type DeclarativeEChartsType = Omit<
  EChartsType,
  ArrayElement<typeof FORBIT_PROP_LIST | typeof NOT_ALLOW_METHOD_LIST>
>;
export type DeclarativeEChartsRef<E extends HTMLElement> = BaseEChartsRef<E, DeclarativeEChartsType>;

// type compatible with declarative opt.
export type ImperativeModeOptType = GroupOptions & { [x: string | symbol]: any };
export type ImperativeModeInitOptionsType = Merge<InitOptionsType, { imperativeMode: true; deepCompare?: false }>;
export type ImperativeEChartsType = Omit<EChartsType, ArrayElement<typeof FORBIT_PROP_LIST>>;
export type ImperativeEChartsRef<E extends HTMLElement> = BaseEChartsRef<E, ImperativeEChartsType>;

export type EChartsRef<E extends HTMLElement> = DeclarativeEChartsRef<E> | ImperativeEChartsRef<E>;

// echarts event
export type EchartsOnMethodParameters = Parameters<EChartsType['on']>;
export type EventType = EchartsOnMethodParameters[0];
export type QueryType = EchartsOnMethodParameters[1];
export type HandlerType = (eventParams: ECElementEvent) => void;
