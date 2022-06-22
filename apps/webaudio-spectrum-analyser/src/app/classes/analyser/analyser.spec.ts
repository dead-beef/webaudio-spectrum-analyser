import { AudioMath } from '../audio-math/audio-math';
import { Analyser } from './analyser';

describe('Analyser', () => {
  beforeEach(async () => {
    await AudioMath.init();
  });

  it('should create an instance', () => {
    expect(new Analyser()).toBeTruthy();
  });
});
