import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll,
  shareReplay,
} from "rxjs/operators";
import { merge, fromEvent, Observable, concat } from "rxjs";
import { Lesson } from "../model/lesson";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const courseId = this.route.snapshot.params["id"];
    this.course$ = createHttpObservable(`/api/courses/${courseId}`);
    this.lessons$ = createHttpObservable(
      `/api/lessons?courseId=${courseId}&pageSize=100`
    ).pipe(map((res) => res["payload"]));
  }

  ngAfterViewInit() {
    fromEvent<any>(this.input.nativeElement, "keyup")
      .pipe(
        map((event) => event.target.value),
        // using debounceTime here to check if the obtained input has been stable for 400 ms, if the obtained input is not stable for 400 ms then that observable will be terminated
        // only the input which has been stable for 400 ms or greater are going to pass to the next step after debounceTime
        debounceTime(400),
        // this also eliminates duplicates, if two consecutive values are same then we want to emit only one value
        distinctUntilChanged()
      )
      .subscribe(console.log);
  }
}
