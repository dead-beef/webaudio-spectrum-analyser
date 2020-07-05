import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { Observable } from 'rxjs';

import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AlertComponent } from '../alert/alert.component';
import { DeviceOptionsComponent } from './device-options.component';

describe('DeviceOptionsComponent', () => {
  let component: DeviceOptionsComponent;
  let fixture: ComponentFixture<DeviceOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, ReactiveFormsModule, ClarityModule],
      declarations: [DeviceOptionsComponent, AlertComponent],
      providers: [
        {
          provide: AudioGraphService,
          useValue: {
            graph: {
              setDevice: (...args) => Promise.resolve(),
              getDevices: (...args) => [],
            },
            setSourceNode: (...args) => Observable.create(o => o.complete()),
          },
        },
      ],
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
