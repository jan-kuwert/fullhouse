import {
  Avatar,
  Box,
  Rating,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../provider/AuthenticationProvider';
import { XIcon } from 'lucide-react';
import DialogComponent from './DialogComponent';

const TripReviewCard = ({ organizer }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!organizer || !organizer._id) return; // Ensure organizer ID is present

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/review/byUser/${organizer._id}`
      );
      if (response.data && Array.isArray(response.data)) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [organizer]);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/review/delete/${selectedReviewId}`,
        {
          withCredentials: true,
        }
      );
      setOpen(false);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleClickOpen = (reviewId) => {
    setSelectedReviewId(reviewId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [organizer, fetchReviews]); // Dependency on organizer ensures the effect runs when the organizer changes

  return (
    <>
      {reviews.length > 0 ? (
        reviews.slice(0, 3).map(
          (
            review,
            index // Slice the reviews array to the first 3 items
          ) => (
            <Box
              key={index}
              className="relative mb-4 flex w-full rounded-xl bg-bright p-4"
            >
              <Avatar
                src={
                  review.writer?.profilePicture?.url || '/default-profile.png'
                }
                alt={`Profile picture of ${review.writer?.name || 'Anonymous'}`}
                className="h-14 w-14 rounded-full"
              />
              <Box className="ml-4 flex-grow">
                <p className="text-lg">{review.writer?.firstName}</p>
                <p className="text-sm">
                  {review.writer?.location?.city},{' '}
                  {review.writer?.location?.country}
                </p>
                <Box className="flex items-center">
                  <Rating value={review.rating} readOnly size="small" />
                  <p className="ml-1">{review.rating.toFixed(1)}</p>
                </Box>
                <p>{review.text}</p>
              </Box>
              <p className="absolute right-4 top-4">
                {new Date(review.time).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {user && user._id === review.writer?._id && (
                <IconButton
                  className="absolute bottom-4 right-4"
                  onClick={() => handleClickOpen(review._id)}
                  aria-label="delete"
                  color="error"
                >
                  <XIcon />
                </IconButton>
              )}
            </Box>
          )
        )
      ) : (
        <p>No reviews available.</p>
      )}

      <DialogComponent
        open={open}
        handleClose={handleClose}
        handleSubmit={handleDelete}
        dialogText="Are you sure you want to delete this review?"
        withInput={false}
        confirmButtonText="Delete"
      ></DialogComponent>
    </>
  );
};

TripReviewCard.propTypes = {
  organizer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    profilePicture: PropTypes.object,
    location: PropTypes.shape({
      city: PropTypes.string,
      country: PropTypes.string,
    }),
  }).isRequired,
};

export default TripReviewCard;
