import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private readonly colors: Record<string, string> = {
    grid: '#495865',
    chart: '#4aaed9',
    selection: '#a6c8e6',
    'ac-chart': '#ff4444',
    'fftp-chart': '#ff44ff',
    'fftp-threshold': '#aa00aa',
    RMS: '#996f83',
    ZCR: '#6f998a',
    FFTM: '#96996f',
    FFTP: '#7e6f99',
    AC: '#996f83',
  };

  public default = '#aaaaaa';

  /**
   * Constructor.
   */
  constructor() {}

  /**
   * TODO: description
   */
  public get(key: string): string {
    return this.colors[key] || this.default;
  }
}
