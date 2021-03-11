import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';

import { AnalyserNumberFunctionId, Point } from '../../interfaces';
import { ColorService } from '../../services/color/color.service';
import { AnalyserService } from '../../state/analyser/analyser.service';
import { AnalyserState } from '../../state/analyser/analyser.store';
import { audioGraphAction } from '../../state/audio-graph/audio-graph.actions';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { CanvasComponent } from '../canvas/canvas.component';

@UntilDestroy()
@Component({
  selector: 'app-spectrogram',
  templateUrl: './spectrogram.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpectrogramComponent implements AfterViewInit, OnDestroy {
  @ViewChild(CanvasComponent) public canvas: Nullable<CanvasComponent> = null;

  private readonly graph = this.graphService.graph;

  private readonly analyser = this.analyserService.analyser;

  private readonly pointTime = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointTime$ = this.pointTime.asObservable();

  private readonly pointFrequency = new BehaviorSubject<Nullable<number>>(null);

  public readonly pointFrequency$ = this.pointFrequency.asObservable();

  private readonly pointValue = new BehaviorSubject<number>(0);

  public readonly pointValue$ = this.pointValue.asObservable();

  public readonly updateBound = this.update.bind(this);

  private readonly functions: AnalyserNumberFunctionId[] = [
    'ZCR',
    'FFTM',
    'FFTP',
    'AC',
  ];

  public frames = 240;

  public nextFrame = 0;

  public frameTimestamp = new Uint32Array();

  public imageData: Nullable<ImageData> = null;

  /**
   * Constructor.
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
  public ngAfterViewInit(): void {
    this.graph.onUpdate(this.updateBound);
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
  public ngOnDestroy(): void {
    this.graph.offUpdate(this.updateBound);
    this.pointTime.complete();
    this.pointFrequency.complete();
    this.pointValue.complete();
  }

  /**
   * TODO: description
   */
  public initImage(): void {
    if (this.canvas === null || this.canvas.context === null) {
      return;
    }
    const width = this.frames;
    const height = this.analyser.fftSize / 2;
    this.canvas.setSize(width, height);
    this.imageData = this.canvas.context.createImageData(1, height);
    this.frameTimestamp = new Uint32Array(width);
    this.nextFrame = 0;
  }

  /**
   * TODO: description
   */
  public updateImageSize(): boolean {
    if (this.canvas === null) {
      return false;
    }
    this.canvas.getSize();
    if (
      this.imageData === null ||
      //this.imageData.width !== this.frames ||
      this.imageData.height !== this.analyser.fftSize / 2 ||
      this.frameTimestamp.length !== this.frames
    ) {
      this.initImage();
      return true;
    }
    return false;
  }

  /**
   * TODO: description
   */
  public clear(): void {
    console.log('clear');
    this.nextFrame = 0;
    this.frameTimestamp.fill(0);
    if (this.canvas !== null) {
      this.canvas.clear();
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
      } else {
        this.pointTime.next(null);
      }
      const fscale = this.analyser.sampleRate / 2;
      this.pointFrequency.next((1.0 - p.y) * fscale);
      this.updatePointValue();
    } else {
      this.pointTime.next(null);
      this.pointFrequency.next(null);
    }
  }

  /**
   * TODO: description
   */
  public updateData(data: Float32Array, min: number, max: number): boolean {
    let i: number;
    let shift: boolean;

    if (this.nextFrame < this.frames) {
      shift = false;
      i = this.nextFrame++;
    } else {
      shift = true;
      i = this.frames - 1;
      this.frameTimestamp.copyWithin(0, 1);
    }

    this.frameTimestamp[i] = Date.now();

    const img = this.imageData!.data;
    const minColor = this.color.getRgb('spectrogram-min');
    const maxColor = this.color.getRgb('spectrogram-max');
    for (i = 0; i < data.length; ++i) {
      const kMax = (data[i] - min) / (max - min);
      const kMin = 1.0 - kMax;
      const j = img.length - 4 * (i + 1);
      img[j] = minColor.r * kMin + maxColor.r * kMax;
      img[j + 1] = minColor.g * kMin + maxColor.g * kMax;
      img[j + 2] = minColor.b * kMin + maxColor.b * kMax;
      img[j + 3] = 255;
    }

    for (const id of this.functions) {
      const value: Nullable<number> = this.analyser.getOptional(id);
      if (value !== null) {
        i = this.analyser.indexOfFrequency(value);
        if (i >= 0 && i < data.length) {
          i = img.length - 4 * (i + 1);
          const color = this.color.getRgb(id);
          img[i] = color.r;
          img[i + 1] = color.g;
          img[i + 2] = color.b;
        }
      }
    }

    return shift;
  }

  /**
   * TODO: description
   */
  public drawData(): void {
    const ctx = this.canvas?.context;
    if (!(ctx && this.imageData)) {
      return;
    }
    //console.log(this.nextFrame, this.imageData);
    ctx.putImageData(this.imageData, this.nextFrame - 1, 0);
  }

  /**
   * TODO: description
   */
  public updatePointValue(): void {
    const tdata = this.analyser.tdata;
    const t = this.pointTime.value;
    const f = this.pointFrequency.value;
    if (t !== null && f !== null) {
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
    const resized = this.updateImageSize();
    //console.log('update', updated, analysed, resized);
    if (paused && !resized) {
      return;
    }
    const shift = this.updateData(
      this.analyser.fdata,
      this.analyser.minDecibels,
      this.analyser.maxDecibels
    );
    if (resized) {
      this.canvas.clear();
    }
    if (shift) {
      this.canvas.shift(-1, 0);
    }
    this.drawData();
    this.updatePointValue();
  }
}
