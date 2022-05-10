const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const MessageSchema = new mongoose.Schema(
    {
        sendBy: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
            default: '',
        },
        isImage: {
            type: Boolean,
            required: true,
            default: false,
        },
        showWith: {
            type: String,
            default: 'all',
        },
    },
    {
        timestamps: true,
        versionKey: false,
        autoCreate: false,
    }
);

MessageSchema.plugin(Timezone);

module.exports = {
    schema: MessageSchema,
    model: mongoose.model('Message', MessageSchema),
};
