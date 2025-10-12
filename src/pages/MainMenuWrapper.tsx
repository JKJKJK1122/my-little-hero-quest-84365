import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainMenu from './MainMenu';

const MainMenuWrapper = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkTest();
  }, []);

  const checkTest = async () => {
    // 문해력 테스트를 완료했는지 확인
    const isTestCompleted = localStorage.getItem('literacyTestCompleted');
    
    if (!isTestCompleted) {
      navigate('/literacy-test');
      return;
    }

    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">확인 중...</p>
        </div>
      </div>
    );
  }

  return <MainMenu />;
};

export default MainMenuWrapper;