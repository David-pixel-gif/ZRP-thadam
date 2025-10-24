const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        https: require.resolve("https-browserify"),
        http: require.resolve("stream-http"), // ✅ new
        constants: require.resolve("constants-browserify"),
        assert: require.resolve("assert/"),
        util: require.resolve("util/"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );

      return config;
    },
  },
};
