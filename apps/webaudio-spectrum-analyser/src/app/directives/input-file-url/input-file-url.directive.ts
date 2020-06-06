import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { FileData } from '../../interfaces';

@Directive({
  selector: '[inputFileUrl]',
})
export class InputFileUrlDirective implements OnInit, OnDestroy {
  @Output() public readonly fileLoad = new EventEmitter<FileData>();

  @Output() public readonly fileError = new EventEmitter<Error>();

  private readonly loadFileBound = this.loadFile.bind(this);

  private readonly id: string = `input-file-${Math.floor(Math.random() * 1e6)}`;

  /**
   * Constructor.
   * @param dom
   */
  constructor(private readonly dom: ElementRef) {}

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    this.dom.nativeElement.addEventListener('click', this.loadFileBound);
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.destroyInput();
    this.dom.nativeElement.removeEventListener('click', this.loadFileBound);
  }

  /**
   * TODO: description
   */
  public destroyInput() {
    const input: HTMLInputElement = document.getElementById(this.id) as HTMLInputElement;
    if (Boolean(input)) {
      input.remove();
    }
  }

  /**
   * TODO: description
   */
  public createInput(): HTMLInputElement {
    this.destroyInput();
    const input: HTMLInputElement = document.createElement('input');
    input.id = this.id;
    input.type = 'file';
    input.addEventListener('input', this.doLoadFile.bind(this));
    document.body.appendChild(input);
    return input;
  }

  /**
   * TODO: description
   * @param el
   */
  public click(el: HTMLElement) {
    // iframe
    //el.click();
    const ev = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: false,
    });
    el.dispatchEvent(ev);
  }

  /**
   * TODO: description
   */
  public loadFile() {
    try {
      const input: HTMLInputElement = this.createInput();
      this.click(input);
    } catch (err) {
      this.fileError.emit(err);
    }
  }

  /**
   * TODO: description
   * @param ev
   */
  public doLoadFile(ev: InputEvent) {
    let input: HTMLInputElement = ev.target as HTMLInputElement;
    try {
      if (!input.files) {
        throw new Error('Input does not have a "files" property');
      }
      if (!input.files[0]) {
        return;
      }
      const url: string = URL.createObjectURL(input.files[0]);
      this.fileLoad.emit({
        name: input.files[0].name,
        url: url,
      });
    } catch (err) {
      this.fileError.emit(err);
    } finally {
      input.remove();
      input = null;
    }
  }
}
