export const FORBIT_PROP_LIST = ['group'] as const;
export const FORBIT_METHOD_LIST = ['on', 'off', 'dispose', 'clear'] as const;
export const NOT_ALLOW_METHOD_LIST = ['setOption', 'appendData', 'showLoading', 'hideLoading'] as const;
export const READONLY_PROP_LIST = ['group', 'id'] as const;

export const FORBIT_PROP_SET = new Set<symbol | string>(FORBIT_PROP_LIST);
export const FORBIT_METHOD_SET = new Set<symbol | string>(FORBIT_METHOD_LIST);
export const NOT_ALLOW_METHOD_SET = new Set<symbol | string>(NOT_ALLOW_METHOD_LIST);
export const READONLY_PROP_SET = new Set<symbol | string>(READONLY_PROP_LIST);

export const OPT_PROP_SET = new Set([
  // extra opt options
  'group',
  'loading',

  // opt options
  'angleAxis',
  'animation',
  'animationDelay',
  'animationDelayUpdate',
  'animationDuration',
  'animationDurationUpdate',
  'animationEasing',
  'animationEasingUpdate',
  'animationThreshold',
  'aria',
  'axisPointer',
  'backgroundColor',
  'blendMode',
  'brush',
  'calendar',
  'color',
  'darkMode',
  'dataset',
  'dataZoom',
  'geo',
  'graphic',
  'grid',
  'hoverLayerThreshold',
  'legend',
  'media',
  'options',
  'parallel',
  'parallelAxis',
  'polar',
  'progressive',
  'progressiveThreshold',
  'radar',
  'radiusAxis',
  'series',
  'singleAxis',
  'stateAnimation',
  'textStyle',
  'timeline',
  'title',
  'toolbox',
  'tooltip',
  'useUTC',
  'visualMap',
  'xAxis',
  'yAxis'
]);

export const INIT_OPTIONS_PROP_SET = new Set([
  // extra init options
  'theme',
  'resize',
  'imperativeMode',
  'deepCompare',

  // init options
  'locale',
  'renderer',
  'devicePixelRatio',
  'useDirtyRect',
  'useCoarsePointer',
  'pointerSize',
  'ssr',
  'width',
  'height',

  // set options
  'notMerge',
  'lazyUpdate',
  'silent',
  'replaceMerge',
  'transition'
]);

export const CHART_INSTANCE = Symbol('CHART_INSTANCE');
