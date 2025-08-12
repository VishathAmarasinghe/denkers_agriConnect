module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
