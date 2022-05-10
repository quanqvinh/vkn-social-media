const mongoose = require('mongoose');
const Timezone = require('mongoose-timezone');

const ReplySchema = new mongoose.Schema(
    {
        replyBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
        autoCreate: false,
    }
);

ReplySchema.plugin(Timezone);

module.exports = {
    schema: ReplySchema,
    model: mongoose.model('Reply', ReplySchema),
};
