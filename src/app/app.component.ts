import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DistanceComponent } from "./components/Distance.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DistanceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ag-grid-demo';
}
