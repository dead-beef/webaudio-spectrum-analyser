import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

// eslint-disable-next-line @angular-eslint/use-component-selector
@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class UntilDestroy implements OnDestroy {
  private readonly destroyed = new ReplaySubject<boolean>(1);

  public readonly destroyed$ = this.destroyed.asObservable();

  /**
   * Constructor.
   */
  constructor() {
    // eslint-disable-next-line @angular-eslint/no-lifecycle-call
    const onDestroy = this.ngOnDestroy.bind(this);
    // eslint-disable-next-line @angular-eslint/no-lifecycle-call
    this.ngOnDestroy = () => {
      try {
        onDestroy();
      } finally {
        this.destroyed.next(true);
        this.destroyed.complete();
      }
    };
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.destroyed.next(true);
    this.destroyed.complete();
  }
}
