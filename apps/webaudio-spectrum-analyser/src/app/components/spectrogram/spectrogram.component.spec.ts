import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { CanvasComponent } from '../canvas/canvas.component';
import { SpectrogramComponent } from './spectrogram.component';

describe('SpectrogramComponent', () => {
  let component: SpectrogramComponent;
  let fixture: ComponentFixture<SpectrogramComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: getComponentImports(),
        declarations: [SpectrogramComponent, CanvasComponent, UnitsPipe],
        providers: getMockProviders(),
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(SpectrogramComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
