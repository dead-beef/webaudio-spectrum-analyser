import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';

import { SafeUrlPipe } from '../../pipes/safe-url/safe-url.pipe';
import { AlertComponent } from '../alert/alert.component';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';
import { FileOptionsComponent } from './file-options.component';

describe('FileOptionsComponent', () => {
  let component: FileOptionsComponent;
  let fixture: ComponentFixture<FileOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [ClarityModule],
      declarations: [
        FileOptionsComponent,
        AlertComponent,
        AudioControlsComponent,
        SafeUrlPipe,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
