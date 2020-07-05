import { Component, OnInit } from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphSourceNode } from '../../interfaces';

@Component({
  selector: 'app-device-options',
  templateUrl: './device-options.component.html',
})
export class DeviceOptionsComponent implements OnInit {
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
    void this.graphService
      .setSourceNode(AudioGraphSourceNode.DEVICE)
      .subscribe(() => this.refresh());
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
