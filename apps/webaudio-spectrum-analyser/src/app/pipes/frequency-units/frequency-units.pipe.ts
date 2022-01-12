import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { AudioMath } from '../../classes/audio-math/audio-math';
import { AudioGraphUiService } from '../../state/audio-graph-ui/audio-graph-ui.service';
import { AudioGraphUiState } from '../../state/audio-graph-ui/audio-graph-ui.store';
import { FrequencyUnitState } from '../../state/audio-graph-ui/interfaces';
import { UnitsPipe } from '../units/units.pipe';

@Pipe({
  name: 'frequencyUnits',
  pure: false,
})
export class FrequencyUnitsPipe implements OnDestroy, PipeTransform {
  private lastValue: Nullable<number> = null;

  private lastResult = 'N/A';

  private units: FrequencyUnitState = this.uiService.getState().frequencyUnit;

  private unitsChanged = false;

  private readonly subscription = this.uiService
    .select(AudioGraphUiState.frequencyUnits)
    .subscribe(units_ => {
      this.units = units_;
      this.unitsChanged = true;
      this.changeDetector.markForCheck();
    });

  private readonly notes: string[] = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly uiService: AudioGraphUiService,
    private readonly unitsPipe: UnitsPipe
  ) {
    //console.log('units', this.uiService.getState(), this.uiService.getState().frequencyUnit);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getMidiNote(midiNumber: number) {
    const n = Math.round(midiNumber);
    const octave = Math.floor(n / 12) - 1;
    const note = n % 12;
    return `${this.notes[note]}${octave}`;
  }

  public transform(value: Nullable<number>): string {
    if (value === null || isNaN(value)) {
      return 'N/A';
    }
    if (value === this.lastValue && !this.unitsChanged) {
      return this.lastResult;
    }

    const results: string[] = [];
    if (this.units.frequency) {
      results.push(this.unitsPipe.transform(value, 'Hz'));
    }
    value = AudioMath.getMidiNumber(value);
    if (this.units.midiNumber) {
      results.push(value.toFixed(1));
    }
    if (this.units.midiNote) {
      results.push(this.getMidiNote(value));
    }
    const res = results.join(' / ');

    this.lastValue = value;
    this.lastResult = res;
    this.unitsChanged = false;
    return res;
  }
}
