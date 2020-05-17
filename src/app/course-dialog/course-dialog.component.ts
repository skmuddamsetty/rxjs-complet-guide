import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Course } from "../model/course";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from "moment";
import { fromEvent } from "rxjs";
import {
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  filter,
  mergeMap,
} from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";
import { Store } from "../common/store.service";

@Component({
  selector: "course-dialog",
  templateUrl: "./course-dialog.component.html",
  styleUrls: ["./course-dialog.component.css"],
})
export class CourseDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  course: Course;

  @ViewChild("saveButton", { static: true }) saveButton: ElementRef;

  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course,
    private store: Store
  ) {
    this.course = course;

    this.form = fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required],
    });
  }

  ngOnInit() {
    this.form.valueChanges
      .pipe(
        // filter is like a wall and this proceeds to the next step only if this statement is valid
        filter(() => this.form.valid),
        // using concatMap
        // for every incoming changes we are creating a saveCourse observable and going to concatenate all those observables so that save operations are sequential i.e. one after the other
        // here we do not need to subscribe because the subscription is automatically taken care by the concatMap operator
        // simply put --> contactMap creates new observables, subscribes to them and concatenates them together
        // if the order of the observables is important we have to use concatMap
        concatMap((changes) => this.saveCourse(changes))
        // *************************************************
        // mergeMap is useful for making the asynchronous calls in parallel
        // this emits the value from the multiple observables as they arrive, that is this is not sequential
        // mergeMap automatically subscribes
        // if the order of the observables is not important we have can use mergMap to execute the calls parallely
        // mergeMap((changes) => this.saveCourse(changes))
      )
      // subscribing to the form changes
      .subscribe();
    //   // ***************************************************************
    //   .subscribe((formChanges) => {
    //     // fecth is going to return promise here
    //     // and we want to convert this promise to observable using fromPromise
    //     const saveCourse$ = fromPromise(
    //       fetch(`/api/courses/${this.course.id}`, {
    //         method: "PUT",
    //         body: JSON.stringify(formChanges),
    //         headers: {
    //           "content-type": "application/json",
    //         },
    //       })
    //         .then(() => {})
    //         .catch((err) => console.log(err))
    //     );
    //     // in this pattern we are subscribing inside a subscribe call which is what we want to avoid as it is rxjs anti-pattern
    //     // with this we are going to issue save operations to db with every change on the edit form which is not ideal
    //     // ideally we have to wait for the previously issued call to complete and then send the next call, therefore we need observable concatenation logic
    //     saveCourse$.subscribe();
    //   });
  }

  ngAfterViewInit() {
    // stream of clicks
    fromEvent(this.saveButton.nativeElement, "click")
      // using exhaustMap here to make sure that repeated clicks on save button do not trigger http requests while a request is still ongoing
      // in other words if there are other observables initiated while one observable is running all ther other source observables are ignored and are never executed
      .pipe(exhaustMap(() => this.saveCourse(this.form.value)))
      .subscribe();
  }

  close() {
    this.dialogRef.close();
  }

  saveCourse(changes) {
    return fromPromise(
      fetch(`/api/courses/${this.course.id}`, {
        method: "PUT",
        body: JSON.stringify(changes),
        headers: {
          "content-type": "application/json",
        },
      })
    );
  }

  save_to_store() {
    this.store.saveCourse(this.course.id, this.form.value).subscribe(
      () => this.close(),
      (err) => console.log("Error Saving Course!", err)
    );
  }
}
