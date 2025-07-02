import { HttpClient } from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {UserStructureService} from '../../../../../core/services/domain/user-structure/user-structure.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private userStructureService = inject(UserStructureService);

  ngOnInit(): void {
    this.userStructureService.loadUserStructure(true);
    this.userStructureService.loadUserStructureAreas(true);
  }

}
