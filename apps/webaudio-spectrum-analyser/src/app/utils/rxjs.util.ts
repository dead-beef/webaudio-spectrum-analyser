import {
  asyncScheduler,
  MonoTypeOperatorFunction,
  Observable,
  SchedulerLike,
  Subscription,
} from 'rxjs';

/**
 * TODO: description
 * @param x
 * @param y
 */
export function arrayEqual(x: any[], y: any) {
  if (!Array.isArray(y)) {
    return false;
  }
  return x.length === y.length && x.every((xx, i) => deepEqual(xx, y[i]));
}

/**
 * TODO: description
 * @param x
 * @param y
 */
export function objectEqual(x: Record<string, any>, y: any) {
  if (typeof y !== 'object') {
    return false;
  }
  const y_: Record<string, any> = y;
  for (const k in x) {
    if (
      Object.prototype.hasOwnProperty.call(x, k) &&
      !Object.prototype.hasOwnProperty.call(y_, k)
    ) {
      return false;
    }
  }
  for (const k in y_) {
    if (
      !Object.prototype.hasOwnProperty.call(x, k) ||
      !Object.prototype.hasOwnProperty.call(y_, k) ||
      !deepEqual(x[k], y_[k])
    ) {
      return false;
    }
  }
  return true;
}

/**
 * TODO: description
 * @param x
 * @param y
 */
export function deepEqual(x: any, y: any) {
  if (Array.isArray(x)) {
    return arrayEqual(x, y);
  }
  if (typeof x === 'object') {
    /* eslint-disable no-prototype-builtins */
    /* eslint-enable no-prototype-builtins */
    return objectEqual(x, y);
  }
  return x === y;
}

/**
 * TODO: description
 * @param duration
 * @param scheduler
 */
export function throttleTime_<T>(
  duration: number,
  scheduler: SchedulerLike = asyncScheduler
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    new Observable<T>(observer => {
      let source_: Nullable<Subscription> = null;
      let timeout: Nullable<Subscription> = null;
      let hasNext = false;
      let next: T;

      /**
       * TODO: description
       */
      function unsubscribe() {
        //console.log('throttle unsubscribe');
        if (timeout !== null) {
          timeout.unsubscribe();
          timeout = null;
        }
        if (source_ !== null) {
          source_.unsubscribe();
          source_ = null;
        }
        hasNext = false;
      }

      source_ = source.subscribe({
        next(value: T) {
          if (timeout === null) {
            hasNext = false;
            observer.next(value);
            timeout = scheduler.schedule(() => {
              timeout = null;
              if (hasNext) {
                observer.next(next);
                hasNext = false;
              }
            }, duration);
          } else {
            hasNext = true;
            next = value;
          }
        },
        error(err) {
          unsubscribe();
          observer.error(err);
        },
        complete() {
          if (hasNext) {
            observer.next(next);
          }
          unsubscribe();
          observer.complete();
        },
      });

      return unsubscribe;
    });
}
