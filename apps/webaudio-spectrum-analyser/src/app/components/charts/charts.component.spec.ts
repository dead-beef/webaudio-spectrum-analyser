import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { AudioGraphUiStoreModule } from '../../state/audio-graph-ui/audio-graph-ui.module';
import { mockComponent } from '../../utils/test.util';
import { ChartComponent } from '../chart/chart.component';
import { ChartsComponent } from './charts.component';

describe('ChartsComponent', () => {
  let component: ChartsComponent;
  let fixture: ComponentFixture<ChartsComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([]),
          AudioGraphUiStoreModule,
          CommonModule,
          ClarityModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          ChartsComponent,
          ChartComponent,
          mockComponent('app-frequency-chart'),
          mockComponent('app-time-domain-chart'),
        ],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ChartsComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
