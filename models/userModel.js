import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell your name!"],
      minlength: [3, "Name must be atleast 3 character long"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "please make a username"],
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be atleast 6 character long!"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "project_manager", "developer", "tester", "viewer"],
      default: "developer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    refreshToken: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
      },
    ],
    lastLogin: Date,
    bio: {
  type: String,
  default: "",
  maxlength: [500, "Bio cannot exceed 500 characters"]
},
location: {
  type: String,
  default: "",
  maxlength: [100, "Location cannot exceed 100 characters"]
},
phoneNumber: {
  type: String,
  default: "",
  match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"]
},
projects: [{
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  role: String, // Role in this specific project
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}],
assignedIssues: [{
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: String // Current status of the issue
}]
  },

  { timestamps: true }
);



// Hash Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Check if password is already hashed (bcrypt hashes start with $2b$)
    if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
      return next(); // Skip hashing if already hashed
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("user", userSchema);
export default User;
