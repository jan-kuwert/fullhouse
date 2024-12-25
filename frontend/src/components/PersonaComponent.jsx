import { IconButton } from '@mui/material';
import { ScanFaceIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAlert } from '../provider/AlertProvider.jsx';

const PersonaComponent = ({ setVerificationStatus }) => {
  const { setAlert } = useAlert();

  const handleVerifyClick = () => {
    if (!window.Persona) {
      console.error('Persona script not loaded');
      return;
    }

    const templateId = 'itmpl_afviYzDcMQqDPWyncxrtX2HoqJCe'; // Replace with your actual template ID
    const environmentId = 'env_UaJqd9VswxVaeUa2PPXTH3vdHNPD'; // Replace with your actual environment ID

    const client = new window.Persona.Client({
      templateId: templateId,
      environmentId: environmentId,
      onReady: () => client.open(),
      onComplete: () => {
        // Handle completion logic here
        setVerificationStatus(true); // Update verification status
        setAlert({ type: 'success', message: 'Verification completed successfully.' });
      },
      onError: (error) => {
        console.error('Error from Persona:', error);
        // Handle error logic here
        setVerificationStatus(false); // Update verification status
        setAlert({ type: 'error', message: 'Verification failed. Please try again.' });
      },
      onCancel: () => {
        // Handle cancellation logic here
        setVerificationStatus(false); // Update verification status
        setAlert({ type: 'info', message: 'Verification canceled by the user. You need to be verified to create an account. Cannot create Account.' });
      },
    });
  };

  return (
    <div className="flex justify-center">
      <IconButton color="primary" className="btn btn-bright mb-10" onClick={handleVerifyClick}>
        <ScanFaceIcon/> Verify with Persona
      </IconButton>
    </div>
  );
};

// Prop types for PersonaComponent
PersonaComponent.propTypes = {
  setVerificationStatus: PropTypes.func.isRequired,
};

export default PersonaComponent;


