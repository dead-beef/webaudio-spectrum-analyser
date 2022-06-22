import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getComponentImports, getMockProviders } from '../../utils/test.util';
import { UiOptionsComponent } from './ui-options.component';

describe('UiOptionsComponent', () => {
  let component: UiOptionsComponent;
  let fixture: ComponentFixture<UiOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [UiOptionsComponent],
      providers: getMockProviders(),
    }).compileComponents();
    fixture = TestBed.createComponent(UiOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
