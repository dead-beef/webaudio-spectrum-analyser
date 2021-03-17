import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';

import { Analyser } from '../../classes/analyser/analyser';
import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AnalyserNumberFunctionId, Point } from '../../interfaces';
import { ColorService } from '../../services/color/color.service';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AnalyserState } from '../../state/analyser/analyser.store';
import { audioGraphAction } from '../../state/audio-graph/audio-graph.actions';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { CanvasComponent } from '../canvas/canvas.component';

@UntilDestroy()
@Component({
  selector: 'app-analyser-function-chart',
  templateUrl: './analyser-function-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyserFunctionChartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input() public domain: 'time' | 'frequency' = 'frequency';

  @ViewChild(CanvasComponent) public canvas: Nullable<CanvasComponent> = null;

  public readonly graph: AudioGraph = this.graphService.graph;

  public readonly analyser: Analyser = this.analyserService.analyser;

  public pointIndex: Nullable<number> = null;

  public functions: AnalyserNumberFunctionId[] = [];

  public functionColor: string[] = [];

  private readonly pointTime = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointTime$ = this.pointTime.asObservable();

  private pointValues: BehaviorSubject<Nullable<number>>[] = [];

  public pointValues$: Observable<Nullable<number>>[] = [];

  private meanValues: BehaviorSubject<Nullable<number>>[] = [];

  public meanValues$: Observable<Nullable<number>>[] = [];

  public readonly updateBound = this.update.bind(this);

  public nextFrame = 0;

  public values: Float32Array[] = [];

  public frameTimestamp = new Uint32Array();

  private logGrid = false;

  public unit = '';

  public unitPrefix = false;

  public precision = 2;

  private _frames = 0;

  /**
   * Getter.
   */
  public get frames(): number {
    return this._frames;
  }

  /**
   * Setter.
   */
  public set frames(f: number) {
    this.clear();
    this.nextFrame = 0;
    this.frameTimestamp = new Uint32Array(f);
    this.values = this.functions.map(_ => {
      return new Float32Array(f).fill(NaN);
    });
    this._frames = f;
  }

  private readonly xScale: (x: number) => number = x => x;

  private yScale: (y: number) => number = y => y;

  /**
   * Constructor.
   * @param graphService
   */
  constructor(
    private readonly actions$: Actions,
    private readonly graphService: AudioGraphService,
    private readonly analyserService: AnalyserService,
    private readonly color: ColorService
  ) {}

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    switch (this.domain) {
      case 'time':
        this.functions = this.analyser.TIME_DOMAIN_FUNCTION_IDS;
        this.yScale = (y: number) => y;
        this.logGrid = false;
        this.unit = '';
        this.unitPrefix = false;
        this.precision = 2;
        break;
      case 'frequency':
        this.functions = this.analyser.FREQUENCY_DOMAIN_FUNCTION_IDS;
        this.yScale = (y: number) => this.frequencyToCanvas(y);
        this.logGrid = true;
        this.unit = 'Hz';
        this.unitPrefix = true;
        this.precision = 1;
        break;
      default:
        throw new Error(
          `Invalid analyser function chart domain: ${this.domain}`
        );
    }
    this.functionColor = this.functions.map(fn => this.color.get(fn));
    this.pointValues = this.functions.map(_ => {
      return new BehaviorSubject<Nullable<number>>(null);
    });
    this.pointValues$ = this.pointValues.map(subject => {
      return subject.asObservable();
    });
    this.meanValues = this.functions.map(_ => {
      return new BehaviorSubject<Nullable<number>>(null);
    });
    this.meanValues$ = this.meanValues.map(subject => {
      return subject.asObservable();
    });

    void this.actions$
      .pipe(ofActionSuccessful(audioGraphAction.reset), untilDestroyed(this))
      .subscribe(() => this.clear());

    void this.analyserService
      .select(AnalyserState.historySize)
      .pipe(untilDestroyed(this))
      .subscribe(size => {
        this.frames = size;
      });
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    this.graph.onUpdate(this.updateBound);
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.graph.offUpdate(this.updateBound);
    this.pointTime.complete();
    for (const subject of this.pointValues) {
      subject.complete();
    }
    for (const subject of this.meanValues) {
      subject.complete();
    }
  }

  /**
   * TODO: description
   */
  public clear(): void {
    console.log('clear');
    this.nextFrame = 0;
    this.frameTimestamp.fill(0);
    for (const v of this.values) {
      v.fill(NaN);
    }
    if (this.canvas !== null) {
      this.canvas.clear();
    }
  }

  /**
   * TODO: description
   */
  private frequencyToCanvas(f: number): number {
    return f <= 0 ? -1 : (Math.log10(f) - 1.301) / 3;
  }

  /**
   * Draws grid.
   */
  private drawGrid(): void {
    if (this.canvas === null) {
      return;
    }
    if (this.logGrid) {
      this.canvas.log(20, 20000, y => this.frequencyToCanvas(y), false);
    }
  }

  /**
   * TODO: description
   */
  private drawData(): void {
    if (this.canvas === null) {
      return;
    }
    for (let i = 0; i < this.functions.length; ++i) {
      this.canvas.plot(
        this.values[i],
        this.xScale,
        this.yScale,
        this.functions[i]
      );
    }
  }

  /**
   * TODO: description
   */
  public setPoint(p: Nullable<Point>): void {
    if (p !== null) {
      const ti = Math.round(p.x * (this.frames - 1));
      const ts = this.frameTimestamp[ti];
      if (ts > 0) {
        this.pointTime.next((ts - this.frameTimestamp[0]) / 1000);
        this.pointIndex = ti;
      } else {
        this.pointTime.next(null);
        this.pointIndex = null;
      }
      this.updatePointValues();
    } else {
      this.pointTime.next(null);
      this.pointIndex = null;
    }
  }

  /**
   * TODO: description
   */
  private updatePointValues(): void {
    if (this.pointIndex !== null) {
      for (let i = 0; i < this.functions.length; ++i) {
        let value: Nullable<number> = this.values[i][this.pointIndex];
        if (isNaN(value)) {
          value = null;
        }
        this.pointValues[i].next(value);
      }
    }
  }

  /**
   * TODO: description
   */
  private mean(data: Float32Array): Nullable<number> {
    let sum = 0;
    let count = 0;
    for (const x of data) {
      if (!isNaN(x)) {
        ++count;
        sum += x;
      }
    }
    return count ? sum / count : null;
  }

  /**
   * TODO: description
   */
  private updateData(): boolean {
    let nextFrame: number;
    let shift: boolean;

    if (this.nextFrame < this.frames) {
      shift = false;
      nextFrame = this.nextFrame++;
    } else {
      shift = true;
      nextFrame = this.frames - 1;
      this.frameTimestamp.copyWithin(0, 1);
    }

    this.frameTimestamp[nextFrame] = Date.now();

    for (let i = 0; i < this.functions.length; ++i) {
      if (shift) {
        this.values[i].copyWithin(0, 1);
      }
      const value = this.analyser.getOptional(this.functions[i]);
      this.values[i][nextFrame] = value === null ? NaN : value;
      this.meanValues[i].next(this.mean(this.values[i]));
    }

    return shift;
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
    if (!paused) {
      this.updatePointValues();
      this.updateData();
    }
    this.canvas.clear();
    this.drawGrid();
    this.drawData();
  }
}
