import {
  Box,
  IconButton,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  stepConnectorClasses,
  styled,
} from '@mui/material';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  RocketIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

export default function StepperComponent({
  stepIcons, // Array with the 3 step icons [<icon1/>, <icon2/>, <icon3/>]
  stepTitles, // Array with the 3 step titles ["title1", "title2", "title3"]
  stepContent, // Array with jsx content of the 3 steps
  completed, //saves what steps are completed
  setCompleted, //function to set completed
  activeStep, //currently active step number
  setActiveStep, //function to set active step
  handleStep, //function to handle step change
  handleStepValidated, //function to validate the step
  handleChange, //function to handle change in the form
  submit, //function to submit the form
  submitResponse, // Array with the finalResponse of the request that sends the stepper data to the backend, response looks like: [true/false, responseMessage] (true if request was successful and false in case of error)
  handleClose, //function to close the stepper modal
  submitButtonTitle = 'Finish', //title of the button on last page to submit
  successErrorMessages, //array with error and success messages
}) {
  // ----------------------------- styles for stepper -------------------------------
  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: 'linear-gradient( 95deg,#16BAC5 0%,#5FBFF9 100%)',
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage: 'linear-gradient( 95deg,#16BAC5 0%,#5FBFF9 100%)',
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 4,
      border: 0,
      backgroundColor:
        theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
      borderRadius: 1,
    },
  }));

  const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
      backgroundImage: 'linear-gradient( 95deg,#16BAC5 0%,#5FBFF9 100%)',
    }),
    ...(ownerState.completed && {
      backgroundImage: 'linear-gradient( 95deg,#16BAC5 0%,#5FBFF9 100%)',
    }),
  }));

  function ColorlibStepIcon(props) {
    const { active, completed, className } = props;

    //icons shown in stepper steps
    const icons = {
      1: stepIcons[0],
      2: stepIcons[1],
      3: stepIcons[2],
      4: <CheckIcon />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {/* renders icon and if step completed show checkmark */}
        {completed ? icons[String(4)] : icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  ColorlibStepIcon.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    completed: PropTypes.bool,
    icon: PropTypes.node,
  };
  // ----------------------------- styles stepper end -------------------------------

  const totalSteps = () => {
    return stepTitles.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
  };

  const handleNext = () => {
    if (!handleStepValidated()) return;
    handleComplete();
    if (isLastStep() && allStepsCompleted()) {
      submit();
      return;
    }
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          stepTitles.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      {!allStepsCompleted() && ( //dont show stepper on last page (success or error)
        <>
          {/* stepper shows the 3 steps and which one is active, completed etc. */}
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
          >
            {stepTitles.map((label, index) => (
              <Step key={label} completed={completed[index]}>
                {/* renders steps with icon + label */}
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  onClick={handleStep(index)}
                  className="[&_circle]:[r-6] [&_.MuiSvgIcon-root]:w-12 "
                  color="bright"
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </>
      )}
      <div>
        {allStepsCompleted() ? (
          <React.Fragment>
            {submitResponse[0] ? ( //check if account creation worked (request was successful)
              // if successful show the following success message
              <>
                <div className="flex w-full flex-col items-center pb-20 pt-32">
                  <div className="mb-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 p-4 shadow-lg">
                    <CheckIcon className="h-full w-full text-white" />
                  </div>
                  <p className="mb-3 text-3xl font-bold text-green-600">
                    Success!
                  </p>
                  <p className="text-xl">{successErrorMessages[0]}</p>
                </div>
                <IconButton className="btn btn-primary" onClick={handleClose}>
                  <RocketIcon />
                  Done
                </IconButton>
              </>
            ) : (
              // if request was not successful show the following error message
              <>
                <div className="flex w-full flex-col items-center pb-20 pt-32">
                  <div className="mb-8 h-32 w-32 rounded-full bg-gradient-to-br from-red-400 to-red-600 p-4 shadow-lg">
                    <XIcon className="h-full w-full text-white" />
                  </div>
                  <p className="mb-3 text-3xl font-bold text-red-600">Error!</p>
                  <p className="text-xl">{successErrorMessages[1]}</p>
                  <p className="text-xl text-gray-500">{submitResponse[1]}</p>
                </div>
                <IconButton className="btn btn-primary" onClick={handleStep(-1)}>
                  <Undo2Icon />
                  Retry
                </IconButton>
              </>
            )}
          </React.Fragment>
        ) : (
          // if not all steps are completed show the form
          <React.Fragment>
            <div className="m-auto mt-12 w-3/5 text-left md:w-10/12">
              <Box component="form" onChange={() => handleChange()}>
                {/* render the content for each step from the stepContent variable provided to this component to render whatever needed*/}
                {activeStep === 0 && <>{stepContent[0]}</>}
                {activeStep === 1 && <>{stepContent[1]}</>}
                {activeStep === 2 && <>{stepContent[2]}</>}
              </Box>
              {/* back button */}
              <Box className="mb-6 mt-6 flex flex-row items-end">
                {/* back arrow to navigate to previous page, not rendered for first step (0) */}
                {activeStep != 0 && (
                  <IconButton
                    color="inherit"
                    onClick={handleBack}
                    className="h-12 w-12"
                  >
                    <ArrowLeftIcon />
                  </IconButton>
                )}
                <Box className="flex-1" />
                <IconButton
                  color="inherit"
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  <ArrowRightIcon />
                  {/* show title of submit button in the last step instead of next */}
                  {isLastStep() ? submitButtonTitle : 'Next'}
                </IconButton>
              </Box>
            </div>
          </React.Fragment>
        )}
      </div>
    </>
  );
}

StepperComponent.propTypes = {
  showStepper: PropTypes.bool,
  setShowStepper: PropTypes.func,
  stepIcons: PropTypes.arrayOf(PropTypes.node).isRequired,
  stepContent: PropTypes.arrayOf(PropTypes.node).isRequired,
  stepTitles: PropTypes.arrayOf(PropTypes.string).isRequired,
  completed: PropTypes.object.isRequired,
  setCompleted: PropTypes.func.isRequired,
  activeStep: PropTypes.number.isRequired,
  setActiveStep: PropTypes.func.isRequired,
  handleStep: PropTypes.func.isRequired,
  handleStepValidated: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  submitResponse: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  submitButtonTitle: PropTypes.string,
  successErrorMessages: PropTypes.array.isRequired,
};
