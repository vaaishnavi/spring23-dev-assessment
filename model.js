const mongoose = require('mongoose');

// user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password
});

// animal schema
const animalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    species: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // reference to user
});

// training log schema
const trainingLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // reference to user
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true }, // reference to animal
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

// export models
const User = mongoose.model('User', userSchema);
const Animal = mongoose.model('Animal', animalSchema);
const TrainingLog = mongoose.model('TrainingLog', trainingLogSchema);

module.exports = { User, Animal, TrainingLog };
