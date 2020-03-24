const mongoose = require('mongoose');

const passwordResetSchema = mongoose.Schema({
    email : { type: String , require: true },
    token: { type: String , require: true },
    use: { type: Boolean , default: false }
} , { timestamps: { updatedAt: false } }); // just createdAt


module.exports = mongoose.model('PasswordReset' , passwordResetSchema);