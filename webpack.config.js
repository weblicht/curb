path = require('path');

module.exports = {
    entry: './src/index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'germanet-common.js',
        library: 'germanet-common',
        libraryTarget: 'umd'
    },

    resolve: {
        extensions: ['.js', '.jsx']
    },

    module: {
        rules: [
            {   test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                include: path.join(__dirname, 'src')
            }
        ]
    },

    externals: {
        react: {
            commonjs: 'react',
            commonjs2: 'react'
        },
        'react-redux': {
            commonjs: 'react-redux',
            commonjs2: 'react-redux'
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom'
        },
        redux: {
            commonjs: 'redux',
            commonjs2: 'redux'
        }
    }
}
