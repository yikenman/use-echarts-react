# use-echarts-react

[![NPM Version](https://img.shields.io/npm/v/use-echarts-react)
](https://www.npmjs.com/package/use-echarts-react)
![NPM License](https://img.shields.io/npm/l/use-echarts-react)
[![codecov](https://codecov.io/gh/yikenman/use-echarts-react/graph/badge.svg?token=43EG2T8LKS)](https://codecov.io/gh/yikenman/use-echarts-react)

A modernized React hook for integrating ECharts.

---

## Features

- **Hook** based modern APIs.
- Supports **tree-shakeable** ECharts usages by default.
- Supports **declarative**/**imperative** mode for different scenarios.
- Supports **deep comparison**.
- Supports all **ECharts** APIs.
- Works with **SSR**.
- Written in **Typescript**.
- 100% test coverage.


## Install

```bash
$ npm install --save use-echarts-react echarts
```

## Basic Usage

```tsx
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useECharts, useEChartsEvent } from "use-echarts-react";

// Tree-shakeable ECharts usage, see https://echarts.apache.org/handbook/en/basics/import/#shrinking-bundle-size.
use([
  CanvasRenderer,
  GridComponent,
  LineChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent
]);

const App = () => {
  const ref = useECharts<HTMLDivElement>({
    // echarts instance option
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  }, {
    width: 100,
    height: 100
  });

  // binding event
  useEChartsEvent(ref, 'click', () => {
    console.log('triggered');
  });

  return (
    <div ref={ref}></div>
  );
};
```

## APIs

### useECharts(option, initOpts)

Configures the ECharts instance with the provided options.

#### `option` (Optional)

This parameter is used for configuring the ECharts instance with the options that would be passed to the `setOption` method. It can include the following:

|Property|Description|
|--|--|
| **... ECharts Options** | Accepts all options from `setOption` method. Refers [ECharts Configuration Items Manual](https://echarts.apache.org/en/option.html#title) for all available options. |
| **`group`** | Specifies the `group` of the ECharts instance and automatically connects the chart group. See [echartsInstance.group](https://echarts.apache.org/zh/api.html#echartsInstance.group). |
| **`loading`** | Controls the loading state of the ECharts instance. See [showLoading method](https://echarts.apache.org/zh/api.html#echartsInstance.showLoading). |


#### `initOpts` (Optional)

This is used to initialize the ECharts instance. It can only be set once during the initialization and includes the following options:

|Property|Description|
|--|--|
| **`theme`**| The theme for the ECharts instance, see [echarts.init - theme](https://echarts.apache.org/en/api.html#echarts.init). |
| **`locale`**| The locale for the ECharts instance, see [echarts.init - locale](https://echarts.apache.org/en/api.html#echarts.init). |
| **`renderer`**| The renderer for ECharts (canvas or SVG), see [echarts.init - renderer](https://echarts.apache.org/en/api.html#echarts.init). |
| **`devicePixelRatio`**| The pixel ratio for the instance, see [echarts.init - devicePixelRatio](https://echarts.apache.org/en/api.html#echarts.init). |
| **`useDirtyRect`**| Whether to use the dirty rectangle technique to optimize performance, see [echarts.init - useDirtyRect](https://echarts.apache.org/en/api.html#echarts.init). |
| **`useCoarsePointer`**| Whether to use a coarse pointer for event handling, see [echarts.init - useCoarsePointer](https://echarts.apache.org/en/api.html#echarts.init). |
| **`pointerSize`**| The size of the pointer for interactions, see [echarts.init - pointerSize](https://echarts.apache.org/en/api.html#echarts.init). |
| **`ssr`**| Enable server-side rendering for the instance, see [echarts.init - ssr](https://echarts.apache.org/en/api.html#echarts.init). |
| **`width`**| The width of the chart, see [echarts.init - width](https://echarts.apache.org/en/api.html#echarts.init). |
| **`height`**| The height of the chart, see [echarts.init - height](https://echarts.apache.org/en/api.html#echarts.init). |
| **`resize`**| Automatically resizes the chart when the bound element’s size changes. Defaults to `false`. |
| **`imperativeMode`**| Enables direct control of the ECharts instance. When enabled, the `option` parameter is ignored. Defaults to `false`. |
| **`deepCompare`**| Enables deep comparison for `option` before updating the instance. Defaults to `false`. |

#### Returns

The hook returns a **React ref** object used to bind the DOM element. This ref contains two properties:

- **`current`**: The current DOM element that the ref is bound to.
- **`chart`**: The current created ECharts instance with restricted APIs. If `imperativeMode` is enabled, this will return the complete ECharts instance, allowing direct interaction with all methods of ECharts.


### useEChartsEvent(ref, event, handler) / useEChartsEvent(ref, event, query, handler)

Automatically handling event binding to ECharts instance.

#### `ref` (Required)
The return value of the `useECharts` hook.

#### `event` (Required)
The event to listen for. This is the same as the `eventName` parameter in the [ECharts `echartsInstance.on` method](https://echarts.apache.org/en/api.html#echartsInstance.on).

#### `query` (Optional)
This is the query parameter for the event listener. It is the same as the `query` parameter in the [ECharts `echartsInstance.on` method](https://echarts.apache.org/en/api.html#echartsInstance.on).

#### `handler` (Required)
Same as the `handler` parameter in the [ECharts `echartsInstance.on` method](https://echarts.apache.org/en/api.html#echartsInstance.on).

## Declarative / Imperative Mode

By default, `useECharts` will return an ECharts instance with restricted APIs like `setOption`, `on`... and user should update ECharts instance by updating the hook parameters. Also user can get a complete ECharts instance via enabling `imperativeMode`.

### Declarative Mode

```tsx
import { useECharts } from "use-echarts-react";

const App = () => {
  const ref = useECharts<HTMLDivElement>({
    // can only use hook parameters to update ECharts instance.
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  }, {
    width: 100,
    height: 100
  });

  return (
    <div ref={ref}></div>
  );
};
```

### Imperative Mode

```tsx
import { useECharts } from "use-echarts-react";

const App = () => {
  const ref = useECharts<HTMLDivElement>({
    // option will be ignored under imperative mode.
  }, {
    imperativeMode: true,
    width: 100,
    height: 100
  });

  return (
    <div>
      <button
        onClick={() => {
          // `setOption` is available to call now.
          ref.chart?.setOption({
            xAxis: {
              type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line',
              }
            ]
          });
        }}
      >
        update
      </button>
      <div ref={ref}></div>
    </div>
  );
};
```


## About SSR

`useEcharts` supports using [`ECharts SSR`](https://echarts.apache.org/handbook/en/how-to/cross-platform/server/) option. But this is not as the same as `React SSR`. `ECharts SSR` is used for returning SVG string instead of manipulating a dom element.

```tsx
import { useECharts } from "use-echarts-react";

const App = () => {
  const ref = useECharts<HTMLDivElement>({
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  }, {
    renderer: 'svg',
    ssr: true,
    width: 100,
    height: 100
  });

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: ref.chart?.renderToSVGString() ?? ''
      }}
    ></div>
  );
};
```

## License

MIT License