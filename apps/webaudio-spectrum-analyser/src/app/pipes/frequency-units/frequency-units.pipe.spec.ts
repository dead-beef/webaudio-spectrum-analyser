import { of } from 'rxjs';

import { FrequencyUnitsPipe } from './frequency-units.pipe';

describe('FrequencyUnitsPipe', () => {
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
