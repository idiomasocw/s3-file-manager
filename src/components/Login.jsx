import React from 'react';
import { redirectToCognito } from '../utils/auth';

const Login = () => (
  <div className="h-screen flex items-center justify-center">
    <button
      onClick={redirectToCognito}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Log in with Cognito
    </button>
  </div>
);

export default Login;
