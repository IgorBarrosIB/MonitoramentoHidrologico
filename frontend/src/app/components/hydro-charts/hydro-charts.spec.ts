import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HydroCharts } from './hydro-charts';

describe('HydroCharts', () => {
  let component: HydroCharts;
  let fixture: ComponentFixture<HydroCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HydroCharts],
    }).compileComponents();

    fixture = TestBed.createComponent(HydroCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
