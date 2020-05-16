import { tap } from "rxjs/operators";
import { Observable } from "rxjs";

export enum RxJsLoggingLevel {
  TRACE,
  DEBUG,
  INFO,
  ERROR,
}

let rxjsLoggingLevel = RxJsLoggingLevel.INFO;

export function setRxJsLoggingLevel(level: RxJsLoggingLevel) {
  rxjsLoggingLevel = level;
}

// creating a higher order function i.e a function that returns a function
export const debug = (level: number, message: string) => (
  source: Observable<any>
) =>
  source.pipe(
    tap((val) => {
      if (level >= rxjsLoggingLevel) {
        console.log(message + " from debug operator:", val);
      }
    })
  );
