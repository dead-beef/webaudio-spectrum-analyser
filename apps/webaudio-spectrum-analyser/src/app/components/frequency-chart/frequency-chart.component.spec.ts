import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { AnalyserFunctionValuesComponent } from '../analyser-function-values/analyser-function-values.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { FrequencyChartComponent } from './frequency-chart.component';

describe('FrequencyChartComponent', () => {
  let component: FrequencyChartComponent;
  let fixture: ComponentFixture<FrequencyChartComponent>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [
        FrequencyChartComponent,
        CanvasComponent,
        UnitsPipe,
        AnalyserFunctionValuesComponent,
      ],
      providers: getMockProviders(),
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FrequencyChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
