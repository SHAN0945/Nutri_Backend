const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const User = require('../models/user');
const auth = require('../routes/auth');

// Add meal
// Add food entry
router.post('/', auth, async (req, res) => {
    try {
        const { userId,name,calories,mealType } = req.body;
        const today = new Date().setHours(0, 0, 0, 0);

        // Find or create today's entry
        let meal = await Meal.findOne({ userId: userId, date: today });
        if (!meal) {
            meal = new Meal({ userId: userId, date: today, meals: {} });
        }

        // Add food to the specified meal type
        meal.meals[mealType].push({ name, calories });
        await meal.save();

        res.json({ message: 'Food entry added', meal });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE endpoint to remove a specific meal item
router.post('/delete', auth, async (req, res) => {
    try {
      const { userId, mealType, index } = req.body;
      

    if (!mealType) {
      return res.status(400).json({ message: 'mealType is required' });
    }
    if (index === undefined) {
      return res.status(400).json({ message: 'index is required' });
    }
    // Validate input
    if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
    }
      
      // Validate mealType
      if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
        return res.status(400).json({ message: 'Invalid meal type' });
      }
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find meal document for today
      const meal = await Meal.findOne({
        userId,
        date: {
          $gte: today,
          $lt: tomorrow
        }
      });
      
      if (!meal) {
        return res.status(404).json({ message: 'No meals found for today' });
      }
      
      // Check if the meal type array exists and has the specified index
      if (!meal.meals[mealType] || index >= meal.meals[mealType].length) {
        return res.status(404).json({ message: `Meal at index ${index} not found in ${mealType}` });
      }
      
      // Remove the meal at the specified index
      meal.meals[mealType].splice(index, 1);
      
      // Recalculate total calories
      let totalCalories = 0;
      Object.keys(meal.meals).forEach(type => {
        meal.meals[type].forEach(item => {
          totalCalories += item.calories;
        });
      });
      meal.totalCalories = totalCalories;
      
      // Save the updated meal document
      await meal.save();
      
      res.json({
        message: 'Meal removed successfully',
        meal
      });
    } catch (error) {
      console.error('Delete meal error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Get today's meals
router.get('/today', auth, async (req, res) => {
    try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Find meal entry for today
        const meal = await Meal.findOne({
            user: req.session.userId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });
        
        // Get recent foods
        const recentMeals = await Meal.find({ user: req.session.userId })
            .sort({ date: -1 })
            .limit(5);
        
        // Extract unique foods
        const recentFoods = [];
        const foodMap = new Map();
        
        recentMeals.forEach(meal => {
            Object.keys(meal.meals).forEach(mealType => {
                meal.meals[mealType].forEach(food => {
                    if (!foodMap.has(food.name)) {
                        foodMap.set(food.name, true);
                        recentFoods.push({
                            name: food.name,
                            calories: food.calories,
                            lastAdded: meal.date.toLocaleDateString()
                        });
                    }
                });
            }); // Closing forEach for meal types
        }); // Closing forEach for recentMeals

        // Send response
        res.json({
            meals: meal ? meal.meals : {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            },
            recentFoods
        });
        
    } catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}); // Closing router.get

module.exports = router; // Add this line to export the router
