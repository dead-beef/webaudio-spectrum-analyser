import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { PitchDetection, Point } from '../../interfaces';
import { ColorService } from '../../services/color/color.service';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-frequency-chart',
  templateUrl: './frequency-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CanvasComponent) public canvas: Nullable<CanvasComponent> = null;

  private readonly animate = this._animate.bind(this);

  public readonly graph: AudioGraph = this.graphService.graph;

  private readonly pointFrequency = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointFrequency$ = this.pointFrequency.asObservable();

  private readonly pointValue = new BehaviorSubject<number>(
    this.graph.minDecibels
  );

  public readonly pointValue$ = this.pointValue.asObservable();

  public readonly pitch = this.graph.pitch;

  private readonly pitchValue = this.pitch.map(
    _ => new BehaviorSubject<number>(0)
  );

  public readonly pitchValue$ = this.pitchValue.map(subject => {
    return subject.asObservable();
  });

  public readonly pitchEnabled$ = this.pitch.map(p => {
    return this.graphService.select(AudioGraphState.pitchEnabled(p.id));
  });

  public readonly pitchColor = this.pitch.map(p => this.color.get(p.id));

  /**
   * Constructor.
   * @param graphService
   */
  constructor(
    private readonly graphService: AudioGraphService,
    private readonly color: ColorService
  ) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    this.graph.onUpdate(this.animate);
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.graph.offUpdate(this.animate);
    this.pointFrequency.complete();
    this.pointValue.complete();
    for (const subject of this.pitchValue) {
      subject.complete();
    }
  }

  /**
   * Converts canvas value to frequency.
   * @param x
   */
  private canvasToFrequency(x: number, percent: boolean = false): number {
    if (!percent) {
      x /= this.canvas!.size.width;
    }
    return Math.pow(10, 1.301 + x * 3);
  }

  /**
   * Converts frequency to canvas value.
   * @param f
   */
  private frequencyToCanvas(f: number): number {
    return ((Math.log10(f) - 1.301) / 3) * this.canvas!.size.width;
  }

  /**
   * Draws grid.
   * @param plotCount
   */
  private drawGrid(): void {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }
    const height = this.canvas!.size.height;
    const color = this.color.get('grid');
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 20, j = 10; i <= 20000; i += j) {
      const x = this.frequencyToCanvas(i);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      switch (i) {
        case 10:
        case 100:
        case 1000:
        case 10000:
          j = i;
          break;
      }
    }
    ctx.stroke();

    if (this.graph.minPitch > 20 || this.graph.maxPitch < 20000) {
      const x0 = this.frequencyToCanvas(this.graph.minPitch);
      const x1 = this.frequencyToCanvas(this.graph.maxPitch);
      ctx.strokeStyle = this.color.get('selection');
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0, height);
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, height);
      ctx.stroke();
    }
  }

  /**
   * Draws pitch values
   * @param pitch
   */
  private drawPitchValue(pitch: PitchDetection): void {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }
    const x = this.frequencyToCanvas(pitch.value);
    ctx.strokeStyle = this.color.get(pitch.id);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.canvas!.size.height);
    ctx.stroke();
  }

  /**
   * Draws frequency data.
   * @param data
   * @param yMin
   * @param yMax
   */
  private drawFrequencyData(data: Float32Array) {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }

    const width = this.canvas!.size.width;
    const yMin = 0;
    const yMax = this.canvas!.size.height;
    const dMin = this.graph.minDecibels;
    const dMax = this.graph.maxDecibels;
    const yScale = (yMax - yMin) / (dMax - dMin);
    const sampleRate = this.graph.sampleRate;
    const fftSize = data.length * 2;
    const binSize = sampleRate / fftSize;
    const halfBinSize = binSize / 2;
    const start = this.graph.indexOfFrequency(20);

    let prevX = 0;
    let drawing = true;

    ctx.fillStyle = this.color.get('chart');
    ctx.lineWidth = 0;

    ctx.beginPath();
    ctx.moveTo(width, yMax);
    ctx.lineTo(0, yMax);

    for (let i = start; i < data.length; ++i) {
      const f = i * binSize + halfBinSize;
      const x = this.frequencyToCanvas(f);
      if (Math.abs(data[i] - data[i - 1]) < 0.5 && prevX > 0) {
        drawing = false;
      } else {
        if (!drawing) {
          drawing = true;
          ctx.lineTo(prevX, yMax - yScale * Math.max(0, data[i - 1] - dMin));
        }
        const y = yScale * Math.max(0, data[i] - dMin);
        ctx.lineTo(prevX, yMax - y);
        ctx.lineTo(x, yMax - y);
      }
      prevX = x;
    }

    ctx.fill();
  }

  /**
   * Draws autocorrelation data.
   * @param data
   * @param yMin
   * @param yMax
   */
  private drawAutocorrelationData(data: Float32Array) {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }
    const yMin = 0;
    const yMax = this.canvas!.size.height;
    const yMid = (yMin + yMax) / 2;
    const yScale = yMin - yMid;
    ctx.strokeStyle = this.color.get('ac-chart');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.canvas!.size.width + 10, yMid);
    for (let i = 2; i < data.length; ++i) {
      const f = this.graph.sampleRate / i;
      const x = this.frequencyToCanvas(f);
      const y = yMid + yScale * data[i];
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * Draws prominence data.
   * @param data
   * @param yMin
   * @param yMax
   */
  public drawProminenceData(data: Float32Array) {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }
    const dMin = this.graph.minDecibels;
    const dMax = this.graph.maxDecibels;
    const width = this.canvas!.size.width;
    const yMin = 0;
    const yMax = this.canvas!.size.height;
    const yScale = (yMax - yMin) / (dMax - dMin);
    const sampleRate = this.graph.sampleRate;
    const fftSize = data.length * 2;
    const binSize = sampleRate / fftSize;
    let drawing = true;
    let y = 0;
    ctx.strokeStyle = this.color.get('fftp-chart');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, yMax);
    for (let i = 0; i < data.length; ++i) {
      if (data[i] === data[i - 1]) {
        drawing = false;
        continue;
      }
      if (!drawing) {
        drawing = true;
        const prevF = (i - 1) * binSize;
        const prevX = this.frequencyToCanvas(prevF);
        ctx.lineTo(prevX, y);
      }
      const f = i * binSize;
      const x = this.frequencyToCanvas(f);
      y = yMax - yScale * data[i];
      ctx.lineTo(x, y);
    }
    if (!drawing) {
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.strokeStyle = this.color.get('fftp-threshold');
    y = yMin + (yMax - yMin) * (1 - this.graph.prominenceThreshold);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  public setPoint(p: Nullable<Point>): void {
    if (p) {
      this.pointFrequency.next(this.canvasToFrequency(p.x, true));
      this.updatePointValue();
    } else {
      this.pointFrequency.next(null);
    }
  }

  /**
   * TODO: description
   */
  public updatePointValue() {
    const f = this.pointFrequency.value;
    if (f === null) {
      return;
    }
    const fdata = this.graph.fdata;
    let val = NaN;
    const i = this.graph.indexOfFrequency(f);
    if (i >= 0 || i < fdata.length) {
      val = fdata[i];
    }
    this.pointValue.next(val);
  }

  /**
   * Animates canvas.
   */
  private _animate(updated: boolean, analysed: boolean) {
    if (this.canvas === null) {
      //console.log('canvas === null');
      return;
    }

    const resized = this.canvas.updateSize();
    //console.log('update', updated, analysed, resized);
    if (!(updated || analysed || resized)) {
      return;
    }

    this.updatePointValue();

    this.canvas.clear();
    this.drawFrequencyData(this.graph.fdata);
    this.drawGrid();
    for (let i = 0; i < this.pitch.length; ++i) {
      if (this.graph.pitch[i].enabled) {
        this.drawPitchValue(this.graph.pitch[i]);
        this.pitchValue[i].next(this.graph.pitch[i].value);
      }
    }

    if (this.graph.debug) {
      for (const pd of this.graph.pitch) {
        if (pd.enabled) {
          switch (pd.id) {
            case 'AC':
              this.drawAutocorrelationData(this.graph.autocorrdata);
              break;
            case 'FFTP':
              this.drawProminenceData(this.graph.prominenceData);
              break;
            default:
              break;
          }
        }
      }
    }
  }
}
