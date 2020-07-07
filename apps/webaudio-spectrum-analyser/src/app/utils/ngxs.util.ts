import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AudioGraphStateModel } from '../state/audio-graph/audio-graph.model';

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
 * @param debounce
 */
export function stateFormControl<T>(
  formControlOrState: FormControl | any,
  value$: Observable<T>,
  setState: (value: T) => Observable<any>,
  untilDestroyed: <U>(o: Observable<U>) => Observable<U>,
  debounce?: number
): FormControl {
  let fc: FormControl;
  if (formControlOrState instanceof FormControl) {
    fc = formControlOrState;
  } else {
    fc = new FormControl(formControlOrState);
  }
  let valueChanges$: Observable<T> = fc.valueChanges.pipe(
    untilDestroyed,
    distinctUntilChanged()
  );
  value$ = value$.pipe(untilDestroyed, distinctUntilChanged());
  if (debounce) {
    value$ = value$.pipe(debounceTime(debounce));
    valueChanges$ = valueChanges$.pipe(debounceTime(debounce));
  }
  void valueChanges$.subscribe((value: T) => setState(value));
  void value$.subscribe((value: T) => fc.setValue(value));
  return fc;
}

/**
 * TODO: description
 * @param store
 * @param varName
 */
export function select<T>(
  store: Store,
  getter: (AudioGraphStateModel) => T
): Observable<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return store.select(state => getter(state.AudioGraph));
}
