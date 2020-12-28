import { AbstractControl, FormControl } from '@angular/forms';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
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
export function actionConstructor(scope: string) {
  /**
   * TODO: description
   * @param name
   */
  function createAction<T>(name: string) {
    return class {
      public static readonly type: string = `[${scope}]: ${name}`;

      // eslint-disable-next-line require-jsdoc
      constructor(public payload: T) {}
    };
  }
  return createAction;
}

/**
 * TODO: description
 * @param formControlOrState
 * @param value$
 * @param setState
 * @param destroyed$
 * @param throttle
 */
export function stateFormControl<T>(
  formControlOrState: AbstractControl | any,
  value$: Observable<T>,
  setState: (value: T) => Observable<any>,
  untilDestroyed: MonoTypeOperatorFunction<T>,
  throttle?: number,
  compare?: (prev: T, next: T) => boolean
): AbstractControl {
  let fc: AbstractControl;
  if (formControlOrState instanceof AbstractControl) {
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
      distinctUntilChanged(compare),
      flatMap(setState),
      catchError(function error(err, caught) {
        console.error(err);
        return caught;
      })
    )
    .subscribe();
  void value$
    .pipe(untilDestroyed, distinctUntilChanged(compare))
    .subscribe(fc.setValue.bind(fc));
  return fc;
}
