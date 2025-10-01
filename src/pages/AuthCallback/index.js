import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '~/api/client';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (!token) {
        navigate('/auth');
        return;
      }
      try {
        localStorage.setItem('token', token);
        // Lấy user
        const res = await api.get('/auth/me');
        if (res?.data?.success) {
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          // đồng bộ achievementsCache
          try {
            const ach = Array.isArray(res.data.data.user?.achievements) ? res.data.data.user.achievements : [];
            localStorage.setItem('achievementsCache', JSON.stringify(ach));
          } catch {}
          navigate('/home');
          return;
        }
      } catch (e) {
        // Fall back
      }
      navigate('/auth');
    };
    run();
  }, [navigate]);

  return null;
}

export default AuthCallback;

