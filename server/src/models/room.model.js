const mongoose = require('mongoose');
const MessageSchema = require('./schemas/message.schema').schema;
const Timezone = require('mongoose-timezone');

const RoomSchema = new mongoose.Schema(
    {
        chatMate: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],
        isChecked: [
            {
                type: String
            }
        ],
        messages: [MessageSchema]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

RoomSchema.plugin(Timezone);

module.exports = mongoose.model('Room', RoomSchema);
