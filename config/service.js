module.exports = {
    recaptcha: {
        site_key: process.env.RECAPTCHA_SITE_KEY,
        secret_key: process.env.RECAPTCHA_SECRET_KEY
    },
    google: {
        site_key: process.env.GOOGLE_SITE_KEY,
        secret_key: process.env.GOOGLE_SECRET_KEY,
        callback_url: process.env.GOOGLE_CALLBACKURL
    }
}