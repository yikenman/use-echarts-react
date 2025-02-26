import { useECharts, useEChartsEvent } from './index';

describe('index', () => {
  it('should export useECharts', () => {
    expect(useECharts).toBeDefined();
    expect(typeof useECharts).toBe('function');
  });

  it('should export useEChartsEvent', () => {
    expect(useEChartsEvent).toBeDefined();
    expect(typeof useEChartsEvent).toBe('function');
  });
});
