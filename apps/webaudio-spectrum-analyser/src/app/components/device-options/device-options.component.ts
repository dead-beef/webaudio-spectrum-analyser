import {
  Component, OnInit, OnDestroy,
  Input, Output, EventEmitter
} from '@angular/core';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';

@Component({
  selector: 'device-options',
  templateUrl: './device-options.component.html'
})
export class DeviceOptionsComponent implements OnInit, OnDestroy {

	@Input() graph: AudioGraph;
	@Output() create = new EventEmitter<void>();
	@Output() destroy = new EventEmitter<void>();

	public loading = true;
	public error: Error = null;
	public devices: MediaDeviceInfo[] = [];

	private _device: MediaDeviceInfo = null;
	get device(): MediaDeviceInfo {
		return this._device;
	}
	set device(dev: MediaDeviceInfo) {
		this.loading = true;
		this._device = dev;
		this.graph.setDevice(dev)
			.then(() => this.error = null)
			.catch(err => {
				this.error = err;
				this._device = null;
			})
			.finally(() => this.loading = false);
	}

	constructor() {
	}

	ngOnInit() {
		this.refresh();
		this.create.emit();
	}
	ngOnDestroy() {
		this.destroy.emit();
	}

	refresh() {
		this.loading = true;
		this.graph.setDevice(null)
			.then(() => {
				this.device = null;
				return this.graph.getDevices();
			})
			.then(devices => {
				this.devices = devices;
				this.error = null;
			})
			.catch(err => this.error = err)
			.finally(() => this.loading = false);
	}

}
