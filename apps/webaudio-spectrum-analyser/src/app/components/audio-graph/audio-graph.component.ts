import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';

@Component({
  selector: 'app-audio-graph',
  templateUrl: './audio-graph.component.html',
})
export class AudioGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(FrequencyChartComponent) public chart: FrequencyChartComponent;

  @ViewChild('audio') public audioRef: ElementRef<HTMLAudioElement>;

  public graph: AudioGraph = null;

  public audio: HTMLAudioElement;

  public error: Error = null;

  /**
   * TODO: revise if this value is needed, it is currently not used.
   */
  private volumeValue: number;

  private logVolumeValue: number;

  constructor(private readonly audioGraphService: AudioGraphService) {}

  /**
   * Volume getter.
   */
  public get volume(): number {
    return this.logVolumeValue;
  }

  /**
   * Volume setter.
   */
  public set volume(logVolume: number) {
    const base = 2.0;
    const volume: number = Math.pow(base, logVolume) - 1.0;
    this.volumeValue = volume;
    this.logVolumeValue = logVolume;
    if (this.audio) {
      this.audio.volume = this.volumeValue;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    try {
      this.graph = new AudioGraph(this.audioGraphService);
      this.volume = 0.25;
    } catch (err) {
      console.error(err);
      this.error = err;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    try {
      this.audio = this.audioRef.nativeElement;
      this.audio.srcObject = this.graph.stream;
      this.audio.volume = this.volume;
    } catch (err) {
      console.error(err);
      this.error = err;
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    if (this.graph) {
      this.graph.destroy();
    }
    this.audio = null;
  }

  /**
   * Plays audio.
   */
  public play() {
    this.graph.play();
    void this.audio.play();
  }

  /**
   * Pauses audio.
   */
  public pause() {
    this.graph.pause();
    this.audio.pause();
  }

  /**
   * Toggles playback.
   */
  public toggle() {
    if (this.graph.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Resets chart.
   */
  public reset() {
    this.graph.createAnalysers();
    this.chart.clear();
  }
}
