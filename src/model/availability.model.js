const mongoose = require('mongoose');

const { Schema } = mongoose;

const AvailabilitySchema = new Schema(
    {

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },

        startTime: {
            type: Number,
            required: true
        },

        endTime: {
            type: Number,
            required: true
        },

    },
    {
        timestamps: true
    },

);

module.exports = mongoose.model('Availability', AvailabilitySchema);