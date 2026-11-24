
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Measurement {
  value: number;
  unit: string;
  observed_at: string;
}

export interface StationSummary {
  station: {
    id: string;
    name: string;
    river: string;
    municipality: string;
  };
  latest: {
    level?: Measurement;
    rain?: Measurement;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private http = inject(HttpClient);

  getSummary(stationId: string): Observable<StationSummary> {
    return this.http.get<StationSummary>(
      `/api/stations/${stationId}/summary/`
    );
  }
}
