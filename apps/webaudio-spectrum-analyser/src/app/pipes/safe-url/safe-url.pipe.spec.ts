import { DomSanitizer } from '@angular/platform-browser';

import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe({
      sanitize: () => null,
      bypassSecurityTrustHtml: () => null,
      bypassSecurityTrustStyle: () => null,
      bypassSecurityTrustScript: () => null,
      bypassSecurityTrustUrl: () => null,
      bypassSecurityTrustResourceUrl: () => null,
    });
    expect(pipe).toBeTruthy();
  });
});
