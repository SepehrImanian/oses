const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let Schema = mongoose.Schema;

const paymentSchema = Schema({
    user: { type: Schema.Types.ObjectId , ref: 'User' },
    course: { type: Schema.Types.ObjectId , ref: 'Course' , default: null },
    vip: { type: Boolean , default: false },
    resnumber: { type: String , required: true },
    price: { type: Number , required: true },
    payment: { type: Boolean , default: false },
} , { timestamps: true , toJSON: { virtuals: true }});

paymentSchema.plugin(mongoosePaginate); // for add pagination to payment

module.exports = mongoose.model('Payment' , paymentSchema);