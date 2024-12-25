import multer from "multer";

// Define the storage location
const storage = multer.diskStorage({});

// Create a function to filter the files to be uploaded
const imageFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(pdf|jpg|jpeg|png|gif)$/)) {
    // Create an error message to be returned in case validation fails
    req.fileValidationError =
      "Invalid image format. Only pdf, jpeg, jpg, png and gif images are allowed.";
    return cb(new Error("Invalid image format"), false);
  }
  cb(null, true);
};

// Create a multer instance with the storage and fileFilter options
const upload = multer({ storage: storage, fileFilter: imageFilter });

// Export the multer instance
export default upload;
