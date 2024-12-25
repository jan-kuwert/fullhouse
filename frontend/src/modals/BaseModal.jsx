import { Box, Card, IconButton, Modal } from '@mui/material';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';

// basic modal component to create popups
export default function BaseModal({
  open, //bool, saves if modal is open or not
  handleClose, //function to close the modal (set open to false)
  title = 'Modal Title', //title rendered large at the top of the modal
  showTitle = true, // if no title is needed set to false, default is true
  description, //description of the modal for screen readers/ accessibility
  content = (
    <div className="h-12">
      <p>Modal Content</p>
    </div>
  ), //content of the modal (can be any jsx)
  image, //if an image is given the left half of the modal will render the image and the right half the content
  imageOnly = false, //if true the modal will only show the image and no content
  handleNext, //function to handle the next image in the gallery
  handlePrevious, //function to handle the previous image in the gallery
  width, //tailwindclass for width of the modal, default is w-1/4 and with image w-1/2
}) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby={title}
      aria-describedby={description}
      className="flex items-center justify-center text-center"
    >
      {image ? (
        <Card
          className={`relative flex max-h-[95%] ${width ? width : 'w-1/2'} ${!imageOnly && 'min-w-[1000px]'} flex-row justify-center rounded-xl  ${imageOnly ? 'max-w-[95%]' : 'p-4'}`}
        >
          <IconButton
            className={`absolute right-2 top-2 h-12 w-12 justify-self-end rounded-full ${imageOnly ? 'bg-white opacity-75' : ''}`}
            onClick={handleClose}
            aria-label="close modal"
          >
            <XIcon className="text-dark opacity-100" />
          </IconButton>
          {/* left half of modal with image*/}
          <Box className={`flex ${imageOnly ? 'w-full' : 'w-1/2 pl-4'} `}>
            <img
              src={image}
              className={`flex ${imageOnly ? 'w-full' : 'object-contain'}`}
            ></img>
            {imageOnly && handleNext && handlePrevious && (
              <>
                <IconButton
                  className="absolute right-2 top-[calc(50%-1.5rem)] h-12 w-12 justify-self-end rounded-full bg-white opacity-75"
                  onClick={handleNext}
                  aria-label="close modal"
                >
                  <ChevronRightIcon className="text-dark opacity-100" />
                </IconButton>
                <IconButton
                  className="absolute left-2 top-[calc(50%-1.5rem)] h-12 w-12 justify-self-end rounded-full bg-white opacity-75"
                  onClick={handlePrevious}
                  aria-label="close modal"
                >
                  <ChevronLeftIcon className="text-dark opacity-100" />
                </IconButton>
              </>
            )}
          </Box>
          {/* right half of modal with content*/}
          <Box
            className={`${imageOnly ? 'hidden' : 'w-1/2 min-w-[550px]'}  overflow-scroll pb-12`}
          >
            {/* close Button */}

            {showTitle && (
              <h1 className="my-10 justify-self-center text-5xl font-medium md:text-4xl">
                {title}
              </h1>
            )}
            {content}
          </Box>
        </Card>
      ) : (
        <Card
          className={`relative max-h-[95%] ${width ? width : 'w-1/4'} min-w-[650px] flex-col justify-center overflow-scroll rounded-xl p-4`}
        >
          {/* close X Button in the top right corner*/}
          <IconButton
            className="absolute right-2 top-2 h-12 w-12 justify-self-end rounded-full"
            onClick={handleClose}
            aria-label="close modal"
          >
            <XIcon />
          </IconButton>
            {showTitle && (
              <h1 className="my-10 justify-self-center text-5xl font-medium md:text-4xl">
                {title}
              </h1>
            )}
            {content}
        </Card>
      )}
    </Modal>
  );
}

BaseModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  showTitle: PropTypes.bool,
  description: PropTypes.string,
  content: PropTypes.any,
  image: PropTypes.string,
  imageOnly: PropTypes.bool,
  handleNext: PropTypes.func,
  handlePrevious: PropTypes.func,
  width: PropTypes.string,
};
