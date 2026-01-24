import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const uid = searchParams.get('uid');
    const username = searchParams.get('username');
    const image = searchParams.get('image');
    const token = searchParams.get('token');
    const theme = searchParams.get('theme');
    const language = searchParams.get('language');

    if (uid && username && token) {
      login({ uid, username, image, token, theme, language });
      navigate('/dashboard');
    } else {
      navigate('/?error=invalid_params');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
      <p>Autenticando...</p>
    </div>
  );
};

export default AuthCallback;
