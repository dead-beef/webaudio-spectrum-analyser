import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { InputRangeComponent } from '../input-range/input-range.component';
import { AnalyserOptionsComponent } from './analyser-options.component';

describe('AnalyserOptionsComponent', () => {
  let component: AnalyserOptionsComponent;
  let fixture: ComponentFixture<AnalyserOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [
        AnalyserOptionsComponent,
        InputFrequencyComponent,
        InputRangeComponent,
      ],
      providers: getMockProviders(),
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AnalyserOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
