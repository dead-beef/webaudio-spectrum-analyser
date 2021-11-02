import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { CanvasComponent } from '../canvas/canvas.component';
import { SpectrogramComponent } from './spectrogram.component';

describe('SpectrogramComponent', () => {
  let component: SpectrogramComponent;
  let fixture: ComponentFixture<SpectrogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [SpectrogramComponent, CanvasComponent, UnitsPipe],
      providers: getMockProviders(),
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectrogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
