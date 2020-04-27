const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
let Schema = mongoose.Schema;

const permissionSchema = Schema({
    name: { type: String , required: true },
    label: { type: String , required: true }
} , { timestamps: true , toJSON: { virtuals: true }});

permissionSchema.plugin(mongoosePaginate);

permissionSchema.virtual('roles' , {
    ref: 'Role',
    localField: '_id',
    foreignField: 'permissions'
});

module.exports = mongoose.model('Permission' , permissionSchema);