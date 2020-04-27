const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt');
let Schema = mongoose.Schema;

const episodeSchema = Schema({
    course: { type: Schema.Types.ObjectId , ref: 'Course' },
    title: { type: String , required: true },
    type: { type: String , required: true },
    body: { type: String , required: true },
    time: { type: String , default: '00:00:00' },
    number: { type: Number , required: true },
    videoUrl: { type: String , required: true },
    downloadCount: { type: Number , default: 0 },
    viewCount: { type: Number , default: 0 },
    commentCount: { type: Number , default: 0 }
} , { timestamps: true });

episodeSchema.plugin(mongoosePaginate); // for add pagination to course

/* 
    for render this method in ejs file 
    <%= course.typeForEjs() %> => for call this in ejs file 
*/
episodeSchema.methods.typeForEjs = function() {
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

episodeSchema.methods.path = function() {
    return `${this.course.path()}/${this.number}`;
}

episodeSchema.methods.inc = async function(field , num = 1) {
    this[field] += num;
    await this.save();
}

episodeSchema.methods.download = function(req) {
    if(!req.isAuthenticated()) return '#';

    // free or vip or cash in episode model but canUserUse value return form course model

    /* start code for cheking free or vip-cash episode type */
    let status = false;
    if(this.type == 'free') {
        status = true;
    } else if (this.type == 'vip') {
        status = req.user.isVip();
    } else if (this.type == 'cash') {
        status = req.user.checkLearning(this.course);
    }
    /* end code */


    /*
        start create mac and timestamp for security
    */

    let timestamps = new Date().getTime() + 3600 * 1000 * 12; // for next 12 hours
    let text = `@#$huogdas&^@yuigy*!@hud$#%1${this.id}${timestamps}`;

    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(text , salt);

    /*
        end code
    */

    return status ? `/download/${this.id}?mac=${hash}&t=${timestamps}` : '#';
}

module.exports = mongoose.model('Episode' , episodeSchema);