import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SplashScreen } from '@capacitor/splash-screen';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.log('platform', environment.platform);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => {
    console.error(err);
    document.body.textContent = String(err);
  })
  .finally(() => {
    //if (environment.platform !== 'web') {
    void SplashScreen.hide();
    //}
  });
