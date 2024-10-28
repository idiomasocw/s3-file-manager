import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
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
          router.push('/');
        } else {
          console.error('Failed to fetch token');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, [router]);

  return <div>Loading...</div>;
};

export default Callback;
