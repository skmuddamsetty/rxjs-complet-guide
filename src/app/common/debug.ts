import { tap } from "rxjs/operators";
import { Observable } from "rxjs";

// creating a higher order function i.e a function that returns a function
export const debug = (level: number, message: string) => (
  source: Observable<any>
) =>
  source.pipe(
    tap((val) => {
      console.log(message + ":" + val);
    })
  );
