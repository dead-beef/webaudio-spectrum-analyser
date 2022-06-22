import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SplashScreen } from '@capacitor/splash-screen';

import { appLoad } from './app/app.load';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.log('platform', environment.platform);

appLoad()
  .then(providers => {
    return platformBrowserDynamic(providers).bootstrapModule(AppModule);
  })
  .catch(err => {
    console.error(err);
    document.body.textContent = String(err);
  })
  .finally(() => {
    //if (environment.platform !== 'web') {
    void SplashScreen.hide();
    //}
  });
