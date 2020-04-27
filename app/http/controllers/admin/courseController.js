const Controller = require('./../controller');
const Course = require('app/models/course');
const Category = require('app/models/category');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports = new class courseController extends Controller {
    async index(req, res , next) { // next for error handeling
       try {
            let page = req.query.page || 1;
            let courses = await Course.paginate({} , { page , sort: { createdAt: -1 } , limit: 4 }); // use pagination instead of find
            // return res.json(courses);
            res.render('admin/courses/index', {
                title: "Admin Course",
                courses
            }); // render ejs file in /resource/views
       } catch (err) {
           next(err); // for pass this err to errorHandler middleware to show err
       }
    }

    async create(req , res , next) {
        try {
            let categories = await Category.find({});
            res.render('admin/courses/create', {
                title: "Create Course",
                categories
            }); // render ejs file in /resource/views
        } catch (err) {
            next(err);
        }
    }

    async store(req, res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                if(req.file) { // if we have err ,delete file uploaded with multer
                    fs.unlinkSync(req.file.path);
                }
                return this.back(req, res);
            }
            // upload images
            // create course
            try {
                let images = this.imageResize(req.file);
                let { title , body , type , price , tags } = req.body;
                let newCourse = new Course({
                    user: req.user._id,
                    title,
                    slug: this.slug(title),
                    body,
                    type,
                    price,
                    thumb: images[480],
                    tags,
                    images
                });

                await newCourse.save();
                return res.redirect('/admin/courses');
            } catch (err) {
                throw new Error(err);
            }
        } catch (err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let course = await Course.findById(req.params.id).populate('episodes').exec();

            if(!course) {
                this.error('This course not exist' , 404);
            }

            // delete episodes
            course.episodes.forEach(episode => episode.remove());

            // delete images
            Object.values(course.images).forEach(image => fs.unlinkSync('./public' + image));

            // delete course
            course.remove();

            return res.redirect('/admin/courses');
        } catch (err) {
            next(err);
        }
    }

    async edit(req , res , next) {
        try {
            this.isMongoId(req.params.id); // checking id
            let course = await Course.findById(req.params.id);

            if(!course) {
                this.error('This course not exist' , 404);
            }

            let categories = await Category.find({});

            return res.render('admin/courses/edit' , { course , categories });
        } catch (err) {
            next(err);
        }
    }

    async update(req , res , next) {
        try {
            let result = await this.validationData(req);
            if (!result) {
                if(req.file) { // if we have err ,delete file uploaded with multer
                    fs.unlinkSync(req.file.path);
                }
                return this.back(req, res);
            }

            let objForUpdate = {};

            // set thumb image
            objForUpdate.thumb = req.body.imagesThumb;

            // update image if exist (new image)
            if (req.file) {
                objForUpdate.images = this.imageResize(req.file);
                objForUpdate.thumb = objForUpdate.images[480];
            }

            delete req.body.images;
            objForUpdate.slug = this.slug(req.body.title);

            // update course
            await Course.findByIdAndUpdate(req.params.id , { $set: { ...req.body , ...objForUpdate }}); // compare with data in db and then update
            
            // redirect back
            return res.redirect('/admin/courses');
        } catch (err) {
            next(err);
        }
    }

    imageResize(image) {
        const imageInfo = path.parse(image.path);
        
        let addressImages = {};
        addressImages['original'] = this.getUrlImage(`${image.destination}/${image.filename}`); 
        // for create correct path with "destination" and  "filename" in req.file object


        const resize = size => {
            let imageName = `${imageInfo.name}-${size}${imageInfo.ext}`; //sm-480.png

            addressImages[size] = this.getUrlImage(`${image.destination}/${imageName}`); // for save in object or db

            sharp(image.path)
                .resize(size , null) // weight,height
                .toFile(`${image.destination}/${imageName}`); // des = /uploads/images/
        }

        [1080 , 720 , 480].map(resize);

        return addressImages;
    }

    getUrlImage(dir) {
        return dir.substring(8);
    }
}