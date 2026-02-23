// client/src/components/Spinner.jsx

import React from 'react';
// Import the CSS we just created.
// This tells Vite/CRA to include this CSS in the final application bundle.
import './Spinner.css';

// A simple functional component for the loading spinner.
// It accepts a 'size' prop to add a 'spinner-small' class if needed.
const Spinner = ({ size }) => {
  const spinnerClass = size === 'small' ? 'spinner spinner-small' : 'spinner';
  return <div className={spinnerClass}></div>;
};

export default Spinner;