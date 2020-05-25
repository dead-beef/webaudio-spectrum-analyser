import {
  Directive, Output, EventEmitter,
  OnInit, OnDestroy, ElementRef
} from '@angular/core';

import { FileData } from '../../interfaces';


@Directive({
  selector: '[inputFileUrl]'
})
export class InputFileUrlDirective implements OnInit, OnDestroy {

  @Output() fileLoad = new EventEmitter<FileData>();
  @Output() fileError = new EventEmitter<Error>();

  private loadFileBound = this.loadFile.bind(this);
  private id: string = 'input-file-' + Math.floor(Math.random() * 1e6);

  constructor(private dom: ElementRef) {
  }

  ngOnInit() {
    this.dom.nativeElement
      .addEventListener('click', this.loadFileBound);
  }

  ngOnDestroy() {
    this.destroyInput();
    this.dom.nativeElement
      .removeEventListener('click', this.loadFileBound);
  }

  destroyInput() {
    const input: HTMLInputElement = <HTMLInputElement>document
      .getElementById(this.id);
    if(input) {
      input.remove();
    }
  }

  createInput(): HTMLInputElement {
    this.destroyInput();
    const input: HTMLInputElement = <HTMLInputElement>document
      .createElement('input');
    input.id = this.id;
    input.type = 'file';
    input.addEventListener('input', this.doLoadFile.bind(this));
    document.body.appendChild(input);
    return input;
  }

  click(el: HTMLElement) {
    // iframe
    //el.click();
    const ev = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: false
    });
    el.dispatchEvent(ev);
  }

  loadFile() {
    try {
      const input: HTMLInputElement = this.createInput();
      this.click(input);
    }
    catch(err) {
      this.fileError.emit(err);
    }
  }

  doLoadFile(ev: InputEvent) {
    let input: HTMLInputElement = <HTMLInputElement>ev.target;
    try {
      if(!input.files) {
        throw new Error('Input does not have a "files" property');
      }
      if(!input.files[0]) {
        return;
      }
      const url: string = URL.createObjectURL(input.files[0]);
      this.fileLoad.emit({
        name: input.files[0].name,
        url: url
      });
    }
    catch(err) {
      this.fileError.emit(err);
    }
    finally {
      input.remove();
      input = null;
    }
  }

}
