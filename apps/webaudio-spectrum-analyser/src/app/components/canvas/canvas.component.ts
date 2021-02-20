import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';

import { Point, Size } from '../../interfaces';
import { hoverPoints, updateCanvasSize } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') public canvas: Nullable<
    ElementRef<HTMLCanvasElement>
  > = null;

  //@Input() public contextType = '2d';

  @Input() public pointStyle = 'line-v';

  //@Input() public point: Nullable<Point> = null;

  @Output() public readonly pointChange = new EventEmitter<Nullable<Point>>();

  public context: Nullable<CanvasRenderingContext2D> = null;

  public readonly size: Size = {
    width: 1,
    height: 1,
  };

  private readonly pointCss = new BehaviorSubject<Nullable<string>>(null);

  public readonly pointCss$ = this.pointCss.asObservable();

  /**
   * Constructor.
   */
  constructor() {}

  /**
   * Lifecycle hook.
   */
  public ngAfterViewInit(): void {
    const canvas = this.canvas!.nativeElement;
    this.context = canvas.getContext('2d' /*this.contextType*/);
    void hoverPoints(canvas, untilDestroyed(this)).subscribe((p: Point) => {
      p.x = Math.max(0, Math.min(1, p.x / canvas.clientWidth));
      p.y = Math.max(0, Math.min(1, p.y / canvas.clientHeight));
      this.setPoint(p);
    });
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy(): void {
    this.context = null;
    this.pointCss.complete();
  }

  /**
   * TODO: description
   */
  public setPoint(point: Nullable<Point>) {
    let css: Nullable<string> = null;
    if (point) {
      css = `top: ${(point.y * 100).toFixed(2)}$;
left: ${(point.x * 100).toFixed(2)}%`;
    }
    this.pointCss.next(css);
    this.pointChange.emit(point);
  }

  /**
   * TODO: description
   */
  public updateSize(): boolean {
    return updateCanvasSize(this.canvas?.nativeElement, this.size);
  }

  /**
   * TODO: description
   */
  public clear(): void {
    if (this.context !== null) {
      this.context.clearRect(0, 0, this.size.width, this.size.height);
    }
  }
}
