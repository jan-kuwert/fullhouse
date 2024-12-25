import { IconButton, InputAdornment } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { CheckIcon, Trash2Icon, TypeIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';

export default function DialogComponent({
  open, //bool, saves if modal is open or not
  handleClose, //function to close the modal (set open to false)
  handleSubmit, //function executed on confirm of dialog
  withInput = false, //bool, if true, a textfield will be displayed
  value, //string, value of the textfield
  setValue, //function to set the value of the textfield
  confirmButtonText = 'Confirm', //string, text to be displayed on the confirm button
  dialogText = '',
  errorMessage, //contains error message if input value is not valid
  setErrorMessage, //function to set the error message
  color = 'primary', //submit button color: primary, red
}) {
  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeypress = (e) => {
    if (e.keyCode === 13) {
      handleSubmit();
    }
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        className="[&_.MuiPaper-root]:rounded-xl [&_.MuiPaper-root]:p-3"
        onKeyDown={handleKeypress}
      >
        <DialogTitle className="p-4">Are you sure?</DialogTitle>
        <DialogContent className="p-4 pb-2">
          <DialogContentText>{dialogText}</DialogContentText>
          {withInput && (
            <>
              <TextField
                multiline
                className="input-field mt-4 w-full"
                rows={2}
                value={value}
                onChange={handleValueChange}
                placeholder="Why did you cancel..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <TypeIcon className="dark-icon" />
                    </InputAdornment>
                  ),
                }}
              ></TextField>
              <p className="ml-2 text-red-600">{errorMessage}</p>
            </>
          )}
        </DialogContent>
        <DialogActions className="flex justify-between p-4">
          <IconButton
            onClick={() => {
              handleClose();
              setErrorMessage('');
            }}
            className="btn w-fit px-4"
          >
            <XIcon /> Cancel
          </IconButton>
          <IconButton
            type="submit"
            className={`btn ${color === 'primary' && 'btn-primary'} ${color === 'red' && 'btn-danger'} w-fit px-8`}
            onClick={handleSubmit}
          >
            {color === 'red' ? <Trash2Icon /> : <CheckIcon />}
            {confirmButtonText}
          </IconButton>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

DialogComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  withInput: PropTypes.bool,
  value: PropTypes.string,
  setValue: PropTypes.func,
  confirmButtonText: PropTypes.string,
  dialogText: PropTypes.string,
  errorMessage: PropTypes.string,
  setErrorMessage: PropTypes.func,
  color: PropTypes.string,
};
