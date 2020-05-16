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
  courseId: string;
  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params["id"];
    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`);
    // moved the below line to ngAfterViewInit as the lessons$ has to be changed after the user searches for a lesson
    // this.lessons$ = this.loadLessons();
  }

  ngAfterViewInit() {
    const searchLessons$ = fromEvent<any>(
      this.input.nativeElement,
      "keyup"
    ).pipe(
      map((event) => event.target.value),
      // using debounceTime here to check if the obtained input has been stable for 400 ms, if the obtained input is not stable for 400 ms then that observable will be terminated
      // only the input which has been stable for 400 ms or greater are going to pass to the next step after debounceTime
      debounceTime(400),
      // this also eliminates duplicates, if two consecutive values are same then we want to emit only one value
      distinctUntilChanged(),
      // concatMap is not useful here because even with the debounceTime and distinctUntillChanged operators, we might end up in calling database sometimes, when using concatMap all calls are sequential and the ongoing request are not cancelled. here we want to canel the ongoing request if there is a new search term input and switch to the new request
      // concatMap((searchTerm) => this.loadLessons(searchTerm))
      // *****************************************************
      // switchMap helps in cancelling the ongoing requests and switch to the new request which in this case is the search term.
      switchMap((searchTerm) => this.loadLessons(searchTerm)),
      tap((res) => console.log("response from searchLessons$", res))
    );
    const initialLessons$ = this.loadLessons().pipe(
      tap((val) => console.log("response from initialLessons$", val))
    );
    // using concat to concat both the observables
    // here initialLessons$ is going to have an array of lessons and searchLessons$ will be empty
    // and after the user start searching, initialLessons$ is going to be empty and only searchLessons$ will be having the values of lessons
    this.lessons$ = concat(initialLessons$, searchLessons$);
  }

  loadLessons(searchTerm = ""): Observable<Lesson[]> {
    return createHttpObservable(
      `/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${searchTerm}`
    ).pipe(map((res) => res["payload"]));
  }
}
