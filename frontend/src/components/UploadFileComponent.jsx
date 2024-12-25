import { Alert, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import { FileUpIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react'; // Import useEffect
import { useDropzone } from 'react-dropzone';

export default function UploadFileComponent({
  setParentFiles,
  maxFiles = 10,
  maxFileSize = 1048576,
  icon = <FileUpIcon className="mb-4 h-12 w-12" />,
  backgroundColor = 'bg-transparent',
}) {
  const [files, setFiles] = useState([]); // State to store file previews
  const [tempFileIds, setTempFileIds] = useState([]); // State to store Cloudinary IDs

  const { fileRejections, getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    maxFiles,
    maxSize: maxFileSize,
    accept: {
      'image/*': ['.jpeg', '.png'],
    },
    onDrop: async (acceptedFiles) => {
      // Handle each dropped file
      for (let file of acceptedFiles) {
        try {
          // Create object with file properties
          const fileWithPreview = {
            key: Date.now() + file.path,
            preview: URL.createObjectURL(file),
            file, // Store the file itself for other operations if needed
          };
          // Update state with new file preview
          setFiles((prevFiles) => [...prevFiles, fileWithPreview]);

          // Upload file and retrieve fileId
          const tempFileId = await handleImageUpload(file);
          // Update state with new tempFileId
          setTempFileIds((prevIds) => [...prevIds, tempFileId]);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    },
  });

  // Cleanup URL object when component unmounts or file previews change
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('images', file); // Ensure 'images' is what the backend expects

    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + '/file/uploadpictures',
        formData
      );
      const tempFileId = response.data.fileIds;
      return tempFileId; // Return tempFileId for updating state in onDrop handler
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Propagate error for better error handling
    }
  };

  // Function to remove file from state
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setTempFileIds((prev) => prev.filter((_, i) => i !== index));
  };

  // Pass tempFileIds to parent component
  useEffect(() => {
    setParentFiles(tempFileIds);
  }, [tempFileIds, setParentFiles]);

  // Generate UI for file previews (both uploaded and prefilled)
  const imagePreviews = [
    ...files.map((file, index) => (
      <li
        key={file.key}
        className="radius rounded-2xl bg-gradient-to-br from-primary to-light p-1"
      >
        <div className="relative w-full rounded-xl bg-white">
          <img
            src={file.preview}
            className="h-full w-full rounded-xl"
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
            alt={`Preview ${file.key}`} // Add alt attribute for accessibility
          />
          <IconButton
            className="2 absolute right-1 top-1 h-8 w-8 rounded-full bg-white p-1 opacity-95"
            onClick={() => removeFile(index)}
          >
            <XIcon className="h-6 w-6 text-dark" />
          </IconButton>
        </div>
      </li>
    )),
  ];

  // Generate UI for file rejections (errors)
  const fileRejectionItems = fileRejections.map(({ errors }) => (
    <div key="" className="m-auto w-fit">
      {errors.map((e) => (
        <Alert key={e.code} severity="error" className="rounded-xl shadow-lg">
          {e.message}.
        </Alert>
      ))}
    </div>
  ));

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <Tooltip
          title={`JPEG, PNG (max: ${maxFileSize / 1024 / 1024} MB)`}
          className="w-1/2 bg-bright"
          arrow
        >
          <div className="w-full rounded-xl">
            <div
              {...getRootProps({ className: 'dropzone' })}
              className={`${backgroundColor} mr-2 flex w-full flex-col items-center rounded-xl border-2 border-dashed border-gray-400 px-4 pb-2 pt-4 text-center hover:border-dark hover:shadow-lg`}
            >
              {icon}
              <input {...getInputProps()} />
              <p>
                Drop your image here, or
                <span
                  onClick={open}
                  className="mx-1 font-bold text-primary hover:cursor-pointer"
                >
                  browse
                </span>
              </p>
            </div>
            {imagePreviews.length > 0 && (
              <div className="m-2">
                <ul className="space-4 columns-3">{imagePreviews}</ul>
              </div>
            )}
          </div>
        </Tooltip>
      </div>
      <div className="absolute -top-4 w-full p-2">{fileRejectionItems}</div>
    </div>
  );
}

UploadFileComponent.propTypes = {
  setParentFiles: PropTypes.func.isRequired,
  maxFileSize: PropTypes.number,
  icon: PropTypes.element,
  maxFiles: PropTypes.number,
  backgroundColor: PropTypes.string,
};
