const mongoose = require('mongoose');

const TimerSchema = new mongoose.Schema(
    {
        counter: {
            type: Number,
            default: 60 * 60 * 24 * 30
        },
        createdAt: {
            type: Date,
            index: { expireAfterSeconds: 'counter' }
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
