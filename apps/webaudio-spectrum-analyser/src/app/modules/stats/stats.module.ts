import { CommonModule } from '@angular/common';
import { NgModule, NgZone } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class StatsModule {
  // @ts-ignore
  private readonly stats = new Stats();

  private readonly update = this._update.bind(this);

  constructor(private readonly zone: NgZone) {
    this.stats.dom.classList.add('stats');
    document.body.appendChild(this.stats.dom);
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(this.update);
    });
  }

  _update() {
    this.stats.update();
    requestAnimationFrame(this.update);
  }
}
