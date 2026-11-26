
import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';

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
  private seriesSubscription?: Subscription;

  stations: Station[] = [];

  selectedStationId: string | null = null;
  selectedHours = 24;
  selectedDate = '';
  maxDate = '';
  startHour = 0;
  endHour = 23;
  readonly hourOptions = Array.from({ length: 24 }, (_, hour) => hour);

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

        // O calendário não deixa escolher dias depois da última leitura
        const latest = data.latest.level ?? data.latest.rain;
        this.maxDate = latest ? this.toDateInput(latest.observed_at) : '';

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

    // Cancela a requisição anterior para uma resposta antiga não sobrescrever a nova
    this.seriesSubscription?.unsubscribe();

    this.seriesLoading = true;

    this.levelSeries = null;
    this.rainSeries = null;

    const stationId = this.selectedStationId;
    const range = this.selectedDate ? this.dayRange(this.selectedDate) : null;

    const request = (metric: 'level' | 'rain') =>
      range
        ? this.seriesService.getSeriesBetween(stationId, metric, range.start, range.end)
        : this.seriesService.getSeries(stationId, metric, this.selectedHours);

    // Carrega nível e chuva juntos: os gráficos só aparecem quando as duas séries chegam
    this.seriesSubscription = forkJoin({
      level: request('level'),
      rain: request('rain'),
    }).subscribe({
      next: ({ level, rain }) => {
        this.levelSeries = level;
        this.rainSeries = rain;
        this.seriesLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao carregar séries:', err);
        this.error = 'Não foi possível carregar o histórico.';
        this.seriesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  changePeriod(hours: number): void {
    this.selectedHours = hours;
    this.selectedDate = '';
    this.loadSeries();
  }

  // Data escolhida no calendário (formato yyyy-MM-dd); vazio volta ao filtro por horas
  changeDate(date: string): void {
    this.selectedDate = date;
    this.loadSeries();
  }

  // Faixa de horas dentro do dia escolhido; se o início passar do fim, os dois viram a mesma hora
  // Soma das leituras horárias (mm/h) do período filtrado = chuva acumulada em mm
  rainTotal(): number {
    return (this.rainSeries?.points ?? []).reduce((sum, point) => sum + point.value, 0);
  }

  // Mínimo, máximo e variação (última - primeira leitura) do nível no período filtrado
  levelStats(): { min: number; max: number; change: number } | null {
    const values = (this.levelSeries?.points ?? []).map((point) => point.value);
    if (values.length === 0) {
      return null;
    }
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      change: values[values.length - 1] - values[0],
    };
  }

  // Descreve o filtro ativo, ex.: "nas últimas 24 horas" ou "em 26/11, das 06:00 às 08:00"
  periodLabel(): string {
    if (!this.selectedDate) {
      return `nas últimas ${this.selectedHours} horas`;
    }
    const [year, month, day] = this.selectedDate.split('-');
    const pad = (hour: number) => `${String(hour).padStart(2, '0')}:00`;
    const hours =
      this.startHour === 0 && this.endHour === 23
        ? ''
        : `, das ${pad(this.startHour)} às ${pad(this.endHour)}`;
    return `em ${day}/${month}/${year}${hours}`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Sem data escolhida, a faixa de horas vale para o dia da última leitura
  changeStartHour(hour: number): void {
    this.startHour = hour;
    this.endHour = Math.max(this.endHour, hour);
    this.selectedDate ||= this.maxDate;
    this.loadSeries();
  }

  changeEndHour(hour: number): void {
    this.endHour = hour;
    this.startHour = Math.min(this.startHour, hour);
    this.selectedDate ||= this.maxDate;
    this.loadSeries();
  }

  clearDate(): void {
    this.startHour = 0;
    this.endHour = 23;
    this.changeDate('');
  }

  // Da hora inicial até o fim da hora final (inclui a leitura da hora final), no fuso de quem usa a tela
  private dayRange(date: string): { start: Date; end: Date } {
    const [year, month, day] = date.split('-').map(Number);
    return {
      start: new Date(year, month - 1, day, this.startHour),
      end: new Date(year, month - 1, day, this.endHour + 1),
    };
  }

  // Converte uma data ISO no texto yyyy-MM-dd do dia local (usado no limite do calendário)
  private toDateInput(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
