const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { User, Animal, TrainingLog } = require('./models'); // import models
const authenticateJWT = require('./middleware/authenticateJWT'); // import jwt middleware

const app = express();
app.use(express.json()); // middleware to parse json bodies

// connect to mongodb
mongoose.connect('your-mongodb-connection-string', { useNewUrlParser: true, useUnifiedTopology: true });

// health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ healthy: true }); // return json indicating api is healthy
});

// create user endpoint
app.post('/api/user', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // hash password
        const user = new User({ ...req.body, password: hashedPassword }); // create new user
        await user.save(); // save user to database
        res.status(200).json(user); // return created user
    } catch (error) {
        res.status(500).json({ error: 'failed to create user' }); // return error if user creation fails
    }
});

// create animal endpoint
app.post('/api/animal', authenticateJWT, async (req, res) => {
    try {
        const animal = new Animal(req.body); // create new animal
        await animal.save(); // save animal to database
        res.status(200).json(animal); // return created animal
    } catch (error) {
        res.status(500).json({ error: 'failed to create animal' }); // return error if animal creation fails
    }
});

// create training log endpoint with ownership validation
app.post('/api/training', authenticateJWT, async (req, res) => {
    const { userId, animalId } = req.body;
    try {
        const user = await User.findById(userId); // find user by id
        const animal = await Animal.findById(animalId); // find animal by id
        if (!user || !animal) return res.status(400).json({ error: 'invalid user or animal id' });

        if (animal.ownerId.toString() !== user._id.toString()) {
            return res.status(400).json({ error: 'animal does not belong to the specified user' }); // check ownership
        }

        const trainingLog = new TrainingLog(req.body); // create new training log
        await trainingLog.save(); // save training log to database
        res.status(200).json(trainingLog); // return created training log
    } catch (error) {
        res.status(500).json({ error: 'failed to create training log' }); // return error if training log creation fails
    }
});

// admin endpoints with pagination
app.get('/api/admin/users', authenticateJWT, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const users = await User.find().limit(limit * 1).skip((page - 1) * limit).exec(); // paginate users
        res.status(200).json(users); // return users
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch users' }); // return error if user fetch fails
    }
});

app.get('/api/admin/animals', authenticateJWT, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const animals = await Animal.find().limit(limit * 1).skip((page - 1) * limit).exec(); // paginate animals
        res.status(200).json(animals); // return animals
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch animals' }); // return error if animal fetch fails
    }
});

app.get('/api/admin/training', authenticateJWT, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const trainingLogs = await TrainingLog.find().limit(limit * 1).skip((page - 1) * limit).exec(); // paginate training logs
        res.status(200).json(trainingLogs); // return training logs
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch training logs' }); // return error if training log fetch fails
    }
});

// user login endpoint
app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }); // find user by email
        if (user && await bcrypt.compare(password, user.password)) { // compare password
            const token = jwt.sign({ id: user._id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' }); // create jwt
            res.status(200).json({ token }); // return jwt
        } else {
            res.status(403).json({ error: 'invalid email or password' }); // return error if credentials are invalid
        }
    } catch (error) {
        res.status(500).json({ error: 'failed to log in user' }); // return error if login fails
    }
});

// start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
