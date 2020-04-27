const Controller = require('../controller');
const Comment = require('app/models/comment');

module.exports = new class commentController extends Controller {
    async index(req, res , next) { // next for error handeling
        try {
            let page = req.query.page || 1;
            let comments = await Comment.paginate({ approved: true } , { page , sort: { createdAt: -1 } , limit: 20 ,
                populate:[
                    { path: 'user' , select: 'name' },
                    { path: 'course' },
                    { 
                        path: 'episode', 
                        populate : [
                            {
                                path : 'course',
                                select : 'slug'
                            }
                        ] 
                    }
                ]
            });

            res.render('admin/comments/index', {
                title: "Admin Comments",
                comments
            }); // render ejs file in /resource/views
        } catch (err) {
            next(err); // for pass this err to errorHandler middleware to show err
        }
    }

    async destroy(req, res, next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let comment = await Comment.findById(req.params.id);

            if(!comment) {
                this.error('This comment not exist' , 404);
            }

            // delete comment
            comment.remove();

            return this.back(req, res); 
        } catch (err) {
            next(err);
        }
    }

    async approved(req, res, next) {
        try {
            let page = req.query.page || 1;
            let comments = await Comment.paginate({ approved: false} , { page , sort: { createdAt: -1 } , limit: 20 ,
                populate:[
                    { path: 'user' , select: 'name' },
                    { path: 'course' },
                    { 
                        path: 'episode', 
                        populate : [
                            {
                                path : 'course',
                                select : 'slug'
                            }
                        ] 
                    }
                ]
            });

            res.render('admin/comments/approved', {
                title: "Admin Not Approved Comments",
                comments
            }); // render ejs file in /resource/views
        } catch (err) {
            next(err); // for pass this err to errorHandler middleware to show err
        }
    }

    async update(req, res, next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let comment = await Comment.findById(req.params.id).populate('belongTo').exec();

            if(!comment) {
                this.error('This comment not exist' , 404);
            }

            await comment.belongTo.inc('commentCount'); // increase commentCount in episode or course

            // update comment model
            comment.approved = true;
            await comment.save();

            return this.back(req, res);
        } catch (err) {
            next(err);
        }
    }
}