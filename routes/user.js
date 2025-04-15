const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Meal = require('../models/Meal');
const Water = require('../models/water');
const auth = require('../routes/auth');
const cors = require('cors');


// Get user data
router.get('/',cors(), async (req, res) => {
    try {
        const userId = req.query.userId || req.params.userId 
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await User.findById(userId);
        
        // Get today's meals
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const meal = await Meal.findOne({
            userId: userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });
        console.log("id", userId)
        // Get today's water intake
        const water = await Water.findOne({
            userId: userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });
        console.log("water", water) 
        
        // Calculate streak
        const streak = user.streak || 0;
        
        // Return compiled data
        res.json({
            profile: user.profile,
            calorieGoal: user.goals.calories,
            meals: meal ? meal.meals : {}, //meal
            // waterGoal: user.goals.water,
            currentCalories: meal ? meal.totalCalories : 0,
            currentWater: water ? water.amount : 0,
            streak
        });
    } catch (error) {
        console.error('Get user data error:', error);
        res.status(500).json({ message: 'Server error user' });
    }
});

// Update profile
router.post('/profile', async (req, res) => {
    try {
        const { age, gender, weight, height, goal , userId } = req.body;
        
        // Update user profile
        const user = await User.findById(userId);
        
        user.profile = {
            age: age || user.profile.age,
            gender: gender || user.profile.gender,
            weight: weight || user.profile.weight,
            height: height || user.profile.height,
            goal: goal || user.profile.goal
        };
        
        // Calculate calorie goal
        let bmr = 0;
        if (user.profile.gender === 'male') {
            bmr = 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age + 5;
        } else {
            bmr = 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age - 161;
        }
        
        switch (user.profile.goal) {
            case 'lose':
                user.goals.calories = Math.round(bmr * 0.8);
                break;
            case 'gain':
                user.goals.calories = Math.round(bmr * 1.2);
                break;
            default: // maintain
                user.goals.calories = Math.round(bmr);
        }
        
        // Calculate water goal
        user.goals.water = Math.round(user.profile.weight * 35);
        
        await user.save();
        
        res.json({
            message: 'Profile updated',
            profile: user.profile,
            goals: user.goals
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' , error: error.message });
    }
});

module.exports = router;
