const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueString = require('unique-string');
const mongoosePaginate = require('mongoose-paginate');
let Schema = mongoose.Schema;

const userSchema = Schema({
    name: { type: String , required: true },
    active: { type: Boolean , default: false },
    admin : { type: Boolean , default: 0 },
    email : { type: String , required: true , unique: true },
    password: { type: String , required: true },
    rememberToken: { type: String , default: null },
    vipTime: { type: Date , default: new Date().toISOString() }, // string date+time (default)
    vipType: { type: String , default: 'month' }, // 1 month , 3 month , a year (default) => month
    learning: [{ type: Schema.Types.ObjectId , ref: 'Course'}],
    roles: [{ type: Schema.Types.ObjectId , ref: 'Role'}]
} , { timestamps: true  , toJSON: { virtuals: true }});

userSchema.plugin(mongoosePaginate); // for add pagination to user

userSchema.methods.hashPassword = function(password) {
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(password , salt);
    return hash;
}

// for define method in Schema and compare hash pass with login password
userSchema.methods.comparePass = function(password) {
    return bcrypt.compareSync(password , this.password);
}

userSchema.methods.hasRole = function(roles) {
    let result = roles.filter(role => {
        return this.roles.indexOf(role) > -1; // this filed roles in user model , exist role or not (true , false)
    });
    return !! result.length;
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

userSchema.virtual('courses' , {
    ref: 'Course', 
    localField: '_id',
    foreignField: 'user' // user exist in course model
});

userSchema.methods.isVip = function() { // for chack user is vip or not
    return new Date(this.vipTime) > new Date();
}

userSchema.methods.checkLearning = function(courseId) { // for check user is cash or not
    return this.learning.indexOf(courseId) !== -1;
}

module.exports = mongoose.model('User' , userSchema);

/*  usage for future

bcrypt.hash(this.password , bcrypt.genSaltSync(15) , (err, hash) => {
    if(err) console.log(err);
    this.password = hash;
    next();
});

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

*/