import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { UiOptionsComponent } from './ui-options.component';

describe('UiOptionsComponent', () => {
  let component: UiOptionsComponent;
  let fixture: ComponentFixture<UiOptionsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: getComponentImports(),
        declarations: [UiOptionsComponent],
        providers: getMockProviders(),
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(UiOptionsComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UiOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
