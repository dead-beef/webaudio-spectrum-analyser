import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
