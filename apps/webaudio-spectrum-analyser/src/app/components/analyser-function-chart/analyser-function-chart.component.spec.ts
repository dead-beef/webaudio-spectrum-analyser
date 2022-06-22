import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { CanvasComponent } from '../canvas/canvas.component';
import { AnalyserFunctionChartComponent } from './analyser-function-chart.component';

describe('FunctionChartComponent', () => {
  let component: AnalyserFunctionChartComponent;
  let fixture: ComponentFixture<AnalyserFunctionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [
        AnalyserFunctionChartComponent,
        CanvasComponent,
        UnitsPipe,
      ],
      providers: getMockProviders(),
    }).compileComponents();
    fixture = TestBed.createComponent(AnalyserFunctionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
