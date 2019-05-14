var path = require('path');

// const MinifyPlugin = require("babel-minify-webpack-plugin");
const UglifyEsPlugin = require('uglify-es-webpack-plugin');

module.exports = {
  entry: {
    main: './app-main.js'
  },
  output: {
    filename: 'app-[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
  // 		new MinifyPlugin({}, {})
  ],
  optimization: {
    minimizer: [
	    new UglifyEsPlugin({
		    mangle: {
		        reserved: [
		            'Buffer',
		            'BigInteger',
		            'Point',
		            'ECPubKey',
		            'ECKey',
		            'sha512_asm',
		            'asm',
		            'ECPair',
		            'HDNode'
		        ]
		    }
		})
  	],
  },
  module: {
  	rules: [
	    {
	      test: /\.m?(js|jsx)$/,
	      exclude: /(node_modules|bower_components)/,
	      use: {
	        loader: 'babel-loader',
	        options: {
	          presets: [
	          	['@babel/preset-env', {
	          		"targets": {
			          "node": true
			        }
	          	}]
	          ],
	          plugins: ['@babel/plugin-transform-react-jsx']
	        }
	      }
	    }
 		]
	},
	target: 'web'
};