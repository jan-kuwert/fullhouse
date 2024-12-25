import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import CreateAccountModal from '../modals/CreateAccountModal';
import CreateReviewModal from '../modals/CreateReviewModal';
import CreateTripModal from '../modals/CreateTripModal';
import LoginSignUpModal from '../modals/LoginSignUpModal';
import StripePaymentModal from '../modals/StripePaymentModal.jsx';

//container to manage modals in one place
export default function ModalsContainerComponent({
  openModal,
  setOpenModal,
  trip,
  bookingRequest,
}) {
  const [openLoginSignUpModal, setOpenLoginSignUpModal] = useState(false);
  const [openCreateAccountModal, setOpenCreateAccountModal] = useState(false);
  const [openCreateTripModal, setOpenCreateTripModal] = useState(false);
  const [loginSignUpModalType, setLoginSignUpModalType] = useState('');
  const [openCreateReviewModal, setOpenCreateReviewModal] = useState(false);
  const [openStripePaymentModal, setOpenStripePaymentModal] = useState(false);

  //used to hand username and pw over to create account modal from singup modal
  const [createAccountData, setCreateAccountData] = useState({});

  useEffect(() => {
    if (openModal) {
      handleOpen(openModal);
    }
  }, [openModal]);

  //set boolean open by model id
  const handleOpen = (value) => {
    switch (value) {
      case 'loginsignup':
        setOpenLoginSignUpModal(true);
        break;
      case 'login':
        setLoginSignUpModalType('login');
        setOpenLoginSignUpModal(true);
        break;
      case 'signup':
        setLoginSignUpModalType('signup');
        setOpenLoginSignUpModal(true);
        break;
      case 'createAccount':
        setOpenCreateAccountModal(true);
        break;
      case 'createTrip':
        setOpenCreateTripModal(true);
        break;
      case 'createReview':
        setOpenCreateReviewModal(true);
        break;
      case 'stripePayment':
        setOpenStripePaymentModal(true);
        break;
    }
  };

  //handleClose only worked with seperate functions (since they pass on twice first to modal x then to base modal cant call function with values)
  const handleCloseLoginSignUpModal = () => {
    setOpenLoginSignUpModal(false);
    setOpenModal('');
  };

  const handleCloseCreateAccount = () => {
    setOpenCreateAccountModal(false);
    setOpenModal('');
  };

  const handleCloseCreateTrip = () => {
    setOpenCreateTripModal(false);
    setOpenModal('');
  };
  const handleCloseCreateReview = () => {
    setOpenCreateReviewModal(false);
    setOpenModal('');
  };
  const handleCloseStripePayment = () => {
    setOpenStripePaymentModal(false);
    setOpenModal('');
  };

  return (
    <div className="m-4 hidden w-fit rounded-xl bg-bright p-4 shadow-lg">
      <h1 className="text-xl">Modal Container with Test Buttons</h1>
      <button
        className="btn btn-primary mb-3 mr-2 max-w-48 py-2"
        onClick={() => {
          handleOpen('login');
        }}
      >
        Open Login Modal
      </button>
      <button
        className="btn btn-primary mb-3 mr-2 max-w-56 py-2"
        onClick={() => {
          handleOpen('signup');
        }}
      >
        Open SignUp Modal
      </button>
      <button
        className="btn btn-primary mb-3 mr-2 max-w-64 py-2"
        onClick={() => handleOpen('createAccount')}
      >
        Open CreateAccount Modal
      </button>
      <button
        className="btn btn-primary mb-3 mr-2 max-w-56 py-2"
        onClick={() => handleOpen('createTrip')}
      >
        Open CreateTrip Modal
      </button>
      <button
        className="btn btn-primary mb-3 mr-2 max-w-64 py-2"
        onClick={() => handleOpen('createReview')}
      >
        Open CreateReview Modal
      </button>

      <button
        className="btn btn-primary mb-3 mr-2 max-w-40 py-2"
        onClick={() => handleOpen('stripePayment')}
      >
        Open Stripe
      </button>

      <LoginSignUpModal
        open={openLoginSignUpModal}
        handleClose={handleCloseLoginSignUpModal}
        modalType={loginSignUpModalType}
        setModalType={setLoginSignUpModalType}
        setOpenCreateAccountModal={setOpenCreateAccountModal}
        setCreateAccountData={setCreateAccountData}
      />
      <CreateAccountModal
        open={openCreateAccountModal}
        handleClose={handleCloseCreateAccount}
        createAccountData={createAccountData}
      />
      <CreateTripModal
        open={openCreateTripModal}
        handleClose={handleCloseCreateTrip}
      />
      <CreateReviewModal
        open={openCreateReviewModal}
        handleClose={handleCloseCreateReview}
        trip={trip}
      />
      <StripePaymentModal
        open={openStripePaymentModal}
        handleClose={handleCloseStripePayment}
        trip={trip}
        bookingRequest={bookingRequest}
      />
    </div>
  );
}

ModalsContainerComponent.propTypes = {
  openModal: PropTypes.string,
  setOpenModal: PropTypes.func,
  trip: PropTypes.object,
  bookingRequest: PropTypes.object,
};
