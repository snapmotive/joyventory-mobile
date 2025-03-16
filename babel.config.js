module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      [
        'react-native-reanimated/plugin', {
          relativeSourceLocation: true,
          globals: ['__scanCodes'],
          disableInlineStylesWarning: true
        }
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@api': './src/api',
            '@lib': './src/lib',
            '@types': './src/types'
          }
        }
      ]
    ],
  };
}; 