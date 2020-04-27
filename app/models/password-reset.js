const mongoose = require('mongoose');

const passwordResetSchema = mongoose.Schema({
    email : { type: String , required: true },
    token: { type: String , required: true },
    use: { type: Boolean , default: false }
} , { timestamps: { updatedAt: false } }); // just createdAt


module.exports = mongoose.model('PasswordReset' , passwordResetSchema);