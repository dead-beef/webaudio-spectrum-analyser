import { ErrorPipe } from './error.pipe';

describe('ErrorPipe', () => {
  it('create an instance', () => {
    const pipe = new ErrorPipe();
    expect(pipe).toBeTruthy();
  });
});
