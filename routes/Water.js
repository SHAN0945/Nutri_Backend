const express = require('express');
const router = express.Router();
const Water = require('../models/water');

// Add water intake
router.post('/', async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Debug incoming data
        const { amount,userId } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid water amount' });
        }

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find or create water entry for today
        let waterEntry = await Water.findOne({
            userId: userId,
            date: today
        });

        if (!waterEntry) {
            waterEntry = new Water({
                userId: userId,
                date: today,
                amount: 0,
                goal: 2500 // Default daily water goal in ml
            });
        }

        // Update water intake
        
        waterEntry.amount += amount;
        await waterEntry.save();

        res.json({ message: 'Water intake updated', currentWater: waterEntry.amount });
    } catch (error) {
        console.error('Error adding water intake:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// // Get today's water intake
// router.get('/today', async (req, res) => {
//     try {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const waterEntry = await Water.findOne({
//             user: userId,
//             date: today
//         });

//         if (!waterEntry) {
//             return res.json({ currentWater: 0, goal: 2500 }); // Default goal
//         }

//         res.json({ currentWater: waterEntry.amount, goal: waterEntry.goal });
//     } catch (error) {
//         console.error('Error fetching water intake:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
// //Get weekly summary
// router.get('/weekly', async (req, res) => {
//     try {
//         const oneWeekAgo = new Date();
//         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//         const weeklyData = await Water.find({
//             userId: userId,
//             date: { $gte: oneWeekAgo }
//         });

//         const summary = weeklyData.map(entry => ({
//             label: entry.date.toDateString(),
//             value: entry.amount
//         }));

//         res.status(200).json(summary);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Get hydration history
// router.get('/history', async (req, res) => {
//     try {
//         const history = await Water.find({ userId: req.session.userId }).sort({ date: -1 });

//         const formattedHistory = history.map(entry => ({
//             date: entry.date.toDateString(),
//             amount: entry.amount,
//             goal: entry.goal,
//             achievementRate: Math.round((entry.amount / entry.goal) * 100)
//         }));

//         res.status(200).json(formattedHistory);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


module.exports = router;


