const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // for master page layout

module.exports = {
    public_dir: 'public',
    view_dir: path.resolve('./resource/views'),
    view_engine: 'ejs',
    i18n_directory: path.resolve('./resource/lang'),
    ejs: {
        expressLayouts,
        extract_scripts: true,
        extract_styles: true,
        master: 'home/master'
    }
}