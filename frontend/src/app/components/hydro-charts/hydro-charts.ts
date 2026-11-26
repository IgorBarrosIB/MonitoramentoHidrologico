
import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { SeriesPoint, StationSeries } from '../../services/series';

const LEVEL_COLOR = '#0284c7';
const RAIN_COLOR = '#0d9488';
const GRID_COLOR = 'rgba(148, 163, 184, 0.25)';
const AXIS_TEXT = '#64748b';

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
  // Quando o filtro é um único dia, o eixo X mostra só a hora; senão, dia + hora
  @Input() singleDay = false;

  levelChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  rainChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  // Resumo exibido acima de cada gráfico
  levelMin: number | null = null;
  levelMax: number | null = null;
  rainTotal = 0;
  private levelAxisRange: { min: number; max: number } | null = null;
  rainHours = 0;

  // Configuração visual do gráfico de nível do rio
  levelChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    // Tooltip aparece ao passar o mouse em qualquer ponto da coluna, não só em cima do ponto
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => this.tooltipTitle(this.levelSeries, items),
          label: (item) => ` Nível: ${this.formatNumber(item.parsed.y ?? 0)} m`,
        },
      },
    },
    scales: {
      y: {
        // Sem começar em zero: a variação do nível é pequena e sumiria no gráfico
        grace: '10%',
        title: { display: true, text: 'Nível (m)', color: AXIS_TEXT },
        ticks: { color: AXIS_TEXT, callback: (value) => this.formatNumber(Number(value)) },
        grid: { color: GRID_COLOR },
        border: { display: false },
      },
      x: {
        title: { display: true, text: 'Data e hora', color: AXIS_TEXT },
        ticks: { color: AXIS_TEXT, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { display: false },
      },
    },
  };

  // Configuração visual do gráfico de chuva
  rainChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => this.tooltipTitle(this.rainSeries, items),
          label: (item) => ` Chuva: ${this.formatNumber(item.parsed.y ?? 0)} mm/h`,
        },
      },
    },
    scales: {
      y: {
        // Chuva nunca é negativa e zero significa "não choveu": o eixo começa no zero
        beginAtZero: true,
        title: { display: true, text: 'Chuva (mm/h)', color: AXIS_TEXT },
        ticks: { color: AXIS_TEXT, callback: (value) => this.formatNumber(Number(value)) },
        grid: { color: GRID_COLOR },
        border: { display: false },
      },
      x: {
        title: { display: true, text: 'Data e hora', color: AXIS_TEXT },
        ticks: { color: AXIS_TEXT, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
        grid: { display: false },
      },
    },
  };

  // Atualiza os gráficos quando os dados recebidos mudam
  ngOnChanges(): void {
    if (this.levelSeries) {
      const points = this.levelSeries.points;
      const values = points.map((point) => point.value);

      this.levelMin = values.length ? Math.min(...values) : null;
      this.levelMax = values.length ? Math.max(...values) : null;
      this.levelAxisRange = this.minimumLevelRange(this.levelMin, this.levelMax);

      this.levelChartData = {
        labels: this.labels(points),
        datasets: [
          {
            label: 'Nível do rio',
            data: values,
            borderColor: LEVEL_COLOR,
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            borderWidth: 2,
            fill: 'start',
            // "monotone" não inventa picos/vales entre as leituras, ao contrário da curva padrão
            cubicInterpolationMode: 'monotone',
            // Com poucas leituras (ex.: filtro de 1 ou 2 horas), mostra cada ponto medido
            pointRadius: points.length <= 24 ? 3 : 0,
            pointHoverRadius: 5,
            pointHitRadius: 10,
          },
        ],
      };
    }

    if (this.rainSeries) {
      const points = this.rainSeries.points;
      const values = points.map((point) => point.value);

      // Leituras horárias em mm/h: somar as horas dá o acumulado em mm
      this.rainTotal = values.reduce((sum, value) => sum + value, 0);
      this.rainHours = values.filter((value) => value > 0).length;

      this.rainChartData = {
        labels: this.labels(points),
        datasets: [
          {
            label: 'Chuva',
            data: values,
            backgroundColor: RAIN_COLOR,
            hoverBackgroundColor: '#0f766e',
            borderRadius: { topLeft: 4, topRight: 4 },
            borderSkipped: 'bottom',
            categoryPercentage: 0.9,
            barPercentage: 0.9,
          },
        ],
      };
    }

    this.setAxisTitle(this.singleDay ? 'Hora' : 'Data e hora');
  }

  private labels(points: SeriesPoint[]): string[] {
    return points.map((point) => {
      const date = new Date(point.observed_at);
      const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (this.singleDay) {
        return time;
      }
      // Sem o dia, períodos de 48h/72h repetiam o mesmo horário e confundiam a leitura
      const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${day} ${time}`;
    });
  }

  private tooltipTitle(series: StationSeries | null, items: { dataIndex: number }[]): string {
    const point = series?.points[items[0]?.dataIndex ?? -1];
    if (!point) {
      return '';
    }
    return new Date(point.observed_at).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Com variação muito pequena (ex.: 1,11 → 1,12), o Chart.js cria marcas a cada 0,001 m e,
  // com 2 casas decimais, o eixo repetia "1,11 1,11 1,12 1,12". Garante pelo menos 0,10 m de altura
  // e uma folga acima e abaixo, para a linha não ficar colada (cortada) nas bordas do gráfico.
  private minimumLevelRange(min: number | null, max: number | null): { min: number; max: number } | null {
    if (min === null || max === null) {
      return null;
    }
    const padding = Math.max(0.01, (max - min) * 0.1);
    let bottom = min - padding;
    let top = max + padding;
    if (top - bottom < 0.1) {
      const center = (min + max) / 2;
      bottom = center - 0.05;
      top = center + 0.05;
    }
    // Arredonda para fora em centímetros (o toFixed evita erros como 1,035 virar 1,03499…)
    return {
      min: Math.floor(Number((bottom * 100).toFixed(6))) / 100,
      max: Math.ceil(Number((top * 100).toFixed(6))) / 100,
    };
  }

  // Recria as opções para o Chart.js perceber a troca do título do eixo X e da escala do nível
  private setAxisTitle(text: string): void {
    const level = this.levelChartOptions!;
    const rain = this.rainChartOptions!;
    const range = this.levelAxisRange;
    this.levelChartOptions = {
      ...level,
      scales: {
        ...level.scales,
        x: { ...level.scales!['x'], title: { display: true, text, color: AXIS_TEXT } },
        y: {
          ...level.scales!['y'],
          min: range?.min,
          max: range?.max,
          grace: range ? 0 : '10%',
        },
      },
    };
    this.rainChartOptions = {
      ...rain,
      scales: { ...rain.scales, x: { ...rain.scales!['x'], title: { display: true, text, color: AXIS_TEXT } } },
    };
  }
}
