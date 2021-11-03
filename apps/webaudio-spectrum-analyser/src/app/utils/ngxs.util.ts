import { AbstractControl, FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  flatMap,
  skip,
} from 'rxjs/operators';

import { deepCopy } from './misc';
import { throttleTime_ } from './rxjs.util';

export class StoreAction<T> {
  public static readonly type: string;

  constructor(public payload: T) {}
}

export interface StoreActions {
  [key: string]: any;
}

export interface Action<T> {
  payload: T;
}

export interface ActionConstructor<T> {
  readonly type: string;
  new (payload: T): Action<T>;
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
    return class implements Action<T> {
      public static readonly type: string = `[${scope}]: ${name}`;

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
  let valueChanges$: Observable<T> = fc.valueChanges.pipe(skip(1));
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

/**
 * TODO: description
 */
export function initState<T>(
  store: Store,
  defaults: T,
  selector: (any) => T,
  action: ActionConstructor<T>
) {
  defaults = deepCopy(defaults);
  let state = store.selectSnapshot(selector);
  console.log('state', state);
  if (state !== null && state !== undefined) {
    state = {
      ...defaults,
      ...state,
    };
  } else {
    state = defaults;
  }
  console.log('state with defaults', state);
  void store
    .dispatch(new action(state))
    .pipe(
      catchError(err => {
        console.warn('invalid state', state);
        console.warn('resetting state');
        //store.reset(defaults);
        return store.dispatch(new action(defaults));
      })
    )
    .subscribe();
}
