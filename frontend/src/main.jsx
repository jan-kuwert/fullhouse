import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Render the router in the root element of the document
ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
      <App />
  //</React.StrictMode>
);


// todo: check how to access it then. currently dirty with props. i think we dont need that anymore because of the Stripe Element nesting