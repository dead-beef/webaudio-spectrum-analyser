import { of } from 'rxjs';

import { AudioMath } from '../../classes/audio-math/audio-math';
import { FrequencyUnitsPipe } from './frequency-units.pipe';

describe('FrequencyUnitsPipe', () => {
  beforeEach(async () => {
    await AudioMath.init();
  });
  it('create an instance', () => {
    const pipe = new FrequencyUnitsPipe(
      {
        markForCheck: () => {},
      } as any,
      {
        getState: () => {
          return { frequencyUnit: {} };
        },
        select: () => of(),
      } as any,
      {
        transform: () => '',
      } as any
    );
    expect(pipe).toBeTruthy();
  });
});
