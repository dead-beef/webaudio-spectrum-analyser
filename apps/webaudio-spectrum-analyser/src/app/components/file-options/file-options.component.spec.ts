import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { SafeUrlPipe } from '../../pipes/safe-url/safe-url.pipe';
import { TimePipe } from '../../pipes/time/time.pipe';
import {
  getComponentImports,
  getMockProviders,
  mockComponent,
} from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';
import { FileOptionsComponent } from './file-options.component';

describe('FileOptionsComponent', () => {
  let component: FileOptionsComponent;
  let fixture: ComponentFixture<FileOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [
        FileOptionsComponent,
        AlertComponent,
        SafeUrlPipe,
        TimePipe,
        ErrorPipe,
        AudioControlsComponent,
        mockComponent('audio', {
          nativeElement: {
            play: () => null,
            pause: () => null,
          },
        }),
      ],
      providers: getMockProviders(),
    }).compileComponents();
    fixture = TestBed.createComponent(FileOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
