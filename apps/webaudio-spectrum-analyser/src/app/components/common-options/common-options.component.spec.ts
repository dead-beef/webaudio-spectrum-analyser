import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { CommonOptionsComponent } from './common-options.component';

describe('CommonOptionsComponent', () => {
  let component: CommonOptionsComponent;
  let fixture: ComponentFixture<CommonOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [ClarityModule],
      declarations: [CommonOptionsComponent, UnitsPipe],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CommonOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
