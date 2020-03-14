const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true
        },

        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },

        timezoneOffset: {
            type: Number,
            default: null
        },
        salt: {
            type: String
        },

    },
    {
        timestamps: true
    },

);

module.exports = mongoose.model('Users', UserSchema);