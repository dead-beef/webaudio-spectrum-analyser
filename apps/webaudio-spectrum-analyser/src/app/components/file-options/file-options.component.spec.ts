import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileOptionsComponent } from './file-options.component';

describe('FileOptionsComponent', () => {
  let component: FileOptionsComponent;
  let fixture: ComponentFixture<FileOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileOptionsComponent ]
    })
    .compileComponents();
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
