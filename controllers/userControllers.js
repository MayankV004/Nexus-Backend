import { User} from '../models/index.js'
import mongoose from 'mongoose';
// Validation helper
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const  userId  = req.params.userId || req.user?._id; 
    console.log("User ID:", userId);
    validateObjectId(userId);

    const user = await User.findById(userId)
      .populate('projects.projectId', 'name status priority dueDate')
      .populate('assignedIssues.issueId', 'title status priority dueDate projectId')
      .select('-password -refreshToken -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    validateObjectId(userId);

    const user = await User.findById(userId)
      .populate('projects.projectId')
      .populate('assignedIssues.issueId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const analytics = {
      totalProjects: user.projects.length,
      activeProjects: user.projects.filter(p => p.isActive).length,
      totalIssues: user.assignedIssues.length,
      issuesByStatus: {
        'To Do': user.assignedIssues.filter(i => i.status === 'To Do').length,
        'In Progress': user.assignedIssues.filter(i => i.status === 'In Progress').length,
        'In Review': user.assignedIssues.filter(i => i.status === 'In Review').length,
        'Done': user.assignedIssues.filter(i => i.status === 'Done').length
      },
      projectsByStatus: {},
      recentActivity: {
        recentProjects: user.projects
          .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
          .slice(0, 5),
        recentIssues: user.assignedIssues
          .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
          .slice(0, 5)
      }
    };

    // Count projects by status
    user.projects.forEach(p => {
      if (p.projectId && p.projectId.status) {
        const status = p.projectId.status;
        analytics.projectsByStatus[status] = (analytics.projectsByStatus[status] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    validateObjectId(userId);

    const allowedUpdates = ['name', 'bio', 'location', 'phoneNumber', 'avatar', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};