import { AudioGraph } from './audio-graph';

describe('AudioGraph', () => {
  it('should create an instance', async () => {
    const graph = await AudioGraph.create();
    expect(graph).toBeTruthy();
    graph.destroy();
  });
});
