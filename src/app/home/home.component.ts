import { Component, OnInit } from "@angular/core";
import { Course } from "../model/course";
import { interval, Observable, of, timer, noop } from "rxjs";
import {
  catchError,
  delayWhen,
  map,
  retryWhen,
  shareReplay,
  tap,
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
      // using tap operator to produce side effects outside of the observable chain
      // here we are logging something to the console and inside tap we can do anything. but this does not effect the observable chain
      tap(() => console.log("Http Request Executed!")),
      map((res) => Object.values(res["payload"])),
      // using shareReplay to avoid multiple network calls which occurs due to multiple subscriptions
      shareReplay()
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
