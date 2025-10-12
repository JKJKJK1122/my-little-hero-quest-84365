import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PetCare = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // PetCare는 이제 PetStorage로 리다이렉트
    navigate('/pet-storage', { replace: true });
  }, [navigate]);

  return null;
};

export default PetCare;
