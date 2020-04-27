const Controller = require('./controller');
const Course = require('app/models/course');
const Comment = require('app/models/comment');
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const rss = require('rss');

module.exports = new class homeController extends Controller {
    async index(req , res) {
        let courses = await Course.find({}).sort({ createdAt: -1 }).limit(4).exec();
        res.render('home/index' , { courses });
       
    }

    async about(req , res) {
        res.render('home/about');
    }

    async comment(req , res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                return this.back(req, res);
            }

            let newComment = new Comment({
                user: req.user.id,
                ...req.body
            });

            await newComment.save();

            return this.back(req , res);

        } catch (err) {
            next(err);
        }
    }

    async sitemap(req , res , next) {
        try {
            let sitemap;
            res.header('Content-Type', 'application/xml');
            res.header('Content-Encoding', 'gzip');

            if (sitemap) {
                return res.send(sitemap);
            }

            const smStream = new SitemapStream({ hostname: config.host });
            const pipeline = smStream.pipe(createGzip());

            smStream.write({ url: '/',  changefreq: 'daily', priority: 1 });
            smStream.write({ url: '/courses',  changefreq: 'monthly',  priority: 1 });
            smStream.end();

            streamToPromise(pipeline).then(sm => sitemap = sm);
            pipeline.pipe(res).on('error', (e) => { throw e });

        } catch (err) {
            next(err);
        }
    }

    // async feedCourses(req , res , next) {
    //     try {
    //         let feed = new rss({
    //             title: 'title',
    //             description: 'description',
    //             feed_url: 'http://example.com/rss.xml',
    //         });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    // async feedEpisodes(req , res , next) {
    //     try {
            
    //     } catch (err) {
    //         next(err);
    //     }
    // }
}


/*
    comments.ejs explain script:
    for get parent id from 'data-parent="<%= comment.id %>"' and put this in '<input type="hidden" name="parent" value="">' 
*/
