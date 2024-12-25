import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  Rating,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Send } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import { useAlert } from '../provider/AlertProvider.jsx';
import BaseModal from './BaseModal';

export default function CreateReviewModal({ handleClose, open, trip }) {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleReviewTextChange = (event) => {
    setReviewText(event.target.value);
  };

  const postReview = async () => {
    if (trip.organizer._id !== user._id) {
      const reviewData = {
        rating: rating,
        text: reviewText,
        user: trip.organizer._id,
        writer: user._id, // Assuming the writer is the same as the user for simplicity
        time: new Date().toISOString(),
      };
      try {
        await axios.post(
          import.meta.env.VITE_BACKEND_URL + '/review/add',
          reviewData,
          { withCredentials: true }
        );
        handleClose(); // Close the modal on successful posting
        setAlert('success', 'Review created');
      } catch (error) {
        console.error('Error posting review:', error);
        setAlert('error', error);
      }
    } else {
      console.log('Cant review yourself');
      setAlert('warning', 'You cant review Yourself :)');
    }
  };

  return (
    <BaseModal
      open={open}
      handleClose={handleClose}
      title="Rate your Experience"
      description="Review Modal"
      content={
        <>
          <Box className="mx-12 my-8 flex flex-col gap-8">
            <Box className="flex items-center gap-4 self-start">
              <Avatar
                src={trip?.organizer && trip?.organizer.profilePicture?.url}
                className="h-12 w-12"
              />
              {trip?.organizer && trip?.organizer.firstName}
            </Box>
            <Box className="text-left">
              <Typography className="ml-1" component="legend">
                Rating
              </Typography>
              <Rating
                className="w-fit rounded-xl"
                name="simple-controlled"
                value={rating}
                onChange={handleRatingChange}
                size="large"
              />
            </Box>
            <FormControl fullWidth className="formcontrol mt-0">
              <TextField
                fullWidth
                label="Review"
                multiline
                rows={4}
                value={reviewText}
                onChange={handleReviewTextChange}
                className="input-field"
                inputProps={{ maxLength: 300 }}
                placeholder="How was your experience..."
              />
              <p className="absolute bottom-6 right-2 rounded-lg bg-bright">
                {reviewText.length}/300
              </p>
            </FormControl>
            <IconButton
              onClick={postReview}
              className="btn btn-primary self-end"
            >
              <Send />
              Post Review
            </IconButton>
          </Box>
        </>
      }
    />
  );
}

CreateReviewModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
