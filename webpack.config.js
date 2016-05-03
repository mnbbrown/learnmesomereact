const genConf = require('./webpack.js');

const production = process.env.NODE_ENV === 'production';

module.exports = genConf({
    debug: false,
    production: production
});
