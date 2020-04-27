const Controller = require('../controller');
const Course = require('app/models/course');
const Episode = require('app/models/episode');

module.exports = new class episodeController extends Controller {
    async index(req, res , next) { // next for error handeling
        try {
            let page = req.query.page || 1;
            let episodes = await Episode.paginate({} , { page , sort: { createdAt: -1 } , limit: 4 }); // use pagination instead of find
            // return res.json(courses);
            res.render('admin/episodes/index', {
                title: "Admin Episodes",
                episodes
            }); // render ejs file in /resource/views
        } catch (err) {
            next(err); // for pass this err to errorHandler middleware to show err
        }
    }

    async create(req , res , next) {
        // try {
            let courses = await Course.find({});
            res.render('admin/episodes/create', {
                title: "Create Episode",
                courses
            }); // render ejs file in /resource/views
        // } catch (err) {
        //     next(err);
        // }
    }

    async store(req, res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                return this.back(req, res);
            }
            // create episode
            let newEpisode = new Episode({ ...req.body });
            await newEpisode.save();

            // update course time (sum of all episode time)
            this.updateCourseTime(req.body.course); //return id course in episode

            return res.redirect('/admin/episodes');
        } catch (err) {
            throw new Error(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let episode = await Episode.findById(req.params.id);

            if(!episode) {
                this.error('This episode not exist' , 404);
            }
    
            // return courseid from episode (this episode for which course)
            //return id course in episode
            let courseId = episode.course; 
            
            // delete course
            episode.remove();

            // course time update
            this.updateCourseTime(courseId);

            return res.redirect('/admin/episodes');
        } catch (err) {
            next(err);
        }
    }

    async edit(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let episode = await Episode.findById(req.params.id);
            let courses = await Course.find({});

            if(!episode) {
                this.error('This episode not exist' , 404);
            }

            return res.render('admin/episodes/edit' , { episode , courses });
        } catch (err) {
            next(err);
        }
    }

    async update(req , res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                return this.back(req, res);
            }

            // update course
            //"episode" means before update return data beacuse of that means last data
            let episode = await Episode.findByIdAndUpdate(req.params.id , { $set: { ...req.body }});
            
            // prev course time update
            this.updateCourseTime(episode.course); // "episode.course" return last course id
            // now,new course time update
            this.updateCourseTime(req.body.course); // "req.body.course" return now course id

            // redirect back
            return res.redirect('/admin/episodes');
        } catch (err) {
            next(err);
        }
    }

    async updateCourseTime(courseId) {
        let course = await Course.findById(courseId).populate('episodes').exec();

        course.set({ time: this.getTime(course.episodes) }); // this is for update data in db exactly like $set
        await course.save();
    }
}