import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { CanvasComponent } from '../canvas/canvas.component';
import { CepstrumChartComponent } from './cepstrum-chart.component';

describe('CepstrumChartComponent', () => {
  let component: CepstrumChartComponent;
  let fixture: ComponentFixture<CepstrumChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [CepstrumChartComponent, CanvasComponent],
      providers: getMockProviders(),
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CepstrumChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
