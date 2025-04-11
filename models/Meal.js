const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    meals: {
        breakfast: [{
            name: {
                type: String,
                required: true
            },
            calories: {
                type: Number,
                required: true
            }
        }],
        lunch: [{
            name: {
                type: String,
                required: true
            },
            calories: {
                type: Number,
                required: true
            }
        }],
        dinner: [{
            name: {
                type: String,
                required: true
            },
            calories: {
                type: Number,
                required: true
            }
        }],
        snacks: [{
            name: {
                type: String,
                required: true
            },
            calories: {
                type: Number,
                required: true
            }
        }]
    },
    totalCalories: {
        type: Number,
        default: 0
    }
});

// Calculate total calories
MealSchema.pre('save', function(next) {
    let total = 0;
    
    Object.keys(this.meals).forEach(mealType => {
        this.meals[mealType].forEach(meal => {
            total += meal.calories;
        });
    });
    
    this.totalCalories = total;
    next();
});

module.exports = mongoose.model('Meal', MealSchema);

