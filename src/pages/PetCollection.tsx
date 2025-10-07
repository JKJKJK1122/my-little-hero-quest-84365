import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Star } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
  growth_stage: 'egg' | 'baby' | 'adult';
  fully_grown_at?: string;
}

const PetCollection = () => {
  const navigate = useNavigate();
  const [adultPets, setAdultPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPetCollection();
  }, []);

  const loadPetCollection = () => {
    try {
      const collection = localStorage.getItem('petCollection');
      const pets = collection ? JSON.parse(collection) : [];
      setAdultPets(pets.filter((pet: Pet) => pet.growth_stage === 'adult'));
      setLoading(false);
    } catch (error) {
      console.error('Error loading pet collection:', error);
      setLoading(false);
    }
  };

  const getPetEmoji = (type: string) => {
    switch (type) {
      case 'dragon':
        return '🐉';
      case 'cat':
        return '🐈';
      case 'dog':
        return '🐕';
      default:
        return '🦜';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">컬렉션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/pet-care')}
            className="rounded-full bg-white shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">펫 컬렉션</h1>
            <p className="text-sm text-muted-foreground">다 자란 펫들을 모아보세요!</p>
          </div>
        </div>

        {/* 컬렉션 카운트 */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={24} className="text-yellow-500" />
              <span className="font-bold text-foreground">보유 펫</span>
            </div>
            <span className="text-2xl font-bold text-primary">{adultPets.length}</span>
          </div>
        </Card>

        {adultPets.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {adultPets.map((pet) => (
              <Card key={pet.id} className="p-4 hover:shadow-lg transition-all">
                <div className="text-center">
                  <div className="text-5xl mb-2">{getPetEmoji(pet.type)}</div>
                  <h3 className="font-bold text-foreground mb-1">{pet.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(pet.fully_grown_at || '').toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🥚</div>
            <h2 className="text-xl font-bold text-primary mb-2">아직 펫이 없어요</h2>
            <p className="text-muted-foreground mb-4">
              게임을 완료하고 펫을 키워보세요!
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              게임하러 가기
            </Button>
          </Card>
        )}

        {/* 안내 메시지 */}
        {adultPets.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-center text-sm text-muted-foreground">
              🎯 테마를 완료하면 더 많은 펫을 모을 수 있어요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetCollection;
