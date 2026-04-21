const { join } = require('path');

/**
 * Merge defaults provided by Nest CLI with tsconfig-paths plugin so that
 * webpack can resolve the @libs/* aliases used across apps.
 */
module.exports = (options) => {
  const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

  return {
    ...options,
    resolve: {
      ...options.resolve,
      plugins: [
        ...(options.resolve?.plugins ?? []),
        new TsconfigPathsPlugin({
          configFile: join(__dirname, 'tsconfig.json'),
        }),
      ],
    },
  };
};
