const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueString = require('unique-string');

const userSchema = mongoose.Schema({
    name: { type: String , require: true },
    admin : { type: Boolean , default: 0 },
    email : { type: String , require: true , unique: true },
    password: { type: String , require: true },
    rememberToken: { type: String , default: null }
} , { timestamps: true });

// for hash password and then set password prapertty in model
userSchema.pre('save' , function(next) {
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(this.password , salt);
    this.password = hash;
    next();
});

// for hash password before findOneAndUpdate in resetPasswordController (updating password)
userSchema.pre('findOneAndUpdate' , function(next) { 
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(this.getUpdate().$set.password , salt);// "this.getUpdate().$set.password" for get password from reset controller
    this.getUpdate().$set.password = hash;
    next();
});

// for define method in Schema and compare hash pass with login password
userSchema.methods.comparePass = function(password) {
    return bcrypt.compareSync(password , this.password);
}

//set cookie after tick checkbox in login page
userSchema.methods.setRememberToken = function(res) {
    const token = uniqueString();
    res.cookie('remember_token' , token , { maxAge : 1000 * 60 * 60 * 24 * 90 , httpOnly : true , signed: true });
    // signed for hash cookie value
    // for 3 month alive this cookie
    this.updateOne({ rememberToken: token } , err => {
        if(err) console.log(err);
    });// for update rememberToken propertty in user model
}

module.exports = mongoose.model('User' , userSchema);



/*  usage for future
bcrypt.hash(this.password , bcrypt.genSaltSync(15) , (err, hash) => {
    if(err) console.log(err);
    this.password = hash;
    next();
});
*/