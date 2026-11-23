
import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { StationService, Station } from './services/station';
import { SummaryService, StationSummary } from './services/summary';
import { SeriesService, StationSeries } from './services/series';
import { HydroCharts } from './components/hydro-charts/hydro-charts';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HydroCharts],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {

  private stationService = inject(StationService);
  private summaryService = inject(SummaryService);
  private seriesService = inject(SeriesService);
  private cdr = inject(ChangeDetectorRef);

  stations: Station[] = [];

  selectedStationId: string | null = null;
  selectedHours = 24;

  summary: StationSummary | null = null;

  levelSeries: StationSeries | null = null;
  rainSeries: StationSeries | null = null;

  loading = true;
  seriesLoading = false;
  error = '';

  ngOnInit(): void {
    this.loadStations();
  }

  loadStations(): void {
    this.loading = true;
    this.error = '';

    this.stationService.getStations().subscribe({
      next: (data) => {
        this.stations = data;
        this.loading = false;

        if (this.stations.length > 0) {
          this.selectStation(this.stations[0].id);
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao carregar estações:', err);
        this.error = 'Não foi possível carregar as estações.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectStation(stationId: string): void {
    console.log('Estação selecionada:', stationId);

    this.selectedStationId = stationId;

    this.summary = null;
    this.levelSeries = null;
    this.rainSeries = null;

    this.error = '';

    this.summaryService.getSummary(stationId).subscribe({
      next: (data) => {
        console.log('Resumo recebido:', data);

        this.summary = data;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao carregar resumo:', err);
        this.error = 'Não foi possível carregar as medições.';
        this.cdr.detectChanges();
      },
    });

    this.loadSeries();
  }

  loadSeries(): void {
    if (!this.selectedStationId) {
      return;
    }

    this.seriesLoading = true;

    this.levelSeries = null;
    this.rainSeries = null;

    const stationId = this.selectedStationId;
    const hours = this.selectedHours;

    // Carrega a série histórica do nível do rio
    this.seriesService.getSeries(stationId, 'level', hours).subscribe({
      next: (data) => {
        console.log('Série de nível recebida:', data);

        this.levelSeries = data;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao carregar série do nível:', err);
        this.cdr.detectChanges();
      },
    });

    // Carrega a série histórica de chuva
    this.seriesService.getSeries(stationId, 'rain', hours).subscribe({
      next: (data) => {
        console.log('Série de chuva recebida:', data);

        this.rainSeries = data;
        this.seriesLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao carregar série de chuva:', err);

        this.seriesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  changePeriod(hours: number): void {
    this.selectedHours = hours;
    this.loadSeries();
  }
}
