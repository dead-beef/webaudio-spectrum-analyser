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
      let timeout: Subscription = null;
      let hasNext = false;
      let next: T = null;

      const reset = () => {
        if (timeout !== null) {
          timeout.unsubscribe();
          timeout = null;
        }
        hasNext = false;
        next = null;
      };

      return source.subscribe({
        next(value: T) {
          if (timeout === null) {
            hasNext = false;
            next = null;
            observer.next(value);
            timeout = scheduler.schedule(() => {
              timeout = null;
              if (hasNext) {
                observer.next(next);
                hasNext = false;
                next = null;
              }
            }, duration);
          } else {
            hasNext = true;
            next = value;
          }
        },
        error(err) {
          reset();
          observer.error(err);
        },
        complete() {
          reset();
          observer.complete();
        },
      });
    });
}
