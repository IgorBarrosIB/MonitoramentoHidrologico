import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Station {
  id: string;
  name: string;
  river: string;
  municipality: string;
}

@Injectable({
  providedIn: 'root',
})
export class StationService {
  private http = inject(HttpClient);
  private apiUrl = '/api/stations/';

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(this.apiUrl);
  }
}