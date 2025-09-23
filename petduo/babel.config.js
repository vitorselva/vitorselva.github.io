module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@app': './app',
            '@src': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@providers': './src/providers',
            '@lib': './src/lib',
            '@hooks': './src/hooks',
            '@types': './src/types'
          }
        }
      ]
    ]
  };
};

