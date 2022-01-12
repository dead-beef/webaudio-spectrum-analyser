import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FrequencyUnitsPipe } from '../../pipes/frequency-units/frequency-units.pipe';
import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { AnalyserFunctionValueComponent } from './analyser-function-value.component';

describe('AnalyserFunctionValueComponent', () => {
  let component: AnalyserFunctionValueComponent;
  let fixture: ComponentFixture<AnalyserFunctionValueComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: getComponentImports(),
        declarations: [
          AnalyserFunctionValueComponent,
          UnitsPipe,
          FrequencyUnitsPipe,
        ],
        providers: getMockProviders(),
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AnalyserFunctionValueComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
