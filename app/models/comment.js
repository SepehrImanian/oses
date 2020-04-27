const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let Schema = mongoose.Schema;

const commentSchema = Schema({
    user: { type: Schema.Types.ObjectId , ref: 'User'},
    parent: { type: Schema.Types.ObjectId , ref: 'Comment' , default: null },
    approved: { type: Boolean , default: false },
    course: { type: Schema.Types.ObjectId , ref: 'Course' , default: undefined },  // send comment for episode or course
    episode: { type: Schema.Types.ObjectId , ref: 'Episode' , default: undefined },  // undefined means untill we dont call this field not exist
    comment: { type: String , required: true }
} , { timestamps: true , toJSON: { virtuals: true }});

commentSchema.plugin(mongoosePaginate);

commentSchema.virtual('comments' , {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parent' // parent field exist in comment model (return to comment model)
});

const commentBelong = doc => {
    if(doc.course) {
        return 'Course'
    } else if (doc.episode) {
        return 'Episode'
    }
}

commentSchema.virtual('belongTo' , {
    ref: commentBelong,
    localField: doc => commentBelong(doc).toLowerCase(),
    foreignField: '_id',
    justOne: true // just retrun one obj not array
});

module.exports = mongoose.model('Comment' , commentSchema);