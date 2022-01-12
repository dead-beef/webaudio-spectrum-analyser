import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Layouts } from '../../interfaces';
import { AudioGraphUiService } from '../../state/audio-graph-ui/audio-graph-ui.service';
import { AudioGraphUiState } from '../../state/audio-graph-ui/audio-graph-ui.store';
import { deepEqual, stateFormControl } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-ui-options',
  templateUrl: './ui-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiOptionsComponent {
  public layout = Layouts.VERTICAL;

  public readonly frequencyUnitForm = stateFormControl(
    this.fb.group({
      frequency: false,
      midiNumber: false,
      midiNote: false,
    }),
    this.ui.select(AudioGraphUiState.frequencyUnits),
    data => this.ui.dispatch('setFrequencyUnits', data),
    untilDestroyed(this),
    0,
    deepEqual
  );

  public readonly unitIds = Object.keys(this.frequencyUnitForm.controls);

  public readonly unitNames: string[] = ['Hz', 'MIDI number', 'Note'];

  public readonly form = new FormGroup({
    frequencyUnits: this.frequencyUnitForm,
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly ui: AudioGraphUiService
  ) {}
}
