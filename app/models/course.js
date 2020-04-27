const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let Schema = mongoose.Schema;

const courseSchema = Schema({
    user: { type: Schema.Types.ObjectId , ref: 'User'},
    categories: [{ type: Schema.Types.ObjectId , ref: 'Category'}],
    title: { type: String , required: true },
    slug: { type: String , required: true }, // good url for CEO
    type: { type: String , required: true },
    body: { type: String , required: true },
    price: { type: String , default: 0 },
    images: { type: Object , required: true },
    thumb: { type: String , required: true },
    tags: { type: String , required: true },
    time: { type: String , default: '00:00:00' },
    viewCount: { type: Number , default: 0 },
    commentCount: { type: Number , default: 0 }
} , { timestamps: true , toJSON: { virtuals: true }});

courseSchema.plugin(mongoosePaginate); // for add pagination to course

/* 
    for render this method in ejs file 
    <%= course.typeForEjs() %> => for call this in ejs file 
*/
courseSchema.methods.typeForEjs = function() {
    switch(this.type) {
        case "cash":
                return "Cash"
            break;
        case "vip":
                return "VIP"
            break;
        default:
                return "Free"
            break;
    }
}

courseSchema.methods.path = function() {
    return `/courses/${this.slug}`;
}

courseSchema.virtual('episodes' , {
    ref: 'Episode', 
    localField: '_id',
    foreignField: 'course' // course exist in episode model
});

courseSchema.virtual('comments' , {
    ref: 'Comment', 
    localField: '_id',
    foreignField: 'course' // course field exist in comment model
});

courseSchema.methods.inc = async function(field , num = 1) {
    this[field] += num;
    await this.save();
}

module.exports = mongoose.model('Course' , courseSchema);