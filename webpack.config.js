module.exports = function webpackConfig(config) {
  //console.log('webpack config resolve', config.resolve);
  //console.log('webpack config rules', config.module.rules);
  const dev = config.mode === 'development';
  config.resolve.extensions.push('.c', '.cpp');
  config.module.rules.push(
    {
      test: /\.c(?:pp)?$/,
      use: {
        loader: 'cpp-wasm-loader',
        options: {
          emccPath: 'emcc',
          emccFlags: (flags, mode) => {
            console.log('emcc flags', flags, mode);
            flags = flags.filter(flag => !/^-O/.test(flag));
            flags.push('-O2');
            /*flags.push(
              '-s', 'EXTRA_EXPORTED_RUNTIME_METHODS=[\'ccall\',\'cwrap\']'
            );*/
            console.log(flags);
            return flags;
          },
          memoryClass: true,
          fetchFiles: false,
          asmJs: true,
          wasm: true,
          fullEnv: false
        },
      },
    }
  );
  return config;
};
