const nodemailer = require('nodemailer');

/*
    email config => can be our server or another(mailtrap)
*/

// mail smtp config (our server or another) => this config for "https://mailtrap.io" after register
let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for 465, false for other ports
    auth: {
        user: '85a43731faa888',
        pass: 'cd5914867db65b'
    }
});

module.exports = transport;