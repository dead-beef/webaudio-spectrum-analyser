import { Injectable } from '@angular/core';

import { RgbColor } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  private readonly colors: Record<string, string> = {
    grid: '#495865',
    chart: '#4aaed9',
    selection: '#a6c8e6',
    RMS: '#996f83',
    'rms-threshold': '#ff4444',
    ZCR: '#6f998a',
    FFTM: '#96996f',
    FFTP: '#7e6f99',
    'fftp-chart': '#ff44ff',
    'fftp-threshold': '#aa00aa',
    fftpeaks: '#29ff00',
    AC: '#996f83',
    'ac-chart': '#ff4444',
    CM: '#8b996f',
    CP: '#906f99',
    MPD: '#76996f',
    'mpd-histogram': '#29ff00',
    'spectrogram-min': '#26262c',
    'spectrogram-max': '#4aaed9',
  };

  private readonly rgbColors: Record<string, RgbColor> = {};

  public defaultColor = '#aaaaaa';

  /**
   * Constructor.
   */
  constructor() {}

  /**
   * TODO: description
   */
  public get(key: string): string {
    return this.colors[key] || this.defaultColor;
  }

  /**
   * TODO: description
   */
  private setRgb(key: string) {
    const colorString = this.get(key);
    const colorArray: number[] = (colorString.match(/[0-9a-f]{2}/gi) ?? []).map(
      x => parseInt(x, 16)
    );
    const color: RgbColor = {
      r: colorArray[0] || 0,
      g: colorArray[1] || 0,
      b: colorArray[2] || 0,
    };
    console.log('setRgb', key, colorString, color);
    this.rgbColors[key] = color;
    return color;
  }

  /**
   * TODO: description
   */
  public getRgb(key: string): RgbColor {
    return this.rgbColors[key] || this.setRgb(key);
  }
}
