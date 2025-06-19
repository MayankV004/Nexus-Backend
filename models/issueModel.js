import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Issue title is required'],
    trim: true,
    minlength: [3, 'Issue title must be at least 3 characters long'],
    maxlength: [200, 'Issue title cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: { 
    type: String, 
    enum: {
      values: ['To Do', 'In Progress', 'In Review', 'Done'],
      message: 'Status must be one of: To Do, In Progress, In Review, Done'
    },
    default: 'To Do' 
  },
  priority: { 
    type: String, 
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Priority must be one of: Low, Medium, High, Critical'
    },
    default: 'Medium' 
  },
  assignee: {
    name: String,
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    avatar: String
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: [true, 'Project ID is required']
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
  labels: [{ 
    type: String,
    trim: true,
    maxlength: [30, 'Label cannot exceed 30 characters']
  }]
}, {
  timestamps: true
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;