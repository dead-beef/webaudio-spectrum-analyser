import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { InputRangeComponent } from '../input-range/input-range.component';
import { FilterOptionsComponent } from './filter-options.component';

describe('FilterOptionsComponent', () => {
  let component: FilterOptionsComponent;
  let fixture: ComponentFixture<FilterOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [
        FilterOptionsComponent,
        UnitsPipe,
        ErrorPipe,
        InputFrequencyComponent,
        InputRangeComponent,
      ],
      providers: getMockProviders(),
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FilterOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
