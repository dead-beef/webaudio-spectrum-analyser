import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { InputRangeComponent } from '../input-range/input-range.component';
import { GraphOptionsComponent } from './graph-options.component';

describe('GraphOptionsComponent', () => {
  let component: GraphOptionsComponent;
  let fixture: ComponentFixture<GraphOptionsComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: getComponentImports(),
        declarations: [
          GraphOptionsComponent,
          UnitsPipe,
          InputFrequencyComponent,
          InputRangeComponent,
        ],
        providers: getMockProviders(),
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(GraphOptionsComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
