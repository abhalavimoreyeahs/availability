const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        username: {
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
        emailHash: {
            type: String
        },

        salt: {
            type: String
        },

        userType: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    },

);

module.exports = mongoose.model('Users', UserSchema);