import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Sparkles, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
  growth_stage: 'egg' | 'baby' | 'adult';
  hunger_level: number;
  happiness_level: number;
  hatched_at?: string;
  fully_grown_at?: string;
}

const PetCare = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [foodCount, setFoodCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    try {
      // 로컬 스토리지에서 먹이 개수 가져오기
      const savedFoodCount = localStorage.getItem('foodCount');
      setFoodCount(savedFoodCount ? parseInt(savedFoodCount) : 0);

      // 로컬 스토리지에서 현재 펫 가져오기
      const savedPet = localStorage.getItem('currentPet');
      if (savedPet) {
        setCurrentPet(JSON.parse(savedPet));
      } else {
        // 첫 펫 생성
        const newPet: Pet = {
          id: Date.now().toString(),
          name: '첫 번째 알',
          type: 'dragon',
          growth_stage: 'egg',
          hunger_level: 50,
          happiness_level: 50,
        };
        setCurrentPet(newPet);
        localStorage.setItem('currentPet', JSON.stringify(newPet));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading local data:', error);
      setLoading(false);
    }
  };

  const feedPet = () => {
    if (!currentPet) return;
    
    if (foodCount <= 0) {
      toast({
        title: "먹이가 부족해요! 🍎",
        description: "게임을 하고 먹이를 모아주세요!",
        variant: "destructive"
      });
      return;
    }

    try {
      // 펫의 배고픔과 행복도 증가
      const newHunger = Math.min(100, currentPet.hunger_level + 20);
      const newHappiness = Math.min(100, currentPet.happiness_level + 15);

      const updatedPet = {
        ...currentPet,
        hunger_level: newHunger,
        happiness_level: newHappiness,
      };
      
      setCurrentPet(updatedPet);
      localStorage.setItem('currentPet', JSON.stringify(updatedPet));

      const newFoodCount = foodCount - 1;
      setFoodCount(newFoodCount);
      localStorage.setItem('foodCount', newFoodCount.toString());

      toast({
        title: "냠냠! 🍎",
        description: `${currentPet.name}이(가) 기뻐해요!`,
      });

      // 성장 체크
      checkGrowth(updatedPet);
    } catch (error) {
      console.error('Error feeding pet:', error);
      toast({
        title: "오류가 발생했어요",
        variant: "destructive"
      });
    }
  };

  const checkGrowth = (pet: Pet) => {
    // 알에서 아기로 성장 (배고픔 > 60, 행복도 > 60)
    if (pet.growth_stage === 'egg' && pet.hunger_level > 60 && pet.happiness_level > 60) {
      const updatedPet = {
        ...pet,
        growth_stage: 'baby' as const,
        hatched_at: new Date().toISOString()
      };
      setCurrentPet(updatedPet);
      localStorage.setItem('currentPet', JSON.stringify(updatedPet));

      toast({
        title: "축하합니다! 🎉",
        description: `${pet.name}이(가) 알에서 깨어났어요!`,
      });
    }
    // 아기에서 어른으로 성장 (배고픔 > 80, 행복도 > 80)
    else if (pet.growth_stage === 'baby' && pet.hunger_level > 80 && pet.happiness_level > 80) {
      const updatedPet = {
        ...pet,
        growth_stage: 'adult' as const,
        fully_grown_at: new Date().toISOString()
      };
      setCurrentPet(updatedPet);
      localStorage.setItem('currentPet', JSON.stringify(updatedPet));

      // 컬렉션에 추가
      const collection = localStorage.getItem('petCollection');
      const petCollection = collection ? JSON.parse(collection) : [];
      petCollection.push(updatedPet);
      localStorage.setItem('petCollection', JSON.stringify(petCollection));

      toast({
        title: "축하합니다! 🌟",
        description: `${pet.name}이(가) 다 자랐어요!`,
      });

      // 새로운 알 생성
      setTimeout(() => {
        const newPet: Pet = {
          id: Date.now().toString(),
          name: '새로운 알',
          type: ['dragon', 'cat', 'dog', 'bird'][Math.floor(Math.random() * 4)],
          growth_stage: 'egg',
          hunger_level: 50,
          happiness_level: 50,
        };
        setCurrentPet(newPet);
        localStorage.setItem('currentPet', JSON.stringify(newPet));
      }, 2000);
    }
  };

  const getPetEmoji = () => {
    if (!currentPet) return '🥚';
    
    switch (currentPet.growth_stage) {
      case 'egg':
        return '🥚';
      case 'baby':
        return currentPet.type === 'dragon' ? '🐲' : 
               currentPet.type === 'cat' ? '🐱' :
               currentPet.type === 'dog' ? '🐶' : '🐣';
      case 'adult':
        return currentPet.type === 'dragon' ? '🐉' : 
               currentPet.type === 'cat' ? '🐈' :
               currentPet.type === 'dog' ? '🐕' : '🦜';
      default:
        return '🥚';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">펫을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full bg-white shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-primary">나의 펫</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pet-collection')}
            className="rounded-full bg-white shadow-md"
          >
            <Trophy size={20} className="text-yellow-600" />
          </Button>
        </div>

        {/* 먹이 개수 */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍎</span>
              <span className="font-bold text-foreground">보유 먹이</span>
            </div>
            <span className="text-2xl font-bold text-primary">{foodCount}</span>
          </div>
        </Card>

        {currentPet ? (
          <>
            {/* 펫 표시 */}
            <Card className="p-6 mb-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-primary mb-2">{currentPet.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentPet.growth_stage === 'egg' && '알 단계 🥚'}
                  {currentPet.growth_stage === 'baby' && '아기 단계 🐣'}
                  {currentPet.growth_stage === 'adult' && '어른 단계 ⭐'}
                </p>
                
                <div className="text-9xl mb-6 animate-bounce">
                  {getPetEmoji()}
                </div>

                {/* 상태 바 */}
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Heart size={16} className="text-red-500" />
                        배고픔
                      </span>
                      <span className="text-sm font-bold">{currentPet.hunger_level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${currentPet.hunger_level}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Sparkles size={16} className="text-yellow-500" />
                        행복도
                      </span>
                      <span className="text-sm font-bold">{currentPet.happiness_level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${currentPet.happiness_level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 먹이 주기 버튼 */}
                <Button 
                  onClick={feedPet}
                  className="w-full text-lg py-6"
                  disabled={foodCount <= 0}
                >
                  🍎 먹이 주기
                </Button>

                {/* 성장 힌트 */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    {currentPet.growth_stage === 'egg' && '💡 배고픔과 행복도를 60 이상으로 올려보세요!'}
                    {currentPet.growth_stage === 'baby' && '💡 배고픔과 행복도를 80 이상으로 올려보세요!'}
                    {currentPet.growth_stage === 'adult' && '🎉 펫이 다 자랐어요! 새로운 테마를 완료하면 새 알을 받을 수 있어요!'}
                  </p>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-6 text-center">
            <div className="text-6xl mb-4">🥚</div>
            <h2 className="text-xl font-bold text-primary mb-2">펫이 없어요</h2>
            <p className="text-muted-foreground mb-4">
              테마 게임을 완료하면 새로운 알을 받을 수 있어요!
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              게임하러 가기
            </Button>
          </Card>
        )}

        {/* 안내 메시지 */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            🎮 게임을 하고 먹이를 모아서 펫을 키워보세요!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetCare;
