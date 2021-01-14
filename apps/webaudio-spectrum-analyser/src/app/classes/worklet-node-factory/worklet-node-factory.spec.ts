import { MockAudioContext } from '../../utils/test.util';
import { WorkletNodeFactory } from './worklet-node-factory';

describe('WorkletNode', () => {
  it('should create an instance', () => {
    expect(new WorkletNodeFactory(new MockAudioContext() as any)).toBeTruthy();
  });
});
