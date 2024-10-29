// src/utils/auth.js

export const redirectToCognitoLogin = () => {
  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_CALLBACK_URL;
  const loginUrl = `https://${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(redirectUri)}`;

  window.location.href = loginUrl;
};

export const redirectToCognitoLogout = () => {
  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const signoutUri = process.env.NEXT_PUBLIC_COGNITO_SIGNOUT_URL;

  const logoutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(signoutUri)}`;
  localStorage.removeItem('token');  // Clear token before redirecting
  window.location.href = logoutUrl;
};
