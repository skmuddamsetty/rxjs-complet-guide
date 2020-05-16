import { Component, OnInit } from "@angular/core";
import { Course } from "../model/course";
import { interval, Observable, of, timer, noop, throwError } from "rxjs";
import {
  catchError,
  delayWhen,
  map,
  retryWhen,
  shareReplay,
  tap,
  finalize,
} from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnersCourses: Course[];
  advancedCourses: Course[];
  beginnersCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;
  constructor() {}

  ngOnInit() {
    const http$ = createHttpObservable("/api/courses");
    // // transforming the response of /api/courses observable to courses observable using the map operator
    // // using pipe to chain the map operator
    // // this is the imperative approach using subscribe
    // // we need to avoid using subscribe as we would quickly end up in call back hell
    // // and it is Rxjs anti-pattern
    // const courses$ = http$.pipe(map((res) => Object.values(res["payload"])));
    // courses$.subscribe(
    //   (courses) => {
    //     console.log(courses);
    //     this.beginnersCourses = courses.filter(
    //       (course) => course.category === "BEGINNER"
    //     );
    //     this.advancedCourses = courses.filter(
    //       (course) => course.category === "ADVANCED"
    //     );
    //   },
    //   // (err) => console.log(err),
    //   // or if we do not have any error handling in the observable
    //   // () => {} or noop(),
    //   // noop stands for no operation and is similar to writing () => {}
    //   noop(),
    //   () => console.log("http stream completed!")
    // );

    // Rxjs Reactive approach to populate the beginner and advanced courses
    const courses$: Observable<Course[]> = http$.pipe(
      // with this move we make sure that if the service errors out we are not proceeding down the observable chain and the observable is terminated hete itself.
      // now we do not see multiple console.log which are in this error block for multiple subscriptions
      catchError((err) => {
        console.log("Error Occurred", err);
        // throwError method will create one observable that errors out immediately with the passed in error without emitting any value
        return throwError(err);
      }),
      finalize(() => {
        console.log("finalize method in course$!");
      }),
      // using tap operator to produce side effects outside of the observable chain
      // here we are logging something to the console and inside tap we can do anything. but this does not effect the observable chain
      tap(() => console.log("Http Request Executed!")),
      map((res) => Object.values(res["payload"])),
      // using shareReplay to avoid multiple network calls which occurs due to multiple subscriptions
      shareReplay(),
      // ************************* Catching errors 3 strategies *****************
      // Recovering from error with some other values example
      // example of providing an alternative observable in case if the backend service throws an error
      // i.e. here we are trying to recover from the error by providing some alternate value to the course$
      // catchError((err) => of([]))
      // ************** catch and rethrow error handling strategy************
      // Note: Since we are using two observables which are derived from course$. each time the course$ is subscribed using the async pipe in html.
      // with this we will see two error statements in the console one for beginnerCourses$ and one for advancedCourses$.
      // if this is not intended behaviour we have to move the catch block up the observable chain
      // moving the below block up to the observable chain to overcome the issue given above
      // catchError((err) => {
      //   console.log("Error Occurred", err);
      //   // throwError method will create one observable that errors out immediately with the passed in error without emitting any value
      //   return throwError(err);
      // }),
      // finalize is invoked one of two cases i.e when an observable succssfuly completes or when an observable errors out
      // moving the finalize up the observable chain for the same reason of catchError. please check catchError block comments
      // finalize(() => {
      //   console.log("finalize method in course$!");
      // })
      // **************************** retry strategy***************************
      // errors property inside retryWhen is obtained each time when there is an error from the service
      // when the http call fails and errors out the http$ will be terminated, but retyrWhen will cerate a brand new observable and subscibes to the new observable and it does that untill the stream does not error out
      // with the below statement it retries immediately
      // retryWhen((errors) => errors),
      // with the below statement it retries after two seconds
      retryWhen((errors) => errors.pipe(delayWhen(() => timer(2000))))
    );

    this.beginnersCourses$ = courses$.pipe(
      map((courses) =>
        courses.filter((course) => course.category === "BEGINNER")
      )
    );
    this.advancedCourses$ = courses$.pipe(
      map((courses) =>
        courses.filter((course) => course.category === "ADVANCED")
      )
    );
  }
}
