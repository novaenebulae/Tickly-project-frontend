import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.showStructures();
  }
  
showStructures() {

  this.http.get<any[]>("http://localhost:8080/api/structures").subscribe({
    next: (data) => console.log(data),
    error: (error) => console.log(error),
  });

}
  
}
