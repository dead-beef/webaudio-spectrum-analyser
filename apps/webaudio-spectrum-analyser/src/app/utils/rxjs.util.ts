import {
  asyncScheduler,
  MonoTypeOperatorFunction,
  Observable,
  SchedulerLike,
  Subscription,
} from 'rxjs';

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
