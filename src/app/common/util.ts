import { Observable } from "rxjs";

export function createHttpObservable(url: string) {
  return Observable.create((observer) => {
    // observer here helps us to emit new values, error out the observable or complete the observable
    fetch(url)
      .then((res) => res.json())
      .then((body) => {
        // using next we are setting the data to the http stream
        observer.next(body);
        // by calling complete we have terminated the http stream
        observer.complete();
      })
      // catching fatal errors such as dns errors or network down errors
      .catch((err) => {
        // sending the error in case of error
        observer.error(err);
      });
  });
}
