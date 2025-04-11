const mongoose = require('mongoose');

const WaterSchema = new mongoose.Schema({
    userId: {
        type: 'String',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        default: 0
    },
    goal: {
        type: Number,
        default: 2500
    },
    entries: [{
        time: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model('Water', WaterSchema);
