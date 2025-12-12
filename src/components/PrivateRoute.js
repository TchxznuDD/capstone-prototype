import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// Check if user is authenticated
export function isAuthenticated() {
  try {
    return sessionStorage.getItem('bfris_authenticated') === 'true';
  } catch (e) {
    return false;
  }
}

// Set authentication status
export function setAuthenticated(value) {
  try {
    if (value) {
      sessionStorage.setItem('bfris_authenticated', 'true');
    } else {
      sessionStorage.removeItem('bfris_authenticated');
    }
  } catch (e) {
    // ignore
  }
}

// Clear authentication (logout)
export function logout() {
  setAuthenticated(false);
}

// PrivateRoute component - redirects to login if not authenticated
const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default PrivateRoute;
