import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

import { AudioGraphSourceNode } from '../../interfaces';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { AudioGraphState } from '../../state/audio-graph/audio-graph.store';
import { stateFormControl } from '../../utils/ngxs.util';

@UntilDestroy()
@Component({
  selector: 'app-device-options',
  templateUrl: './device-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceOptionsComponent implements OnInit {
  private readonly destroyed$ = untilDestroyed(this);

  public loading = true;

  public error: Error = null;

  public devices: MediaDeviceInfo[] = [];

  public readonly device: FormControl = new FormControl();

  public readonly form: FormGroup = new FormGroup({ device: this.device });

  public readonly disabled$ = this.device.statusChanges.pipe(
    map(status => status === 'DISABLED')
  );

  /**
   * Constructor.
   * @param graphService
   */
  constructor(private readonly graph: AudioGraphService) {
    stateFormControl(
      this.device,
      this.graph.select(AudioGraphState.deviceId),
      (id: string) => this.setDeviceId(id),
      this.destroyed$
    );
  }

  /**
   * Device setter.
   */
  public setDeviceId(dev: string): Observable<void> {
    this.device.disable();
    return this.graph.dispatch('setDeviceId', dev).pipe(
      tap(
        () => {
          this.error = null;
        },
        err => {
          this.error = err;
          this.device.setValue(null);
        }
      ),
      finalize(() => {
        this.device.enable();
      })
    );
  }

  /**
   * Lifecycle hook.
   */
  public ngOnInit() {
    void this.graph
      .dispatch('setSourceNode', AudioGraphSourceNode.DEVICE)
      .subscribe(() => this.refresh());
  }

  /**
   * Refreshes device options.
   */
  public refresh() {
    this.device.disable();
    this.graph
      .getDevices()
      .then(devices => {
        this.devices = devices;
        this.error = null;
        const id = this.device.value;
        if (id) {
          const found = this.devices.some(dev => dev.deviceId === id);
          if (!found) {
            this.device.setValue(null);
          }
        }
      })
      .catch(err => {
        console.log('error');
        this.error = err;
      })
      .finally(() => {
        console.log('finally');
        this.device.enable();
      });
  }
}
