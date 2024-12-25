import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  // used for signup
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: (value) => {
        return /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
      },
    },
  },
  // used for signup
  password: {
    type: String,
    required: true,
  },

  // used for create Account
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["female", "male", "other"],
    required: true,
  },

  // Rating Added Later
  rating: {
    type: Number,
    required: false,
  },

  // used for create Account
  profileDescription: {
    type: String,
    required: false,
  },

  // locationa nd city
  location: {
    city: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
  },

  // Used for create Account
  profilePicture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FileSchema",
    required: false,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if the entered password matches the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create the User model from the schema
export const UserSchema = mongoose.model("UserSchema", userSchema);
