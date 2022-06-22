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
    rmsThreshold: '#ff4444',
    ZCR: '#6f998a',
    FFTP: '#7e6f99',
    fftpChart: '#ff44ff',
    fftpThreshold: '#aa00aa',
    fftpeaks: '#29ffff',
    fftharmonics: '#29ff00',
    AC: '#996f83',
    acChart: '#ff4444',
    CP: '#96996f',
    MPD: '#76996f',
    mpdHistogram: '#29ff00',
    spectrogramMin: '#000000', //'#26262c',
    spectrogramMax: '#4aaed9',
    F0: '#ffffff',
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
