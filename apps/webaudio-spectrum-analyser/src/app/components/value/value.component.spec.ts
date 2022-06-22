import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyUnitsPipe } from '../../pipes/frequency-units/frequency-units.pipe';
import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { ValueComponent } from './value.component';

describe('ValueComponent', () => {
  let component: ValueComponent;
  let fixture: ComponentFixture<ValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [ValueComponent, UnitsPipe, FrequencyUnitsPipe],
      providers: getMockProviders(),
    }).compileComponents();
    fixture = TestBed.createComponent(ValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
