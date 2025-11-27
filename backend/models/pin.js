// models/pin.js - Remove exact coordinates, add area radius
const mongoose = require("mongoose")

const PinSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    speciesName: {
      type: String,
      required: true,
    },
     scientificName: {
      type: String,
      required: true, // Add this new required field
    },
    type: {
      type: String,
      required: true,
    },
    conservationStatus: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    continent: {
      type: String,
      required: true,
    },
    scientificDescription: {
      type: String,
      required: true,
    },
    discoverer: {
      type: String,
      default: ""
    },
    discoveryMethod: {
      type: String,
      default: ""
    },
    discoveryYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    imageUrl: {
      type: String,
      default: ""
    },
    // ✅ REMOVED: exact coordinates
    // long: { type: Number, required: true },
    // lat: { type: Number, required: true },
    
    // ✅ ADDED: approximate area center and radius
    areaCenter: {
      long: { type: Number, required: true },
      lat: { type: Number, required: true }
    },
    areaRadius: {
      type: Number,
      required: true,
      default: 40, // km - between 30-50km as requested
      min: 30,
      max: 50
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("pin", PinSchema)