const Controller = require('./../controller');
const Course = require('app/models/course');
const Comment = require('app/models/comment');
const passport = require('passport');

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
                            { path: 'episodes' , options: { sort: { number: 1 } } },
                            { path : 'categories', select : 'name slug' }
                        ]);

            if(!course) {
                return this.failed(res , 'This course not found' , 404);
            }

            // use jwt in public route for check user login or not
            passport.authenticate('jwt' , { session: false } , (err , user , info) => {
                res.json({
                    data: this.filterCourseData(course , user),
                    status: 'success'
                });
            })(req , res); 

            
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

    filterCourseData(course , user) {
        return {
            id : course.id,
            title : course.title,
            slug : course.slug,
            body : course.body,
            image : course.thumb,
            categories : course.categories.map(cate => {
                return {
                    name : cate.name,
                    slug : cate.slug
                }
            }),
            user : {
                id : course.user.id,
                name : course.user.name
            },
            episodes : course.episodes.map(episode => {
                return {
                    time : episode.time,
                    downloadCount : episode.downloadCount,
                    viewCount : episode.viewCount,
                    commentCount : episode.commentCount,
                    id : episode.id,
                    title : episode.title,
                    body : episode.body,
                    type : episode.type,
                    number : episode.number,
                    createdAt : episode.createdAt,
                    download : episode.download(!! user , user) // method "download()" in episode model (login or not in public route)
                }
            }) ,
            price : course.price,
            createdAt : course.createdAt
        }
    }
}
