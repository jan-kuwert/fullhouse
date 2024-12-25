import mongoose from "mongoose";

// Define the schema for storing image information
const fileSchema = mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
});

// Create the User model from the schema
export const FileSchema = mongoose.model("FileSchema", fileSchema);
