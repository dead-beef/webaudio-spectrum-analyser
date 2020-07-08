import { ElementRef } from '@angular/core';

import { InputFileUrlDirective } from './input-file-url.directive';

describe('InputFileUrlDirective', () => {
  it('should create an instance', () => {
    const element = document.createElement('div');
    const elRef = new ElementRef(element);
    const directive = new InputFileUrlDirective(elRef);
    expect(directive).toBeTruthy();
  });
});
