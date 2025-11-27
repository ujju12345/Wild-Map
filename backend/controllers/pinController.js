const Pin = require('../models/pin');

exports.createPin = async (req, res) => {
    try {
        const newPin = new Pin(req.body)
        const savedPin = await newPin.save()
        res.status(200).json(savedPin)
    } catch (err) {
        res.status(500).json(err)
    }
}

exports.getAllPins = async (req, res) => {
    try {
        const pins = await Pin.find({ status: 'approved' })
        res.status(200).json(pins)
    } catch (err) {
        res.status(500).json(err)
    }
}

// ---- New Admin Functions ----

// Get all pins that are pending approval
exports.getPendingPins = async (req, res) => {
    try {
        const pendingPins = await Pin.find({ status: 'pending' });
        res.status(200).json(pendingPins);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Approve a pin
exports.approvePin = async (req, res) => {
    try {
        const updatedPin = await Pin.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        res.status(200).json(updatedPin);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Reject a pin
exports.rejectPin = async (req, res) => {
    try {
        const updatedPin = await Pin.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        res.status(200).json(updatedPin);
    } catch (err) {
        res.status(500).json(err);
    }
};
