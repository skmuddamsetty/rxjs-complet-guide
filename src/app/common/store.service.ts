import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject, Subject, timer, throwError } from "rxjs";
import { Course } from "../model/course";
import { createHttpObservable } from "./util";
import {
  retryWhen,
  delayWhen,
  shareReplay,
  map,
  tap,
  finalize,
  catchError,
} from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";

@Injectable({ providedIn: "root" })
export class Store {
  private subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();
  constructor(private http: HttpClient) {
    console.log("Store Created!");
  }

  init() {
    const http$ = createHttpObservable("/api/courses");
    // Rxjs Reactive approach to populate the beginner and advanced courses
    http$
      .pipe(
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
        map((res) => Object.values(res["payload"]))
        // using shareReplay to avoid multiple network calls which occurs due to multiple subscriptions
        // shareReplay is not useful here because the observable we are defiining here will not be shared outside of the observable
        //   shareReplay(),
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
        //   retryWhen((errors) => errors.pipe(delayWhen(() => timer(2000))))
      )
      .subscribe((courses) => this.subject.next(courses));
  }

  selectBeginnerCourses(): Observable<Course[]> {
    return this.filterByCategory("BEGINNER");
  }

  selectAdvancedCourses(): Observable<Course[]> {
    return this.filterByCategory("ADVANCED");
  }

  filterByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses) => courses.filter((course) => course.category === category))
    );
  }

  saveCourse(courseId: number, changes: Partial<Course>): Observable<any> {
    const courses = this.subject.getValue();
    const courseIndex = courses.findIndex((course) => course.id == courseId);
    const newCourses = courses.slice(0);
    newCourses[courseIndex] = { ...courses[courseIndex], ...changes };
    this.subject.next(newCourses);
    return fromPromise(
      fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(changes),
        headers: {
          "content-type": "application/json",
        },
      })
    );
  }
}
