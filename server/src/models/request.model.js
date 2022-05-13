const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Timezone = require('mongoose-timezone');

const RequestSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['add_friend'],
            required: true,
            default: 'add_friend',
        },
        from: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        to: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

RequestSchema.plugin(Timezone);

module.exports = mongoose.model('Request', RequestSchema);
