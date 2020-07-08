import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { catchError, distinctUntilChanged, flatMap } from 'rxjs/operators';

import { throttleTime_ } from './rxjs.util';

export class StoreAction<T> {
  public static readonly type: string;

  // eslint-disable-next-line require-jsdoc
  constructor(public payload: T) {}
}

export interface StoreActions {
  [key: string]: any;
}

/**
 * Store action constructor.
 * @param actionScope action scope
 */
export const actionConstructor = (scope: string) => <T>(name: string) =>
  class {
    public static readonly type: string = `[${scope}]: ${name}`;

    // eslint-disable-next-line require-jsdoc
    constructor(public payload: T) {}
  };

/**
 * TODO: description
 * @param formControlOrState
 * @param value$
 * @param setState
 * @param untilDestroyed
 * @param throttle
 */
export function stateFormControl<T>(
  formControlOrState: FormControl | any,
  value$: Observable<T>,
  setState: (value: T) => Observable<any>,
  untilDestroyed: <U>(o: Observable<U>) => Observable<U>,
  throttle?: number
): FormControl {
  let fc: FormControl;
  if (formControlOrState instanceof FormControl) {
    fc = formControlOrState;
  } else {
    fc = new FormControl(formControlOrState);
  }
  let valueChanges$: Observable<T> = fc.valueChanges;
  if (throttle) {
    const op: (o: Observable<T>) => Observable<T> = throttleTime_(throttle);
    value$ = value$.pipe(op);
    valueChanges$ = valueChanges$.pipe(op);
  }
  void valueChanges$
    .pipe(
      untilDestroyed,
      distinctUntilChanged(),
      flatMap(setState),
      catchError((err, caught) => {
        console.error(err);
        return caught;
      })
    )
    .subscribe();
  void value$
    .pipe(untilDestroyed, distinctUntilChanged())
    .subscribe(fc.setValue.bind(fc));
  return fc;
}
