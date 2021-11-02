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
import { ColorService } from '../../services/color/color.service';
import { hoverPoints, updateCanvasSize } from '../../utils';

@UntilDestroy()
@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') public canvas: Nullable<ElementRef<HTMLCanvasElement>> =
    null;

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
  constructor(private readonly color: ColorService) {}

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
      css = `top: ${(point.y * 100).toFixed(2)}%;
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
  public getSize(): void {
    if (this.canvas !== null) {
      this.size.width = this.canvas.nativeElement.clientWidth;
      this.size.height = this.canvas.nativeElement.clientHeight;
    }
  }

  /**
   * TODO: description
   */
  public setSize(width: number, height: number): void {
    if (this.canvas !== null) {
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
    }
  }

  /**
   * TODO: description
   */
  public clear(): void {
    if (this.context !== null) {
      this.context.clearRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
    }
  }

  /**
   * TODO: description
   */
  public shift(x: number, y: number): void {
    if (this.context !== null) {
      this.context.drawImage(this.context.canvas, x, y);
    }
  }

  /**
   * TODO: description
   */
  public hline(y: number, color = 'grid', lineWidth = 2) {
    const ctx = this.context;
    if (ctx === null) {
      return;
    }
    y = ctx.canvas.height * (1 - y);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = this.color.get(color);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  public vline(x: number, color = 'grid', lineWidth = 2) {
    const ctx = this.context;
    if (ctx === null) {
      return;
    }
    x = ctx.canvas.width * x;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = this.color.get(color);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  public log(
    x0: number,
    x1: number,
    xscale: (x: number) => number = x => x,
    horizontal = true,
    color = 'grid',
    lineWidth = 2
  ) {
    const ctx = this.context;
    if (ctx === null) {
      return;
    }
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    let pow = Math.floor(Math.log10(x0));
    let dx = Math.pow(10, pow);
    let xnext = Math.pow(10, pow + 1);
    let xprev = Math.pow(10, pow - 1);
    let x = x0;
    let line: (x: number) => void;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = this.color.get(color);
    ctx.beginPath();
    if (horizontal) {
      line = (x_: number) => {
        x_ = w * xscale(x_);
        ctx.moveTo(x_, 0);
        ctx.lineTo(x_, h);
      };
    } else {
      line = (y: number) => {
        y = h * (1 - xscale(y));
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      };
    }
    while (x <= x1) {
      line(x);
      x += dx;
      if (xnext - x < xprev) {
        x = xnext;
        ++pow;
        xprev = dx;
        dx = xnext;
        xnext = Math.pow(10, pow + 1);
      }
    }
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  public plot<T extends TypedArray>(
    data: T,
    xscale: (x: number, i: number) => number = (x, i) => x,
    yscale: (y: number) => number = y => y,
    color = 'chart',
    lineWidth = 2
  ): void {
    const ctx = this.context;
    if (ctx === null) {
      return;
    }

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iscale = 1 / (data.length - 1);
    let line = false;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = this.color.get(color);
    ctx.beginPath();
    for (let i = 0; i < data.length; ++i) {
      if (isNaN(data[i])) {
        line = false;
        continue;
      }
      const x = w * xscale(i * iscale, i);
      const y = h * (1 - yscale(data[i]));
      if (!line) {
        ctx.moveTo(x, y);
        line = true;
      } else if (data[i] !== data[i - 1] || data[i] !== data[i + 1]) {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  /**
   * TODO: description
   */
  public step<T extends TypedArray>(
    data: T,
    xscale: (x: number, i: number) => number = (x, i) => x,
    yscale: (y: number) => number = y => y,
    color = 'chart',
    lineWidth = 2
  ): void {
    const ctx = this.context;
    if (ctx === null) {
      return;
    }

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const iscale = 1 / (data.length - 1);

    ctx.lineWidth = lineWidth;
    if (lineWidth > 0) {
      ctx.strokeStyle = this.color.get(color);
    } else {
      ctx.fillStyle = this.color.get(color);
    }
    ctx.beginPath();
    let prevX = w * xscale(0, 0);
    let prevY = h;
    ctx.moveTo(prevX, prevY);
    for (let i = 0; i < data.length; ++i) {
      if (data[i] === data[i - 1] && data[i] === data[i + 1]) {
        continue;
      }
      const x = w * xscale(i * iscale, i);
      const y = h * (1 - yscale(data[i]));
      ctx.lineTo(x, prevY);
      ctx.lineTo(x, y);
      prevX = x;
      prevY = y;
    }
    const x = w * xscale(data.length * iscale, data.length);
    ctx.lineTo(x, prevY);
    ctx.lineTo(x, h);
    ctx.lineTo(0, h);
    if (lineWidth > 0) {
      ctx.stroke();
    } else {
      ctx.fill();
    }
  }
}
