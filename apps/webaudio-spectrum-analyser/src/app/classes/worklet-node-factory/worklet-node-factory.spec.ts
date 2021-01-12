import { WorkletNodeFactory } from './worklet-node-factory';

describe('WorkletNode', () => {
  it('should create an instance', () => {
    expect(new WorkletNodeFactory(null)).toBeTruthy();
  });
});
