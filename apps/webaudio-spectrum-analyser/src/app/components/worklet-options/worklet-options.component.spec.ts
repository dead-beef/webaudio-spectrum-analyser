import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { WorkletOptionsComponent } from './worklet-options.component';

describe('WorkletOptionsComponent', () => {
  let component: WorkletOptionsComponent;
  let fixture: ComponentFixture<WorkletOptionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [WorkletOptionsComponent, AlertComponent, ErrorPipe],
      providers: getMockProviders(),
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(WorkletOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
