import { AfterViewInit, ApplicationRef, Component } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit {
  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly app: ApplicationRef) {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit() {
    setTimeout(() => {
      if (environment.debug) {
        console.log('components', this.app.components);
        if (this.app.components.length) {
          console.log('enabling debug tools');
          enableDebugTools(this.app.components[0]);
        } else {
          console.warn('debug tools not enabled');
        }
      }
    });
  }
}
