import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 타이틀 섹션 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 animate-bounce">
            🌟 똑똑한 선택왕 🌟
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            올바른 선택을 배우는 재미있는 게임!
          </p>
          <p className="text-lg text-muted-foreground">
            다양한 상황에서 최선의 선택을 연습해보세요
          </p>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="text-left">
                <h3 className="font-bold text-foreground">실생활 상황 학습</h3>
                <p className="text-sm text-muted-foreground">일상에서 마주치는 다양한 상황을 체험해요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤔</span>
              <div className="text-left">
                <h3 className="font-bold text-foreground">올바른 판단력</h3>
                <p className="text-sm text-muted-foreground">왜 그것이 좋은 선택인지 배워요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎮</span>
              <div className="text-left">
                <h3 className="font-bold text-foreground">재미있는 학습</h3>
                <p className="text-sm text-muted-foreground">게임처럼 즐겁게 배울 수 있어요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐾</span>
              <div className="text-left">
                <h3 className="font-bold text-foreground">펫 키우기</h3>
                <p className="text-sm text-muted-foreground">게임을 하고 귀여운 펫을 키워보세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <Button 
          size="lg" 
          className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 mb-4"
          onClick={() => navigate('/literacy-test')}
        >
          게임 시작하기 →
        </Button>

        <Button 
          variant="outline"
          size="lg" 
          className="w-full text-lg py-6"
          onClick={() => navigate('/pet-care')}
        >
          🐾 펫 보러가기
        </Button>
      </div>
    </div>
  );
};

export default Index;
