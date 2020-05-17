import { Component, OnInit } from "@angular/core";
import { Store } from "./common/store.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "app";
  constructor(private store: Store) {
    console.log("App Component Created!");
  }
  ngOnInit() {
    this.store.init();
  }
}
