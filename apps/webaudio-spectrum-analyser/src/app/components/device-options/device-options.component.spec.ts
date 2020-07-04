import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';

import { AlertComponent } from '../alert/alert.component';
import { DeviceOptionsComponent } from './device-options.component';

describe('DeviceOptionsComponent', () => {
  let component: DeviceOptionsComponent;
  let fixture: ComponentFixture<DeviceOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [ClarityModule],
      declarations: [DeviceOptionsComponent, AlertComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
