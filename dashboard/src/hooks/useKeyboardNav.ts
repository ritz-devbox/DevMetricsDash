import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const routes = [
  '/',
  '/repositories',
  '/team',
  '/pull-requests',
  '/issues',
  '/code-velocity',
  '/dora',
];

export function useKeyboardNav() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;

      const currentIndex = routes.indexOf(location.pathname);
      if (currentIndex === -1) return;

      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        const next = routes[(currentIndex + 1) % routes.length];
        navigate(next);
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = routes[(currentIndex - 1 + routes.length) % routes.length];
        navigate(prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location.pathname]);
}
