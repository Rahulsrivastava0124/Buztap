const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: [{
    type: String,
    required: true,
  }],
  isSystem: {
    type: Boolean,
    default: false,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false,
  }
}, { timestamps: true });

// A role name must be unique within a business, or globally unique if it's a system role.
roleSchema.index({ name: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
