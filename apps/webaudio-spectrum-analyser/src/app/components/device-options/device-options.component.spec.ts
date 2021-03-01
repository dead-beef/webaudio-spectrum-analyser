import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { DeviceOptionsComponent } from './device-options.component';

describe('DeviceOptionsComponent', () => {
  let component: DeviceOptionsComponent;
  let fixture: ComponentFixture<DeviceOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [DeviceOptionsComponent, AlertComponent, ErrorPipe],
      providers: getMockProviders(),
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
