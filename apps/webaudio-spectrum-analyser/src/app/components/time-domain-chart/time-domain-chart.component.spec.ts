import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { CanvasComponent } from '../canvas/canvas.component';
import { TimeDomainChartComponent } from './time-domain-chart.component';

describe('TimeDomainChartComponent', () => {
  let component: TimeDomainChartComponent;
  let fixture: ComponentFixture<TimeDomainChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [TimeDomainChartComponent, CanvasComponent, UnitsPipe],
      providers: getMockProviders(),
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeDomainChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
