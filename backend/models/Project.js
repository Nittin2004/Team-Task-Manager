const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

// Ensure owner is always a member
projectSchema.pre('save', function (next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
