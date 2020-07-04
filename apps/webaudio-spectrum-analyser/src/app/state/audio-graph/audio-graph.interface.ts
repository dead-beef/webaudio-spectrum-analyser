import { Observable } from 'rxjs';

import { IActionPayload } from '../../utils/ngxs.util';

export interface IAudioGraphStateModel {
  paused: boolean;
  suspended: boolean;
}

export type AudioGraphPayload = IActionPayload<Partial<IAudioGraphStateModel>>;

export interface IAudioGraphService {
  state$: Observable<IAudioGraphStateModel>;
  paused$: Observable<boolean>;
  suspended$: Observable<boolean>;
}
