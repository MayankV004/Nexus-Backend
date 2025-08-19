import { Project,User } from '../models/index.js';
import mongoose from 'mongoose';

// Validation helper
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {

    const userId = req.user._id;

    // finding user
    const user = await User.findById(userId).populate({
      path:'projects.projectId',
      model:'Project'
    })

    if(!user)
    {
      return res.status(404).json({
        success:false,
        message:'User not Found'
      })
    }



    const projects = user.projects.filter(project => project.isActive && project.projectId).map(project => ({
      ...project.projectId.toObject(),
      userRole: project.role,
      joinedAt: project.joinedAt
    })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt date
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching projects',
      error: error.message 
    });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error fetching project',
      error: error.message 
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const { name, description, priority, dueDate, template, tags, members } = req.body;
    // console.log("Creating project with data:", req.body);
    const creatorId = req.user._id


    // Check required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Validate members if provided
    if (members && Array.isArray(members)) {
      for (const member of members) {
        if (!member.name || !member.email || !member.role) {
          return res.status(400).json({
            success: false,
            message: 'All members must have name, email, and role'
          });
        }
      }
    }

    // console.log("Creating project with creatorId:", creatorId);
    const project = new Project({
      name: name.trim(),
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      template: template || '',
      tags: tags || [],
      members: members || []
    });
    // console.log("Project object created:", project);
    const savedProject = await project.save();

    // Adding project to creator's project list
    const user = await User.findByIdAndUpdate({_id : creatorId}, {
      $push:{
        projects:{
          projectId: savedProject._id,
          role: "admin",
          joinedAt: new Date(),
          isActive: true
        }
      }
    })
    console.log("User updated with new project:", user);
    // adding project to all members project list
    if( members && members.length > 0) {
      for (const member of members) {
        const TeamMember = await User.findOneAndUpdate({ email: member.email })
        if( TeamMember && !user ) {
          await User.findByIdAndUpdate(user._id, {
            $push: {
              projects: {
                projectId: savedProject._id,
                role: member.role,
                joinedAt: new Date(),
                isActive: true
              }
            }})
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    
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
      message: 'Error creating project',
      error: error.message 
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    // Check if project exists
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    // Validate name if provided
    if (req.body.name !== undefined && (!req.body.name || req.body.name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Project name cannot be empty'
      });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    
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
      message: 'Error updating project',
      error: error.message 
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error deleting project',
      error: error.message 
    });
  }
};

// Add member to project
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const { name, email, role, avatar } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and role are required for member'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    // Check if member already exists
    const existingMember = project.members.find(member => member.email === email);
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Member with this email already exists in the project'
      });
    }

    project.members.push({ name, email, role, avatar: avatar || '' });
    await project.save();

    // Add project to user's projects array
    const user = await User.findOne({ email });
    if (user) {
      // Check if project already exists in user's projects
      const existingProject = user.projects.find(
        p => p.projectId.toString() === id
      );
      
      if (!existingProject) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              projects: {
                projectId: id,
                role: role,
                joinedAt: new Date(),
                isActive: true
              }
            }
          }
        );
      }
    }
    
    return res.json({
      success: true,
      message: 'Member added successfully',
      data: project
    });
  } catch (error) {
    console.error('Error adding member:', error);
    
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
    
    return res.status(500).json({ 
      success: false,
      message: 'Error adding member',
      error: error.message 
    });
  }
};

// Remove member from project
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    validateObjectId(id);
    validateObjectId(memberId);

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const memberIndex = project.members.findIndex(
      member => member._id.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in project'
      });
    }

    const memberEmail = project.members[memberIndex].email;

    project.members.splice(memberIndex, 1);
    await project.save();
    
    // Remove project from user's projects array
    const user = await User.findOne({ email: memberEmail });
    if (user) {
      await User.findByIdAndUpdate(
        user._id,
        {
          $pull: {
            projects: { projectId: id }
          }
        }
      );
    }
    res.json({
      success: true,
      message: 'Member removed successfully',
      data: project
    });
  } catch (error) {
    console.error('Error removing member:', error);
    
    if (error.message === 'Invalid ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error removing member',
      error: error.message 
    });
  }
};