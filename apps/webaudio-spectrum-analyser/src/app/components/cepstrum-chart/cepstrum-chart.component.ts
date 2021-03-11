import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { /*AnalyserFunction,*/ Point } from '../../interfaces';
//import { ColorService } from '../../services/color/color.service';
import { AnalyserService } from '../../state/analyser/analyser.service';
//import { AnalyserState } from '../../state/analyser/analyser.store';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-cepstrum-chart',
  templateUrl: './cepstrum-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CepstrumChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CanvasComponent) public canvas: Nullable<CanvasComponent> = null;

  private readonly graph = this.graphService.graph;

  private readonly analyser = this.analyserService.analyser;

  private readonly pointFrequency = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointFrequency$ = this.pointFrequency.asObservable();

  private readonly pointValue = new BehaviorSubject<number>(0);

  public readonly pointValue$ = this.pointValue.asObservable();

  public readonly updateBound = this.update.bind(this);

  /**
   * Constructor.
   */
  constructor(
    private readonly graphService: AudioGraphService,
    private readonly analyserService: AnalyserService /*,
    private readonly color: ColorService*/
  ) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit(): void {
    this.graph.onUpdate(this.updateBound);
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy(): void {
    this.graph.offUpdate(this.updateBound);
    this.pointFrequency.complete();
    this.pointValue.complete();
  }

  /**
   * TODO: description
   */
  public clear(): void {
    console.log('clear');
    if (this.canvas !== null) {
      this.canvas.clear();
    }
  }

  /**
   * TODO: description
   */
  public setPoint(p: Nullable<Point>): void {
    if (p !== null) {
      this.pointFrequency.next(this.canvasToFrequency(p.x));
      this.updatePointValue();
    } else {
      this.pointFrequency.next(null);
    }
  }

  /**
   * TODO: description
   */
  private canvasToQuefrency(x: number): number {
    return Math.pow(10, -4.301 + x * 3);
  }

  /**
   * TODO: description
   */
  private quefrencyToCanvas(q: number): number {
    return q <= 0 ? -1 : (Math.log10(q) + 4.301) / 3;
  }

  /**
   * TODO: description
   */
  private canvasToFrequency(x: number): number {
    return 1.0 / this.canvasToQuefrency(x);
  }

  /**
   * TODO: description
   */
  /*private frequencyToCanvas(f: number): number {
    return this.quefrencyToCanvas(1.0 / f);
    }*/

  /**
   * TODO: description
   */
  public drawGrid(): void {
    if (this.canvas === null) {
      return;
    }
    this.canvas.log(0.5e-4, 0.5e-1, (x: number) => this.quefrencyToCanvas(x));
  }

  /**
   * TODO: description
   */
  public drawData(): void {
    if (this.canvas === null) {
      return;
    }
    const binSize = 2.0 / this.analyser.sampleRate;
    this.canvas.step(
      this.analyser.get('cepstrum'),
      (x: number, i: number) => this.quefrencyToCanvas(binSize * (i - 0.5)),
      (y: number) => y,
      'chart',
      0
    );
  }

  /**
   * TODO: description
   */
  public updatePointValue(): void {
    const f = this.pointFrequency.value;
    if (f !== null) {
      const i = this.analyser.indexOfQuefrency(1 / f);
      const cdata = this.analyser.get('cepstrum');
      let val = NaN;
      if (i > 0 && i < cdata.length) {
        val = cdata[i];
      }
      this.pointValue.next(val);
    }
  }

  /**
   * TODO: description
   */
  public update(paused: boolean): void {
    if (!this.canvas) {
      //console.log('canvas === null');
      return;
    }
    const resized = this.canvas.updateSize();
    //console.log('update', updated, analysed, resized);
    if (paused && !resized && !this.analyser.updated) {
      return;
    }
    this.canvas.clear();
    this.drawData();
    this.drawGrid();
    this.updatePointValue();
  }
}
