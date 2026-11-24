import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SeriesPoint {
  observed_at: string;
  value: number;
}

export interface StationSeries {
  station: string;
  metric: string;
  hours: number;
  unit: string | null;
  points: SeriesPoint[];
}

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  private http = inject(HttpClient);

  getSeries(
    stationId: string,
    metric: 'level' | 'rain',
    hours: number
  ): Observable<StationSeries> {
    return this.http.get<StationSeries>(
      `/api/stations/${stationId}/series/?metric=${metric}&hours=${hours}`
    );
  }
}