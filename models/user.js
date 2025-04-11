const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    age: {
        type: Number,
        default: 30
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male'
    },
    weight: {
        type: Number,
        default: 70
    },
    height: {
        type: Number,
        default: 175
    },
    goal: {
        type: String,
        enum: ['lose', 'maintain', 'gain'],
        default: 'maintain'
    }
},
goals: {
    calories: {
        type: Number,
        default: 2000
    },
    water: {
        type: Number,
        default: 2500
    }
},
streak: {
    type: Number,
    default: 0
},
createdAt: {
    type: Date,
    default: Date.now
}

});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', UserSchema);
