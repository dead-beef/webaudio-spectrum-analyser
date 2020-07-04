import { async, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';
import { SimplebarAngularModule } from 'simplebar-angular';

import { AppComponent } from './app.component';
import { AudioGraph } from './classes/audio-graph/audio-graph';
import { AudioGraphStoreModule } from './state/audio-graph/audio-graph.module';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        SimplebarAngularModule,
        NgxsModule.forRoot([]),
        AudioGraphStoreModule,
      ],
      declarations: [AppComponent, AudioGraph],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should have as title 'webaudio-spectrum-analyser'", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('webaudio-spectrum-analyser');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(
      'Welcome to webaudio-spectrum-analyser!'
    );
  });
});
