
module.exports = {
  entry: __dirname + "/client/src/index.jsx",
  output: {
    filename: 'bundle.js',
    path: __dirname + '/client/dist/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [ 
          { 
            loader: "babel-loader",
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          }],
      }, 
      {
        test: /\.css$/,
        use: [{loader: 'style-loader'}, 
        {loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          localIdentName: '[sha1:hash:hex:6]',
        },}],
      }
    ]
  },
};
