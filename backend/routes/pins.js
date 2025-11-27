const express = require('express')
const router = express.Router()
const pinController = require('../controllers/pinController')

// --- Public Routes ---
router.post('/', pinController.createPin)
router.get('/', pinController.getAllPins)

// --- Admin Routes ---
// Note: In a production app, you should protect these routes with admin-only middleware.
router.get('/pending', pinController.getPendingPins)
router.put('/approve/:id', pinController.approvePin)
router.put('/reject/:id', pinController.rejectPin)


module.exports = router
