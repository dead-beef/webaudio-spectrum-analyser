import { Units2Pipe } from './units2.pipe';

describe('Units2Pipe', () => {
  it('create an instance', () => {
    const pipe = new Units2Pipe(
      { transform: () => '' } as any,
      { transform: () => '' } as any
    );
    expect(pipe).toBeTruthy();
  });
});
