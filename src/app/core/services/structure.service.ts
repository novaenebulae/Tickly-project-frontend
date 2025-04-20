import { StructureCreationResponse } from './../models/StructureCreationResponse.interface';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StructureService {
  http = inject(HttpClient);
  apiUrl = 'http://localhost:8080/api';

  createStructure(
    structureValues: StructureDto
  ): Observable<StructureCreationResponse> {
    console.log(structureValues);
    return this.http.post<StructureCreationResponse>(
      `${this.apiUrl}/structures/create-structure`,
      structureValues
    );
  }

  getStructureTypes(): Observable<StructureType[]> {
    return this.http.get<StructureType[]>(`${this.apiUrl}/structure-types`);
  }
}


