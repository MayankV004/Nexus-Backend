import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters long"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    key: {
      type: String,
      required: [true, "Project key is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Project key must be at least 2 characters"],
      maxlength: [10, "Project key cannot exceed 10 characters"],
      match: [
        /^[A-Z0-9]+$/,
        "Project key can only contain uppercase letters and numbers",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "archived"],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    projectType: {
      type: String,
      enum: ["software", "business", "marketing", "research", "other"],
      default: "software",
    },
    // Project Owner/Creator
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Project owner is required"],
    },
    // Team Members with Roles
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        role: {
          type: String,
          enum: ["project_manager", "developer", "tester", "viewer"],
          default: "developer",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        permissions: {
          canCreateIssues: {
            type: Boolean,
            default: true,
          },
          canEditIssues: {
            type: Boolean,
            default: true,
          },
          canDeleteIssues: {
            type: Boolean,
            default: false,
          },
          canManageMembers: {
            type: Boolean,
            default: false,
          },
        },
      },
    ],
    // Project Timeline
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    // Project Settings
    settings: {
      allowPublicAccess: {
        type: Boolean,
        default: false,
      },
      issueTypes: [
        {
          name: {
            type: String,
            required: true,
          },
          icon: String,
          color: {
            type: String,
            default: "#0052CC",
          },
        },
      ],
      workflow: {
        statuses: [
          {
            name: {
              type: String,
              required: true,
            },
            category: {
              type: String,
              enum: ["to_do", "in_progress", "done"],
              required: true,
            },
            color: {
              type: String,
              default: "#DFE1E6",
            },
          },
        ],
      },
      priorities: [
        {
          name: {
            type: String,
            required: true,
          },
          level: {
            type: Number,
            required: true,
          },
          color: String,
          icon: String,
        },
      ],
    },
    // Project Statistics
    stats: {
      totalIssues: {
        type: Number,
        default: 0,
      },
      openIssues: {
        type: Number,
        default: 0,
      },
      inProgressIssues: {
        type: Number,
        default: 0,
      },
      completedIssues: {
        type: Number,
        default: 0,
      },
      lastActivityAt: {
        type: Date,
        default: Date.now,
      },
    },
    // Archive Information
    archivedAt: Date,
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    archiveReason: String,
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
projectSchema.index({ owner: 1 });
projectSchema.index({ "members.user": 1 });
projectSchema.index({ key: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ isDeleted: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for issue count
projectSchema.virtual("issueCount", {
  ref: "Issue",
  localField: "_id",
  foreignField: "project",
  count: true,
});

// Pre-save middleware to set default issue types and workflow
projectSchema.pre("save", function (next) {
  if (this.isNew) {
    // Set default issue types if not provided
    if (!this.settings.issueTypes || this.settings.issueTypes.length === 0) {
      this.settings.issueTypes = [
        { name: "Story", icon: "📖", color: "#65BA43" },
        { name: "Task", icon: "✅", color: "#4BADE8" },
        { name: "Bug", icon: "🐛", color: "#E97F33" },
        { name: "Epic", icon: "⚡", color: "#904EE2" },
      ];
    }

    // Set default workflow statuses if not provided
    if (
      !this.settings.workflow.statuses ||
      this.settings.workflow.statuses.length === 0
    ) {
      this.settings.workflow.statuses = [
        { name: "To Do", category: "to_do", color: "#DFE1E6" },
        { name: "In Progress", category: "in_progress", color: "#0052CC" },
        { name: "Done", category: "done", color: "#36B37E" },
      ];
    }

    // Set default priorities if not provided
    if (!this.settings.priorities || this.settings.priorities.length === 0) {
      this.settings.priorities = [
        { name: "Lowest", level: 1, color: "#57A55A", icon: "⬇️" },
        { name: "Low", level: 2, color: "#2D8738", icon: "🔽" },
        { name: "Medium", level: 3, color: "#E97F33", icon: "🔸" },
        { name: "High", level: 4, color: "#EA4444", icon: "🔺" },
        { name: "Highest", level: 5, color: "#CD1317", icon: "⬆️" },
      ];
    }
  }
  next();
});

// Static method to find projects by user (either owner or member)
projectSchema.statics.findByUser = function (userId) {
  return this.find({
    $and: [
      { isDeleted: false },
      {
        $or: [{ owner: userId }, { "members.user": userId }],
      },
    ],
  })
    .populate("owner", "name email username avatar")
    .populate("members.user", "name email username avatar");
};

// Instance method to check if user is member
projectSchema.methods.isMember = function (userId) {
  return (
    this.owner.toString() === userId.toString() ||
    this.members.some((member) => member.user.toString() === userId.toString())
  );
};

// Instance method to get user role in project
projectSchema.methods.getUserRole = function (userId) {
  if (this.owner.toString() === userId.toString()) {
    return "owner";
  }
  const member = this.members.find(
    (member) => member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Instance method to check user permissions
projectSchema.methods.hasPermission = function (userId, permission) {
  if (this.owner.toString() === userId.toString()) {
    return true; // Owner has all permissions
  }

  const member = this.members.find(
    (member) => member.user.toString() === userId.toString()
  );
  if (!member) return false;

  return member.permissions[permission] || false;
};

// Instance method to add member
projectSchema.methods.addMember = function (userId, role = "developer") {
  // Check if user is already a member
  const existingMember = this.members.find(
    (member) => member.user.toString() === userId.toString()
  );
  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  const defaultPermissions = {
    canCreateIssues: true,
    canEditIssues: role === "project_manager" || role === "developer",
    canDeleteIssues: role === "project_manager",
    canManageMembers: role === "project_manager",
  };

  this.members.push({
    user: userId,
    role,
    permissions: defaultPermissions,
  });

  return this.save();
};

// Instance method to remove member
projectSchema.methods.removeMember = function (userId) {
  this.members = this.members.filter(
    (member) => member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to update member role
projectSchema.methods.updateMemberRole = function (userId, newRole) {
  const member = this.members.find(
    (member) => member.user.toString() === userId.toString()
  );
  if (!member) {
    throw new Error("User is not a member of this project");
  }

  member.role = newRole;

  // Update permissions based on role
  const defaultPermissions = {
    canCreateIssues: true,
    canEditIssues: newRole === "project_manager" || newRole === "developer",
    canDeleteIssues: newRole === "project_manager",
    canManageMembers: newRole === "project_manager",
  };

  member.permissions = { ...member.permissions, ...defaultPermissions };

  return this.save();
};

const Project = mongoose.model("Project", projectSchema);
export default Project;
