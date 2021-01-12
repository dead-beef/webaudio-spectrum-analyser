module.exports = function webpackConfig(config) {
  //console.log('webpack config resolve', config.resolve);
  //console.log('webpack config rules', config.module.rules);
  const path = require('path');
  const dev = config.mode === 'development';
  const libDir = path.join(__dirname, 'libs/wasm');
  config.resolve.extensions.push('.c', '.cpp');
  config.module.rules.push(
    {
      test: /\.c(?:pp)?$/,
      use: [
        {
          loader: 'cpp-wasm-loader',
          options: {
            emccPath: 'emcc',
            emccFlags: [
              '-O2',
              '-I',
              libDir,
              '-s',
              'EXTRA_EXPORTED_RUNTIME_METHODS=[\'ccall\',\'cwrap\']',
              '-s',
              'WASM=1',
            ],
            memoryClass: true,
            fetchFiles: false,
            asmJs: false,
            wasm: true,
            fullEnv: false
          },
        },
        {
          loader: 'cpp-dependency-loader',
          options: {
            emccPath: 'emcc',
            emccFlags: [
              '-I',
              libDir,
            ],
          },
        },
      ],
    }
  );
  return config;
};
