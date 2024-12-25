import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import BaseModal from '../modals/BaseModal';

// Extract the Image Gallery from TripPage.jsx
export default function TripImageGallery({ trip_id }) {
  // Use the useState hook to store the resolved image URLs in an array
  const [images, setImages] = useState([]);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageForModalId, setImageForModalId] = useState('');

  const height = 400;
  const gap = 12; //in px, should be divisible by 2,3,4

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_BACKEND_URL + `/file/gettrippics/${trip_id}`)
      .then((response) => {
        setImages(response.data);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  let imageHeight = [];

  //calcs height for images
  const length = images.length - 1;
  for (let i = 0; i < length; i++) {
    if (length == 2) {
      imageHeight.push(height / 2 - gap / 4 + 'px');
    } else {
      imageHeight.push(
        height / Math.ceil(length / 2) -
          ((1 - 1 / Math.ceil(length / 2)) * gap) / 2 +
          'px'
      );
    }
  }
  //1. width: 1/1 height 1/1 -0 x gap
  //2. width: 1/1 height 1/2 -0.5 x gap
  //3. width: 1/2 height 1/2 -0.5 x gap, 3rd: width: 1/1
  //4. width: 1/2 height 1/2 -0.5 x gap
  //5. width: 1/2 height 1/3 -0.66 x gap, 5th: width: 1/1
  //6. width: 1/2 height 1/3 -0.66 x gap
  //7. width: 1/2 height 1/4 -0.75 x gap, 7th: width: 1/1
  //etc.

  // show an image modal to view the image in full size
  const openImageModal = (id) => {
    setImageForModalId(id);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  const handleNext = () => {
    if (imageForModalId == images.length - 1) {
      setImageForModalId(0);
      return;
    }
    setImageForModalId(imageForModalId + 1);
  };

  const handlePrevious = () => {
    if (imageForModalId == 0) {
      setImageForModalId(images.length - 1);
      return;
    }
    setImageForModalId(imageForModalId - 1);
  };

  return (
    <div className="container mx-auto">
      <div
        className="flex"
        style={{ gap: images.length > 1 ? `${gap}px` : '0px' }}
      >
        <div
          style={{ height: height, width: images.length == 1 ? '100%' : '50%' }}
        >
          {/* big header image on left side */}
          <img
            src={images[0]}
            onClick={() => openImageModal(0)}
            className="h-full w-full cursor-pointer rounded-lg object-cover transition-transform hover:scale-105"
          />
        </div>
        <div
          className={`flex ${images.length == 1 ? 'w-0' : 'w-1/2'} flex-row flex-wrap`}
          style={{ height: height, gap: `${gap / 2}px` }}
        >
          {/* smaller image gallery on the right */}
          {images.slice(1).map((img, index) => (
            <div
              key={index}
              // full width for only 1 or 2 images and for the last image if the number of images is odd
              className={`${(length % 2 === 1 && index + 1 == length) || length == 2 ? 'w-full' : 'w-[calc(50%-3px)]'}`}
              style={{ height: imageHeight[index] }}
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                onClick={() => openImageModal(index + 1)}
                className="h-full w-full cursor-pointer rounded-lg object-cover transition-transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
      <BaseModal
        open={imageModalOpen}
        handleClose={closeImageModal}
        showTitle={false}
        title=""
        description="Image Modal"
        image={images[imageForModalId]}
        imageOnly={true}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
      ></BaseModal>
    </div>
  );
}

TripImageGallery.propTypes = {
  trip_id: PropTypes.string.isRequired,
};
