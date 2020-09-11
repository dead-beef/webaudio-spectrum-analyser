import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const f = (value: string) => {
      return {};
    };
    const pipe = new SafeUrlPipe({
      sanitize: () => null,
      bypassSecurityTrustHtml: f,
      bypassSecurityTrustStyle: f,
      bypassSecurityTrustScript: f,
      bypassSecurityTrustResourceUrl: f,
      bypassSecurityTrustUrl: f,
    });
    expect(pipe).toBeTruthy();
  });
});
