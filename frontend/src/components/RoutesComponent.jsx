import { useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AccountPage from '../pages/AccountPage.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import ManageTripPage from '../pages/ManageTripPage.jsx';
import MyTripsPage from '../pages/MyTripsPage.jsx';
import PaymentConfirmation from '../pages/PaymentConfirmation.jsx';
import TripPage from '../pages/TripPage.jsx';
import { useAuth } from '../provider/AuthenticationProvider.jsx';
import { AlertComponent } from './AlertComponent.jsx';
import { FooterComponent } from './FooterComponent.jsx';
import ModalsContainerComponent from './ModalsContainerComponent.jsx';
import NavBarComponent from './NavBarComponent.jsx';
import { ProtectedRouteComponent } from './ProtectedRouteComponent.jsx';

const RoutesComponent = () => {
  const { user } = useAuth();
  const [openModal, setOpenModal] = useState('');
  const [trip, setTrip] = useState({});
  const [bookingRequest, setBookingRequest] = useState({});

  // Define public routes accessible to all users
  const routesForPublic = [
    {
      path: '/',
      element: (
        <>
          <NavBarComponent setOpenModal={setOpenModal} />
          <AlertComponent />
          <ModalsContainerComponent
            setOpenModal={setOpenModal}
            openModal={openModal}
            /*stripePromise={stripePromise}*/
          />{' '}
          <LandingPage setOpenModal={setOpenModal} />
          <FooterComponent />
        </>
      ),
    },

    {
      path: '/trip/:trip_id',
      element: (
        <>
          <NavBarComponent setOpenModal={setOpenModal} /> <AlertComponent />
          <ModalsContainerComponent
            setOpenModal={setOpenModal}
            openModal={openModal}
            /*stripePromise={stripePromise}*/
            trip={trip}
          />{' '}
          <TripPage setModalTrip={setTrip} setOpenModal={setOpenModal} />
          <FooterComponent />
        </>
      ),
    },
  ];

  // Define routes accessible only to authenticated users
  const routesForAuthenticatedOnly = [
    {
      path: '/',
      element: <ProtectedRouteComponent />, // Wrap the component in ProtectedRoute
      children: [
        {
          path: '/chat',
          element: (
            <>
              <NavBarComponent setOpenModal={setOpenModal} /> <AlertComponent />
              <ModalsContainerComponent
                setOpenModal={setOpenModal}
                openModal={openModal}
                trip={trip}
                bookingRequest={bookingRequest}
                /*stripePromise={stripePromise}*/
              />{' '}
              <ChatPage
                setOpenModal={setOpenModal}
                openModal={openModal}
                setModalPaymentTrip={setTrip}
                setModalPaymentBookingRequest={setBookingRequest}
              />
              <FooterComponent />
            </>
          ),
        },
        {
          path: '/account',
          element: (
            <>
              <NavBarComponent setOpenModal={setOpenModal} /> <AlertComponent />
              <ModalsContainerComponent
                setOpenModal={setOpenModal}
                openModal={openModal}
                /*stripePromise={stripePromise}*/
              />{' '}
              <AccountPage />
              <FooterComponent />
            </>
          ),
        },
        {
          path: '/myTrips',
          element: (
            <>
              <NavBarComponent setOpenModal={setOpenModal} /> <AlertComponent />
              <ModalsContainerComponent
                setOpenModal={setOpenModal}
                openModal={openModal}
              />{' '}
              <MyTripsPage />
              <FooterComponent />
            </>
          ),
        },
        {
          path: '/manageTrip/:tripId',
          element: (
            <>
              <NavBarComponent setOpenModal={setOpenModal} /> <AlertComponent />
              <ModalsContainerComponent
                setOpenModal={setOpenModal}
                openModal={openModal}
              />{' '}
              <ManageTripPage />
              <FooterComponent />
            </>
          ),
        },
        {
          path: '/paymentConfirmation/:bookingRequestId',
          element: (
            <>
              <NavBarComponent setOpenModal={setOpenModal} /> <AlertComponent />
              <ModalsContainerComponent
                setOpenModal={setOpenModal}
                openModal={openModal}
                /*stripePromise={stripePromise}*/
              />{' '}
              <PaymentConfirmation />
              <FooterComponent />
            </>
          ),
        },
      ],
    },
  ];

  // Define routes accessible only to non-authenticated users
  const routesForNotAuthenticatedOnly = [];

  // Combine and conditionally include routes based on authentication status
  const router = createBrowserRouter([
    ...routesForPublic,
    ...(!user ? routesForNotAuthenticatedOnly : []),
    ...routesForAuthenticatedOnly,
  ]);

  // Provide the router configuration using RouterProvider
  return <RouterProvider router={router} />;
};

export default RoutesComponent;
