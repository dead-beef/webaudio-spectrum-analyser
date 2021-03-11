import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AnalyserNumberFunctionId, Point } from '../../interfaces';
import { ColorService } from '../../services/color/color.service';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AnalyserState } from '../../state/analyser/analyser.store';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-time-domain-chart',
  templateUrl: './time-domain-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeDomainChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CanvasComponent) public canvas: Nullable<CanvasComponent> = null;

  private readonly graph = this.graphService.graph;

  private readonly analyser = this.analyserService.analyser;

  private readonly pointTime = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointTime$ = this.pointTime.asObservable();

  private readonly pointValue = new BehaviorSubject<number>(0);

  public readonly pointValue$ = this.pointValue.asObservable();

  public readonly functions: AnalyserNumberFunctionId[] = ['RMS'];

  private readonly values = this.functions.map(
    _ => new BehaviorSubject<number>(0)
  );

  public readonly values$ = this.values.map(subject => {
    return subject.asObservable();
  });

  public readonly functionEnabled$ = this.functions.map(id => {
    return this.analyserService.select(AnalyserState.functionEnabled(id));
  });

  public readonly valueColor = this.functions.map(id => this.color.get(id));

  public readonly updateBound = this.update.bind(this);

  /**
   * Constructor.
   */
  constructor(
    private readonly graphService: AudioGraphService,
    private readonly analyserService: AnalyserService,
    private readonly color: ColorService
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
    this.pointTime.complete();
    this.pointValue.complete();
    for (const subject of this.values) {
      subject.complete();
    }
  }

  /**
   * TODO: description
   */
  public setPoint(p: Nullable<Point>): void {
    if (p !== null) {
      const tscale = this.analyser.fftSize / this.analyser.sampleRate;
      this.pointTime.next(p.x * tscale);
      this.updatePointValue();
    } else {
      this.pointTime.next(null);
    }
  }

  /**
   * TODO: description
   */
  public updatePointValue() {
    const tdata = this.analyser.tdata;
    const t = this.pointTime.value;
    if (t !== null) {
      let val = NaN;
      const i = Math.round(t * this.analyser.sampleRate);
      if (i >= 0 || i < tdata.length) {
        val = tdata[i];
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

    this.updatePointValue();

    const xscale = (x: number) => x;
    const yscale = (y: number) => 0.5 * (1 + y);

    this.canvas.clear();
    this.canvas.hline(0.5, 'grid');
    this.canvas.plot(this.analyser.tdata, xscale, yscale);
    for (let i = 0; i < this.functions.length; ++i) {
      const fn = this.functions[i];
      const value: Nullable<number> = this.analyser.getOptional(fn);
      if (value !== null) {
        this.canvas.hline(yscale(value), fn);
        this.values[i].next(value);
      }
    }
  }
}
