const mongoose = require('mongoose');

const TimerSchema = new mongoose.Schema(
    {
        createdAt: {
            type: Date,
            index: { expireAfterSeconds: process.env.DISABLE_TIME }
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        },
        versionKey: false
    }
);

module.exports = mongoose.model('Timer', TimerSchema);
