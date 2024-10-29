// src/pages/callback.js

import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/'); // Redirect to home if already authenticated
      return;
    }

    const fetchToken = async () => {
      const { code } = router.query;
      if (!code) return;

      const tokenUrl = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/token`;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
      const redirectUri = process.env.NEXT_PUBLIC_COGNITO_CALLBACK_URL;
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
      });

      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });

        if (response.ok) {
          const { id_token } = await response.json();
          localStorage.setItem('token', id_token);
          router.replace('/'); // Redirect to home after successful login
        } else {
          console.error('Failed to fetch token');
          router.push('/'); // Redirect to home on failure
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        router.push('/'); // Redirect to home in case of error
      }
    };

    fetchToken();
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
<svg
  style={{ width: '80px', height: '80px' }}
  viewBox="0 0 50 50"
>
  <circle
    style={{
      fill: 'none',
      stroke: '#000',
      strokeWidth: '4',
      strokeLinecap: 'round',
      strokeDasharray: '1,5', // Adjust these values for dot size and spacing
    }}
    cx="25"
    cy="25"
    r="20"
  >
    <animateTransform
      attributeName="transform"
      type="rotate"
      from="0 25 25"
      to="360 25 25"
      dur="1s"
      repeatCount="indefinite"
    />
  </circle>
</svg>

        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Callback;
