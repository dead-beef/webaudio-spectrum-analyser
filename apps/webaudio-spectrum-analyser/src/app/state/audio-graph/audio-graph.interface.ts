//import { Observable } from 'rxjs';

import { IActionPayload } from '../../utils/ngxs.util';

export interface AudioGraphStateModel {
  paused: boolean;
  suspended: boolean;
}

export type AudioGraphPayload = IActionPayload<Partial<AudioGraphStateModel>>;

/*export interface AudioGraphService {
  state$: Observable<IAudioGraphStateModel>;
  paused$: Observable<boolean>;
  suspended$: Observable<boolean>;
}*/
