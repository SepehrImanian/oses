require('app-module-path').addPath(__dirname); // root project is app/.....
const App = require('./app/index.js');
require('dotenv').config();
global.config = require('./config');

new App();