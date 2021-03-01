import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AnalyserFunction, Point } from '../../interfaces';
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

  public readonly functions = this.analyser.functions.filter(
    fn => fn.timeDomain
  );

  private readonly values = this.functions.map(
    _ => new BehaviorSubject<number>(0)
  );

  public readonly values$ = this.values.map(subject => {
    return subject.asObservable();
  });

  public readonly functionEnabled$ = this.functions.map(fn => {
    return this.analyserService.select(AnalyserState.functionEnabled(fn.id));
  });

  public readonly valueColor = this.functions.map(fn => this.color.get(fn.id));

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
  public drawGrid() {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }
    const ymid = this.canvas!.size.height / 2;
    ctx.strokeStyle = this.color.get('grid');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ymid);
    ctx.lineTo(this.canvas!.size.width, ymid);
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  private drawValue(fn: AnalyserFunction): void {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }
    const yscale = this.canvas!.size.height / 2;
    const ymid = yscale;
    const y = ymid - yscale * fn.value;
    ctx.strokeStyle = this.color.get(fn.id);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.canvas!.size.width, y);
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  public drawData(data: Float32Array) {
    const ctx = this.canvas?.context;
    if (!ctx) {
      return;
    }

    const xscale = this.canvas!.size.width / (data.length - 1);
    const yscale = this.canvas!.size.height / 2;
    const ymid = yscale;

    ctx.strokeStyle = this.color.get('chart');
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.length; ++i) {
      const x = xscale * i;
      const y = ymid - yscale * data[i];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
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

    this.canvas.clear();
    this.drawGrid();
    this.drawData(this.analyser.tdata);
    for (let i = 0; i < this.functions.length; ++i) {
      if (this.functions[i].enabled) {
        this.drawValue(this.functions[i]);
        this.values[i].next(this.functions[i].value);
      }
    }
  }
}
