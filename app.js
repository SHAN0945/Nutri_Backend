const cors = require('cors');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authMiddleware = require('./Middleware/authMiddleware');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const mealRoutes = require('./routes/meals');
const waterRoutes = require('./routes/Water');
const appointmentRoutes = require('./routes/appointment');

console.log('Starting server...');
console.log(authRoutes); // Log the imported module to ensure it's defined
console.log(userRoutes);
console.log(mealRoutes);
console.log(waterRoutes);
console.log(appointmentRoutes);

const app = express();

// Middleware

// Middleware
app.use(cors({
    }));



app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

    


// In app.js
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax'
    }
}));


// Connect to MongoDB
connectDB();


app.get('/favicon.ico', (req, res) => res.status(204).end());
//app.use(express.static(path.join(__dirname, 'public')));

// Public Routes
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/Water', waterRoutes);
app.use('/api/appointments', appointmentRoutes);



// Protected Routes
app.get('/dashboard', authMiddleware, (req, res) => {
    res.status(200).json({ message: `Welcome to your dashboard, user ${req.session.userId}` });
});

app.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'This is your profile' });
});

// Start Server
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    "http://localhost:5501",
    "https://nutri-frontend-five.vercel.app"
  ];

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
