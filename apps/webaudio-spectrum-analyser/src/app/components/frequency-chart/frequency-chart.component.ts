import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { Point } from '../../interfaces';
// import { AudioMath } from '../../classes/audio-math/audio-math';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';

@Component({
  selector: 'app-frequency-chart',
  templateUrl: './frequency-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyChartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') public canvas: ElementRef<HTMLCanvasElement>;

  private context: CanvasRenderingContext2D = null;

  private frame = 0;

  private readonly animate = this.animateCanvas.bind(this);

  public readonly graph: AudioGraph = this.graphService.graph;

  public error: Error = null;

  public width = 0;

  public height = 0;

  public eps = 1;

  public showPoint = false;

  public point: Point = { x: 0, y: 0 };

  public pointFrequency = 0;

  public pointValues: number[] = [];

  /**
   * Constructor.
   * @param zone
   * @param graphService
   */
  constructor(
    private readonly zone: NgZone,
    private readonly graphService: AudioGraphService
  ) {}

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    try {
      this.pointValues = this.graph.fdata.map(d => 0);
    } catch (err) {
      this.error = err;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    try {
      this.context = this.canvas.nativeElement.getContext('2d');
      this.zone.runOutsideAngular(() => {
        this.frame = requestAnimationFrame(this.animate);
      });
    } catch (err) {
      this.error = err;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.context = null;
    cancelAnimationFrame(this.frame);
  }

  /**
   * Sets point
   * @param ev
   */
  public setPoint(ev: { offsetX: number; offsetY: number }) {
    this.point.x = ev.offsetX;
    this.point.y = ev.offsetY;
    this.pointFrequency = this.canvasToFrequency(this.point.x);
  }

  /**
   * Resizes canvas.
   */
  private resize() {
    const canvas = this.canvas.nativeElement;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    if (canvas.width !== this.width) {
      //console.log('set canvas width');
      canvas.width = this.width;
    }
    if (canvas.height !== this.height) {
      //console.log('set canvas height');
      canvas.height = this.height;
    }
  }

  /**
   * Converts canvas value to frequency.
   * @param x
   */
  private canvasToFrequency(x: number): number {
    return Math.pow(10, 1.301 + (x / this.width) * 3);
  }

  /**
   * Converts frequency to canvas value.
   * @param f
   */
  private frequencyToCanvas(f: number): number {
    return ((Math.log10(f) - 1.301) / 3) * this.width;
  }

  /**
   * Draws grid.
   * @param plotCount
   */
  private drawGrid(plotCount: number): void {
    const ctx = this.context;
    ctx.strokeStyle = '#495865';
    ctx.fillStyle = '#495865';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 20, j = 10; i <= 20000; i += j) {
      const x = this.frequencyToCanvas(i);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      switch (i) {
        case 10:
        case 100:
        case 1000:
        case 10000:
          j = i;
          break;
      }
    }
    for (let i = 1; i < plotCount; i += 1) {
      const y = (i * this.height) / plotCount;
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    if (this.showPoint) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.point.x, 0);
      ctx.lineTo(this.point.x, this.height);
      ctx.stroke();
    }
  }

  /**
   * Draws frequency data.
   * @param data
   * @param yMin
   * @param yMax
   */
  private drawFrequencyData(
    data: Uint8Array,
    yMin: number,
    yMax: number
  ): number {
    const ctx = this.context;
    const yScale = (yMax - yMin) / 255.0;
    const sampleRate = this.graph.sampleRate;
    const fftSize = data.length * 2;
    const binSize = sampleRate / fftSize;
    const halfBinSize = binSize / 2;

    let prevF = 20;
    let prevX = 0;

    let pointValue = 0;

    ctx.strokeStyle = '#4aaed9';
    ctx.fillStyle = '#4aaed9';
    ctx.lineWidth = 0;

    for (let i = 0; i < data.length; i += 1) {
      const f = i * binSize;
      if (f < prevF) {
        continue;
      }
      const x = this.frequencyToCanvas(f + halfBinSize);
      if (data[i]) {
        const y = yScale * data[i];
        ctx.fillRect(prevX, yMax - y, x - prevX, y);
      }
      if (this.pointFrequency >= prevF && this.pointFrequency <= f) {
        pointValue = data[i];
      }
      prevF = f;
      prevX = x;
    }

    pointValue = Math.round(this.graph.byteToDecibels(pointValue));
    return pointValue;
  }

  /**
   * Draws autocorrelation data.
   * @param data
   * @param yMin
   * @param yMax
   */
  private drawAutocorrelationData(
    data: Float32Array,
    yMin: number,
    yMax: number
  ) {
    const ctx = this.context;
    const yMid = (yMin + yMax) / 2;
    const yScale = yMin - yMid;
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.width + 10, yMid);
    for (let i = 2; i < data.length; i += 1) {
      const f = this.graph.sampleRate / i;
      const x = this.frequencyToCanvas(f);
      const y = yMid + yScale * data[i];
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * Animates canvas.
   */
  private animateCanvas() {
    if (this.context === null) {
      console.log('canvas destroyed');
      return;
    }
    try {
      const plotCount: number = this.graph.fdata.length;
      const plotHeight: number = this.height / plotCount;

      this.resize();
      this.graph.analyse();

      this.context.clearRect(0, 0, this.width, this.height);

      let changes = false;
      const update = (prev: number, next: number): number => {
        if (Math.abs(next - prev) > this.eps) {
          changes = true;
          return next;
        }
        return prev;
      };

      this.graph.fdata.forEach((data, i) => {
        const pointValue: number = this.drawFrequencyData(
          data,
          i * plotHeight,
          (i + 1) * plotHeight
        );
        this.pointValues[i] = update(this.pointValues[i], pointValue);
      });
      this.drawGrid(plotCount);

      if (this.graph.debug) {
        for (const pd of this.graph.pitch) {
          if (pd.enabled) {
            switch (pd.short) {
              case 'AC':
                this.drawAutocorrelationData(
                  this.graph.autocorrdata,
                  0,
                  plotHeight
                );
                break;
              default:
                break;
            }
          }
        }
      }

      this.frame = requestAnimationFrame(this.animate);

      if (changes) {
        this.zone.run(() => null);
      }
    } catch (err) {
      this.zone.run(() => (this.error = err));
    }
  }
}
