import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';

import { InputFrequencyComponent } from './input-frequency.component';

describe('InputFrequencyComponent', () => {
  let component: InputFrequencyComponent;
  let fixture: ComponentFixture<InputFrequencyComponent>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, ReactiveFormsModule, ClarityModule],
      declarations: [InputFrequencyComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(InputFrequencyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
