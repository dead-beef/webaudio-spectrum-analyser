import { PitchShifterNode } from './pitch-shifter-node';

describe('PitchShifterNode', () => {
  it('should create an instance', () => {
    expect(new PitchShifterNode(new AudioContext())).toBeTruthy();
  });
});
