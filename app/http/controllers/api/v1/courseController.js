const Controller = require('./../controller');
const Course = require('app/models/course');
const Comment = require('app/models/comment');

module.exports = new class courseController extends Controller {
    async courses (req , res) {
        try {
            let page = req.query.page || 1;
            let courses = await Course.paginate({} , { page , sort: { createdAt: -1 } , limit: 12 });

            res.json({
                data: courses,
                status: 'success'
            });
        } catch (err) {
            this.failed(res , err.message);
        }
    }

    async singleCourse (req , res) {
        try {
            let course = await Course
                        .findByIdAndUpdate(req.params.course , { $inc : { viewCount: 1 }})
                        .populate([
                            { path: 'user' , select: 'name' },
                            { path: 'episodes' , options: { sort: { number: 1 } } }
                        ]);

            if(!course) {
                return this.failed(res , 'This course not found' , 404);
            }

            res.json({
                data: course,
                status: 'success'
            });
        } catch (err) {
            this.failed(res , err.message);
        }
    }

    async singleCourseComments(req , res) {
        try {
            let comment = await Comment.find({ course: req.params.course , parent: null , approved: true })
                                .populate([
                                    { path: 'user' , select: 'name' } ,
                                    { 
                                        path: 'comments',
                                        match: {
                                            approved: true
                                        },
                                        populate: { path: 'user' , select: 'name' }
                                    }
                                ]); // comment childs

            if(!comment.length) {
                return this.failed(res , 'This course not found' , 404);
            }

            res.json({
                data: comment,
                status: 'success'
            });
        } catch (err) {
            this.failed(res , err.message);
        }
    }
}
