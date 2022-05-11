const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const authSchema = new mongoose.Schema(
    {
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
            required: true,
        },
        remainingTime: {
            type: Date,
            default: new Date(Date.now()),
            index: { expireAfterSeconds: 60 * 60 * 24 * 7 },
        },
    },
    {
        _id: false,
    }
);

authSchema.plugin(Timezone);

module.exports = authSchema;
