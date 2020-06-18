import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioGraphComponent } from './audio-graph.component';

describe('AudioGraphComponent', () => {
  let component: AudioGraphComponent;
  let fixture: ComponentFixture<AudioGraphComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [AudioGraphComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
