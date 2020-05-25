import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ElementRef
} from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';

@Component({
  selector: 'audio-graph',
  templateUrl: './audio-graph.component.html'
})
export class AudioGraphComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(FrequencyChartComponent) chart: FrequencyChartComponent;
  @ViewChild('audio') audioRef: ElementRef;

  public graph: AudioGraph = null;
  public audio: HTMLAudioElement;
  public error: Error = null;

  private _volume: number;
  private _logVolume: number;

  get volume(): number {
    return this._logVolume;
  }
  set volume(logVolume: number) {
    const volume: number = Math.pow(2.0, logVolume) - 1.0;
    this._volume = volume;
    this._logVolume = logVolume;
    if(this.audio) {
      this.audio.volume = volume;
    }
  }

  constructor() {
  }

  ngOnInit() {
    try {
      this.graph = new AudioGraph();
      this.volume = 0.25;
    }
    catch(err) {
      console.error(err);
      this.error = err;
    }
  }

  ngAfterViewInit() {
    try {
      this.audio = this.audioRef.nativeElement;
      this.audio.srcObject = this.graph.stream;
      this.audio.volume = this.volume;
    }
    catch(err) {
      console.error(err);
      this.error = err;
    }
  }

  ngOnDestroy() {
    if(this.graph) {
      this.graph.destroy();
    }
    this.audio = null;
  }

  play() {
    this.graph.play();
    this.audio.play();
  }

  pause() {
    this.graph.pause();
    this.audio.pause();
  }

  toggle() {
    if(this.graph.paused) {
      this.play();
    }
    else {
      this.pause();
    }
  }

  reset() {
    this.graph.createAnalysers();
    this.chart.clear();
  }

}
