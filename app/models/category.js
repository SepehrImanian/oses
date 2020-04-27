const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let Schema = mongoose.Schema;

const categorySchema = Schema({
    name: { type: String , required: true },
    slug: { type: String , required: true },
    parent: { type: Schema.Types.ObjectId , ref: 'Category' , default: null }
} , { timestamps: true , toJSON: { virtuals: true }});

categorySchema.plugin(mongoosePaginate); // for add pagination to course

categorySchema.virtual('childs' , {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent' // parent field exist in comment model (return to comment model)
});

module.exports = mongoose.model('Category' , categorySchema);