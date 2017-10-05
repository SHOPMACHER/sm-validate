const join = require('path').join;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: join(__dirname, '../src'),
    entry: [
        './index'
    ],
    output: {
        filename: 'validate.js',
        library: 'validate',
        libraryTarget: 'umd',
        path: join(__dirname, '../lib')
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader'
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new ExtractTextWebpackPlugin('validate.css')
    ]
};
