import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        declarations: [CanvasComponent],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(CanvasComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
