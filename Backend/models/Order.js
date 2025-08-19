const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be positive']
  }
});

const orderSchema = new mongoose.Schema({
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cashier ID is required']
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total must be positive']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital', 'midtrans'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  midtransToken: {
    type: String
  },
  midtransOrderId: {
    type: String
  }
}, {
  timestamps: true
});

// Populate cashier and menu items
orderSchema.pre(/^find/, function(next) {
  this.populate('cashierId', 'nama email role')
      .populate('items.menuItemId', 'name price category');
  next();
});

module.exports = mongoose.model('Order', orderSchema);