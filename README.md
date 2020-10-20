# nodejs_cms

#### This is secure open source online store project with **Admin panel**, **User panel**, **Permission manager**, **Bank connection**, **Email server**, **OAuth** ...  features written with **nodejs + mongodb**.

#### And with complete REST API


-----------------------------------------------

For start project you just need to setup .env file for config *Database*, *Port*, *Google reCAPTCHA* keys and secrets of *Cookie* and *Session*.

### .env file
``` .env
APPLICATION_PORT=80
HOST=http://localhost:80
DATABASE_URL=mongodb://127.0.0.1:27017/newcms

RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

GOOGLE_SITE_KEY=
GOOGLE_SECRET_KEY=
GOOGLE_CALLBACKURL=http://localhost:80/auth/google/callback

SESSION_SECRET_KEY=
COOKIE_SECRET_KEY=
```

And then just **up** the **docker-compose**
```bash
     docker-compose up -d
```
