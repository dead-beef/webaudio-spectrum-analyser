import { NgModule, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class StatsModule {
  // @ts-ignore
  private stats = new Stats();
  private update = this._update.bind(this);

  constructor(private zone: NgZone) {
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
