const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Coffee', 'Tea', 'Food', 'Dessert', 'Beverage']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if item is available based on stock
menuSchema.virtual('availableForOrder').get(function() {
  return this.isAvailable && this.stock > 0;
});

// Ensure virtual fields are serialized
menuSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Menu', menuSchema);