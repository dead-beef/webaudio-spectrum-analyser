import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';

@Component({
  selector: 'app-device-options',
  templateUrl: './device-options.component.html',
})
export class DeviceOptionsComponent implements OnInit, OnDestroy {
  @Output() public readonly create = new EventEmitter<void>();

  @Output() public readonly destroy = new EventEmitter<void>();

  public readonly graph: AudioGraph = this.graphService.graph;

  public loading = true;

  public error: Error = null;

  public devices: MediaDeviceInfo[] = [];

  private deviceValue: MediaDeviceInfo = null;

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graphService: AudioGraphService) {}

  /**
   * Device getter.
   */
  public get device(): MediaDeviceInfo {
    return this.deviceValue;
  }

  /**
   * Device setter.
   */
  public set device(dev: MediaDeviceInfo) {
    this.loading = true;
    this.deviceValue = dev;
    if (this.graph) {
      this.graph
        .setDevice(dev)
        .then(() => (this.error = null))
        .catch(err => {
          this.error = err;
          this.deviceValue = null;
        })
        .finally(() => (this.loading = false));
    }
  }

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    this.refresh();
    this.create.emit();
  }

  /**
   * Lifecycle hook.
   */
  public ngOnDestroy() {
    this.destroy.emit();
  }

  /**
   * Refreshes device options.
   */
  public refresh() {
    this.loading = true;
    if (this.graph) {
      this.graph
        .setDevice(null)
        .then(() => {
          this.device = null;
          return this.graph.getDevices();
        })
        .then(devices => {
          this.devices = devices;
          this.error = null;
        })
        .catch(err => (this.error = err))
        .finally(() => (this.loading = false));
    }
  }
}
