import { CommonModule } from '@angular/common';
import { NgModule, NgZone } from '@angular/core';

import { Stats } from '../../interfaces';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class StatsModule {
  private readonly stats: Stats = new Stats();

  private readonly updateBound = this.update.bind(this);

  /**
   * Constructor.
   * @param zone
   */
  constructor(private readonly zone: NgZone) {
    this.stats.dom.classList.add('stats');
    document.body.appendChild(this.stats.dom);
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(this.updateBound);
    });
  }

  /**
   * TODO: description
   */
  public update() {
    this.stats.update();
    requestAnimationFrame(this.updateBound);
  }
}
