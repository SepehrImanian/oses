const database = require('./database');
const session = require('./session');
const layout = require('./layout');
const service = require('./service');

module.exports = {
    database,
    session,
    layout,
    service,
    port: process.env.APPLICATION_PORT,
    cookie_secretkey: process.env.COOKIE_SECRET_KEY,
    debug: true,
    host: process.env.HOST,
    jwt: {
        secret_key: 'ashdu^&+*-@!#(&3n03##@@$$%opiud8!)&^)Z89u34@*()#$!&k;cfk*@^&@)(!&^#gkdy+syk*@^*389jdjl()@'
    }
}