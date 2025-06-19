import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Member name is required'] },
  email: { 
    type: String, 
    required: [true, 'Member email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: { type: String, required: [true, 'Member role is required'] },
  avatar: { type: String, default: '' }
});

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters long'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  progress: { 
    type: Number, 
    default: 0, 
    min: [0, 'Progress cannot be less than 0'], 
    max: [100, 'Progress cannot be more than 100'] 
  },
  issues: { type: Number, default: 0, min: 0 },
  status: { 
    type: String, 
    enum: {
      values: ['Planning', 'In Progress', 'Review', 'Completed'],
      message: 'Status must be one of: Planning, In Progress, Review, Completed'
    },
    default: 'Planning' 
  },
  priority: { 
    type: String, 
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Priority must be one of: Low, Medium, High, Critical'
    },
    default: 'Medium' 
  },
  dueDate: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  template: { type: String, default: '' },
  tags: [{ 
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  members: [memberSchema]
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;