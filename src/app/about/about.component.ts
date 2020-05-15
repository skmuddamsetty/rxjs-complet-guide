import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { interval, timer, fromEvent, Observable, noop } from "rxjs";
import { map } from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // // click events stream
    // document.addEventListener("click", (e) => {
    //   console.log(e);
    // });
    // // counter stream example with setInterval
    // let counter = 0;
    // setInterval(() => {
    //   console.log(counter);
    //   counter++;
    // }, 1000);
    // // setTimeOut Stream
    // setTimeout(() => {
    //   console.log("Timeout elapsed!");
    // }, 3000);
    // ************************************************************************
    // // combining stream example
    // // but this creates a call back hell as we are nesting
    // // to avoid this call back hell we use RxJS to avoid call back hell when combining streams
    // document.addEventListener("click", (e) => {
    //   console.log(e);
    //   setTimeout(() => {
    //     console.log("Timeout elapsed!, starting counter in one second!");
    //     let counter = 0;
    //     setInterval(() => {
    //       console.log(counter);
    //       counter++;
    //     }, 1000);
    //   }, 3000);
    // });
    // **********************************************************************
    // interval$ is not a value but it is a definition of stream of values
    // it is simply blue print for how the stream will behave if we instantiate
    // const interval$ = interval(1000);
    // // using subscribe method to create a stream of values from the interval$
    // interval$.subscribe((val) => console.log(`Stream 1 ${val}`));
    // interval$.subscribe((val) => console.log(`Stream 2 ${val}`));
    // **********************************************************************
    // // creating a timer observable with initial delay of 3 seconds
    // const timer$ = timer(3000, 1000);
    // timer$.subscribe((val) => console.log(`Timer 1 ${val}`));
    // **********************************************************************
    // // timer and interval Observable never enters into complete block so we have to unsubscribe
    // const timer$ = timer(3000, 1000);
    // // using subscribe method to create a stream of values from the interval$
    // const sub = timer$.subscribe(
    //   (val) => console.log(`timer 1 ${val}`),
    //   (err) => console.log(err),
    //   () => console.log("timer observable completed!")
    // );
    // setTimeout(() => {
    //   sub.unsubscribe();
    // }, 5000);
    // // // creating a click events stream using RxJs using the fromEvent
    // const click$ = fromEvent(document, "click");
    // click$.subscribe(
    //   // if the subscription fails, then we are guranteed that the below error block makes sure that the observable is terminated
    //   (e) => console.log(e),
    //   // if the observable errors out it is not going to execute the complete block and this terminates the observable chain
    //   (err) => console.log(err),
    //   // this is executed once the event has been completed and the observable is terminated
    //   () => console.log("completed!")
    // );
    // using browser fetch API, fetch returns a promise so this will be immediately executed, so we do not want this to be executed immediately and we want to convert this to an observable
    // fetch("/api/courses")
    //   .then((res) => res.json())
    //   .then((body) => body)
    //   .then((data) => console.log(data));
    // using Observable.create API to create the observable
    // ************************************************************************
    // Moving this logic to home component
    // const http$ = createHttpObservable("/api/courses");
    // // transforming the response of /api/courses observable to courses observable using the map operator
    // // using pipe to chain the map operator
    // const courses$ = http$.pipe(map((res) => Object.values(res["payload"])));
    // courses$.subscribe(
    //   (courses) => console.log(courses),
    //   // (err) => console.log(err),
    //   // or if we do not have any error handling in the observable
    //   // () => {} or noop(),
    //   // noop stands for no operation and is similar to writing () => {}
    //   noop(),
    //   () => console.log("http stream completed!")
    // );
  }
}
