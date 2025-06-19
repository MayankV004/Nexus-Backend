import {Issue , Project} from '../models/index.js';
import mongoose from 'mongoose';

// Validation helper
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
};

// Get all issues for a project
export const getIssuesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    validateObjectId(projectId);

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const issues = await Issue.find({ projectId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error fetching issues',
      error: error.message 
    });
  }
};

// Get issue by ID
export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }
    
    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error fetching issue',
      error: error.message 
    });
  }
};

// Create new issue
export const createIssue = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, projectId, dueDate, labels } = req.body;

    // Check required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Issue title is required'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    validateObjectId(projectId);

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const issue = new Issue({
      title: title.trim(),
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignee,
      projectId,
      dueDate,
      labels: labels || []
    });

    const savedIssue = await issue.save();

    // Update project issues count
    await Project.findByIdAndUpdate(
      projectId,
      { $inc: { issues: 1 } }
    );

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: savedIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating issue',
      error: error.message 
    });
  }
};

// Update issue
export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    // Check if issue exists
    const existingIssue = await Issue.findById(id);
    if (!existingIssue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    // Validate title if provided
    if (req.body.title !== undefined && (!req.body.title || req.body.title.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Issue title cannot be empty'
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error updating issue',
      error: error.message 
    });
  }
};

// Delete issue
export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: 'Issue not found' 
      });
    }

    // Update project issues count
    await Project.findByIdAndUpdate(
      issue.projectId,
      { $inc: { issues: -1 } }
    );

    res.json({ 
      success: true,
      message: 'Issue deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error deleting issue',
      error: error.message 
    });
  }
};