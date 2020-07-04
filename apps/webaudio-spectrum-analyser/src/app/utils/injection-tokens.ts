import { InjectionToken } from '@angular/core';

import { environment } from '../../environments/environment';

export const WINDOW = new InjectionToken<Window>('Window');

export const APP_ENV = new InjectionToken<typeof environment>('APP_ENV');
