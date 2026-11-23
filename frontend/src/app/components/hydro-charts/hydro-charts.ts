
import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { StationSeries } from '../../services/series';

@Component({
  selector: 'app-hydro-charts',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './hydro-charts.html',
  styleUrl: './hydro-charts.scss',
})
export class HydroCharts implements OnChanges {
  @Input() levelSeries: StationSeries | null = null;
  @Input() rainSeries: StationSeries | null = null;

  // Configuração dos dados do gráfico de nível do rio
  levelChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Nível do rio',
        data: [],
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  // Configuração visual do gráfico de nível do rio
  levelChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Nível (m)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Horário',
        },
      },
    },
  };

  // Configuração dos dados do gráfico de chuva
  rainChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Chuva',
        data: [],
        borderColor: '#0d9488',
        backgroundColor: 'rgba(13, 148, 136, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  // Configuração visual do gráfico de chuva
  rainChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Chuva (mm/h)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Horário',
        },
      },
    },
  };

  // Atualiza os gráficos quando os dados recebidos mudam
  ngOnChanges(): void {
    if (this.levelSeries) {
      this.levelChartData = {
        labels: this.levelSeries.points.map((point) =>
          new Date(point.observed_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        ),
        datasets: [
          {
            label: 'Nível do rio',
            data: this.levelSeries.points.map((point) => point.value),
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      };
    }

    if (this.rainSeries) {
      this.rainChartData = {
        labels: this.rainSeries.points.map((point) =>
          new Date(point.observed_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        ),
        datasets: [
          {
            label: 'Chuva',
            data: this.rainSeries.points.map((point) => point.value),
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      };
    }
  }
}
