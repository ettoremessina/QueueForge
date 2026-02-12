/**
 * Chart Rendering Utilities
 *
 * This module provides utilities for rendering real-time queue length charts
 * using HTML Canvas. The chart updates dynamically as the simulation runs.
 */

export interface DataPoint {
  time: number;
  queueLength: number;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  colors: {
    background: string;
    grid: string;
    axis: string;
    line: string;
    text: string;
    textSecondary: string;
  };
}

/**
 * Default chart configuration following UX design system
 */
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  width: 800,
  height: 400,
  padding: { top: 20, right: 20, bottom: 40, left: 50 },
  colors: {
    background: '#ffffff',
    grid: '#e9ecef',
    axis: '#dee2e6',
    line: '#0066cc',
    text: '#1a1a1a',
    textSecondary: '#6c757d',
  },
};

/**
 * Canvas-based chart renderer for queue length visualization
 *
 * This renderer creates a time-series chart showing queue length evolution.
 * Features include:
 * - Automatic scaling based on data range
 * - Grid lines for readability
 * - Axis labels with units
 * - Responsive sizing
 */
export class ChartRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ChartConfig;

  constructor(canvas: HTMLCanvasElement, config: Partial<ChartConfig> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.ctx = ctx;
    this.config = { ...DEFAULT_CHART_CONFIG, ...config };
  }

  /**
   * Render chart with given data
   */
  render(data: DataPoint[], xAxisLabel: string, yAxisLabel: string): void {
    if (data.length === 0) return;

    this.setupCanvas();
    this.clear();

    const chartArea = this.getChartArea();
    const scales = this.calculateScales(data, chartArea);

    this.drawGrid(chartArea, scales);
    this.drawAxes(chartArea);
    this.drawDataLine(data, chartArea, scales);
    this.drawLabels(chartArea, scales, xAxisLabel, yAxisLabel);
  }

  /**
   * Setup canvas for high-DPI displays
   */
  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    // Update config with actual display size
    this.config.width = rect.width;
    this.config.height = rect.height;
  }

  /**
   * Clear canvas
   */
  private clear(): void {
    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * Get chart drawing area (excluding padding)
   */
  private getChartArea() {
    const { width, height, padding } = this.config;
    return {
      x: padding.left,
      y: padding.top,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom,
    };
  }

  /**
   * Calculate scale functions for mapping data to pixels
   */
  private calculateScales(data: DataPoint[], chartArea: any) {
    const maxTime = Math.max(...data.map((d) => d.time), 60);
    const maxQueue = Math.max(...data.map((d) => d.queueLength), 10);

    return {
      x: (time: number) => chartArea.x + (time / maxTime) * chartArea.width,
      y: (queue: number) =>
        chartArea.y + chartArea.height - (queue / maxQueue) * chartArea.height,
      maxTime,
      maxQueue,
    };
  }

  /**
   * Draw background grid lines
   */
  private drawGrid(chartArea: any, scales: any): void {
    this.ctx.strokeStyle = this.config.colors.grid;
    this.ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = chartArea.y + (i * chartArea.height) / 5;
      this.ctx.beginPath();
      this.ctx.moveTo(chartArea.x, y);
      this.ctx.lineTo(chartArea.x + chartArea.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw chart axes
   */
  private drawAxes(chartArea: any): void {
    this.ctx.strokeStyle = this.config.colors.axis;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    // Y-axis
    this.ctx.moveTo(chartArea.x, chartArea.y);
    this.ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
    // X-axis
    this.ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
    this.ctx.stroke();
  }

  /**
   * Draw data line
   */
  private drawDataLine(data: DataPoint[], chartArea: any, scales: any): void {
    if (data.length < 2) return;

    this.ctx.strokeStyle = this.config.colors.line;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    this.ctx.moveTo(scales.x(data[0].time), scales.y(data[0].queueLength));

    for (let i = 1; i < data.length; i++) {
      this.ctx.lineTo(scales.x(data[i].time), scales.y(data[i].queueLength));
    }

    this.ctx.stroke();
  }

  /**
   * Draw axis labels and tick marks
   */
  private drawLabels(
    chartArea: any,
    scales: any,
    xAxisLabel: string,
    yAxisLabel: string
  ): void {
    this.ctx.fillStyle = this.config.colors.textSecondary;
    this.ctx.font =
      '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    // Y-axis tick labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((scales.maxQueue * (5 - i)) / 5);
      const y = chartArea.y + (i * chartArea.height) / 5;
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(value.toString(), chartArea.x - 10, y);
    }

    // X-axis tick labels
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((scales.maxTime * i) / 5);
      const x = chartArea.x + (i * chartArea.width) / 5;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(value.toString(), x, chartArea.y + chartArea.height + 5);
    }

    // Axis titles
    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.font =
      '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    // Y-axis label (rotated)
    this.ctx.save();
    this.ctx.translate(15, this.config.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.textAlign = 'center';
    this.ctx.fillText(yAxisLabel, 0, 0);
    this.ctx.restore();

    // X-axis label
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      xAxisLabel,
      this.config.width / 2,
      this.config.height - 10
    );
  }
}
