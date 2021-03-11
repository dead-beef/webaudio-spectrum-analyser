import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Analyser } from '../../classes/analyser/analyser';
import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AnalyserNumberFunctionId, Point } from '../../interfaces';
import { ColorService } from '../../services/color/color.service';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AnalyserState } from '../../state/analyser/analyser.store';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
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

  public readonly analyser: Analyser = this.analyserService.analyser;

  private readonly pointFrequency = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointFrequency$ = this.pointFrequency.asObservable();

  private readonly pointValue = new BehaviorSubject<number>(
    this.analyser.minDecibels
  );

  public readonly pointValue$ = this.pointValue.asObservable();

  public readonly functions: AnalyserNumberFunctionId[] = [
    'ZCR',
    'FFTM',
    'FFTP',
    'AC',
  ];

  private readonly values = this.functions.map(
    _ => new BehaviorSubject<number>(0)
  );

  public readonly values$ = this.values.map(subject => {
    return subject.asObservable();
  });

  public readonly functionEnabled$ = this.functions.map(fn => {
    return this.analyserService.select(AnalyserState.functionEnabled(fn));
  });

  public readonly valueColor = this.functions.map(fn => this.color.get(fn));

  /**
   * Constructor.
   * @param graphService
   */
  constructor(
    private readonly graphService: AudioGraphService,
    private readonly analyserService: AnalyserService,
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
    for (const subject of this.values) {
      subject.complete();
    }
  }

  /**
   * Converts canvas value to frequency.
   * @param x
   */
  private canvasToFrequency(x: number): number {
    return Math.pow(10, 1.301 + x * 3);
  }

  /**
   * Converts frequency to canvas value.
   * @param f
   */
  private frequencyToCanvas(f: number): number {
    return f <= 0 ? -1 : (Math.log10(f) - 1.301) / 3;
  }

  /**
   * Draws grid.
   * @param plotCount
   */
  private drawGrid(): void {
    if (this.canvas === null) {
      return;
    }
    this.canvas.log(20, 20000, x => this.frequencyToCanvas(x));
    if (this.analyser.minPitch > 20 || this.analyser.maxPitch < 20000) {
      this.canvas.vline(
        this.frequencyToCanvas(this.analyser.minPitch),
        'selection'
      );
      this.canvas.vline(
        this.frequencyToCanvas(this.analyser.maxPitch),
        'selection'
      );
    }
  }

  /**
   * Draws frequency data.
   */
  private drawFrequencyData(data: Float32Array) {
    if (this.canvas === null) {
      return;
    }
    const sr2 = this.analyser.sampleRate / 2;
    const dx = -sr2 / (data.length * 2);
    const yscale = 1 / (this.analyser.maxDecibels - this.analyser.minDecibels);
    const y0 = this.analyser.minDecibels;
    this.canvas.step(
      data,
      (x: number) => this.frequencyToCanvas(x * sr2 + dx),
      (y: number) => yscale * (y - y0),
      'chart',
      0
    );
  }

  /**
   * Draws autocorrelation data.
   */
  private drawAutocorrelationData(data: Float32Array) {
    if (this.canvas === null) {
      return;
    }
    const fs = this.analyser.sampleRate;
    this.canvas.plot(
      data.subarray(2),
      (x: number, i: number) => this.frequencyToCanvas(fs / (i + 2)),
      (y: number) => 0.5 * (1 + y),
      'ac-chart'
    );
  }

  /**
   * Draws prominence data.
   */
  public drawProminenceData(data: Float32Array) {
    if (this.canvas === null) {
      return;
    }
    const fscale = this.analyser.sampleRate / 2;
    const yscale = 1 / (this.analyser.maxDecibels - this.analyser.minDecibels);
    this.canvas.plot(
      data,
      (x: number) => this.frequencyToCanvas(x * fscale),
      (y: number) => y * yscale,
      'fftp-chart'
    );
    this.canvas.hline(
      yscale * this.analyser.prominenceThreshold,
      'fftp-threshold'
    );
  }

  /**
   * TODO: description
   */
  public setPoint(p: Nullable<Point>): void {
    if (p) {
      this.pointFrequency.next(this.canvasToFrequency(p.x));
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
    const fdata = this.analyser.fdata;
    let val = NaN;
    const i = this.analyser.indexOfFrequency(f);
    if (i >= 0 || i < fdata.length) {
      val = fdata[i];
    }
    this.pointValue.next(val);
  }

  /**
   * Animates canvas.
   */
  private _animate(paused: boolean) {
    if (this.canvas === null) {
      //console.log('canvas === null');
      return;
    }

    const resized = this.canvas.updateSize();
    //console.log('update', updated, analysed, resized);
    if (paused && !resized && !this.analyser.updated) {
      return;
    }

    this.updatePointValue();

    this.canvas.clear();
    this.drawFrequencyData(this.analyser.fdata);
    this.drawGrid();

    for (let i = 0; i < this.functions.length; ++i) {
      const fn = this.functions[i];
      const value: Nullable<number> = this.analyser.getOptional(fn);
      if (value !== null) {
        this.canvas.vline(this.frequencyToCanvas(value), fn);
        this.values[i].next(value);
      }
    }

    if (this.analyser.debug) {
      let data: Nullable<Float32Array> = this.analyser.getOptional('autocorr');
      if (data !== null) {
        this.drawAutocorrelationData(data);
      }

      data = this.analyser.getOptional('prominence');
      if (data !== null) {
        this.drawProminenceData(data);
      }
    }
  }
}
