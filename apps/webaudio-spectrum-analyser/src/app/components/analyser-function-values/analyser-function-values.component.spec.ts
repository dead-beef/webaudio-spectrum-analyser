import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { AnalyserFunctionValuesComponent } from './analyser-function-values.component';

describe('AnalyserFunctionValuesComponent', () => {
  let component: AnalyserFunctionValuesComponent;
  let fixture: ComponentFixture<AnalyserFunctionValuesComponent>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [AnalyserFunctionValuesComponent, UnitsPipe],
      providers: getMockProviders(),
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AnalyserFunctionValuesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
