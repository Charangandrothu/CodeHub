import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

const getInitialMobileState = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_QUERY).matches;
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(getInitialMobileState);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
