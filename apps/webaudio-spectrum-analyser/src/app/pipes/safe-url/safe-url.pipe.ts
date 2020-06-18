import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  /**
   * Constructor.
   * @param domSanitizer
   */
  constructor(private readonly domSanitizer: DomSanitizer) {}

  /**
   * TODO: description
   * @param value
   */
  public transform(value: string): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(value);
  }
}
