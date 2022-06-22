import { AudioMath } from '../audio-math/audio-math';
import { PitchShifterNode } from './pitch-shifter-node';

describe('PitchShifterNode', () => {
  beforeEach(async () => {
    await AudioMath.init();
  });

  it('should create an instance', () => {
    expect(new PitchShifterNode(new AudioContext())).toBeTruthy();
  });
});
