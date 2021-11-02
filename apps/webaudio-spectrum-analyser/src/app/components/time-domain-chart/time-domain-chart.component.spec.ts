import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { AnalyserFunctionValuesComponent } from '../analyser-function-values/analyser-function-values.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { TimeDomainChartComponent } from './time-domain-chart.component';

describe('TimeDomainChartComponent', () => {
  let component: TimeDomainChartComponent;
  let fixture: ComponentFixture<TimeDomainChartComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: getComponentImports(),
        declarations: [
          TimeDomainChartComponent,
          CanvasComponent,
          UnitsPipe,
          AnalyserFunctionValuesComponent,
        ],
        providers: getMockProviders(),
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(TimeDomainChartComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
