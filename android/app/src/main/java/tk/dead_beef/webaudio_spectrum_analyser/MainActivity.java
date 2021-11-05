package tk.dead_beef.webaudio_spectrum_analyser;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import com.capacitorjs.plugins.splashscreen.SplashScreenPlugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(SplashScreenPlugin.class);
    }});

    //registerPlugins(new ArrayList<Class<? extends Plugin>>() {{
    //  add(SplashScreenPlugin.class);
    //}});

    //registerPlugin(SplashScreenPlugin.class);
  }
}
