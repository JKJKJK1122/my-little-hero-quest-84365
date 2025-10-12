import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { ArrowLeft, Star, Plus, X, Edit2, Heart, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getPetEmoji, getPetByType, getTierText, getTierColor } from '@/utils/petUtils';

interface Pet {
  id: string;
  name: string;
  type: string;
  tier?: 1 | 2 | 3;
  growth_stage: 'egg' | 'baby' | 'teen' | 'adult';
  hunger_level: number;
  happiness_level: number;
  feedCount: number;
  created_at?: string;
  hatched_at?: string;
  teen_at?: string;
  adult_at?: string;
}

const PetStorage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [petStorage, setPetStorage] = useState<Pet[]>([]);
  const [activePets, setActivePets] = useState<string[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [foodCount, setFoodCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; pet: Pet | null}>({
    open: false,
    pet: null
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storage = localStorage.getItem('petStorage');
      const pets = storage ? JSON.parse(storage) : [];
      setPetStorage(pets);

      const active = localStorage.getItem('activePets');
      setActivePets(active ? JSON.parse(active) : []);

      const food = localStorage.getItem('foodCount');
      setFoodCount(food ? parseInt(food) : 0);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'egg': return '알';
      case 'baby': return '아기';
      case 'teen': return '청소년';
      case 'adult': return '성체';
      default: return '알';
    }
  };

  const toggleActivePet = (petId: string) => {
    let newActivePets: string[];
    if (activePets.includes(petId)) {
      newActivePets = activePets.filter(id => id !== petId);
    } else {
      newActivePets = [...activePets, petId];
    }
    setActivePets(newActivePets);
    localStorage.setItem('activePets', JSON.stringify(newActivePets));
  };

  const feedPet = (pet: Pet) => {
    if (foodCount <= 0) {
      toast({
        title: "먹이가 부족해요! 🍎",
        description: "게임을 하고 먹이를 모아주세요!",
        variant: "destructive"
      });
      return;
    }

    // 먹이 차감
    const newFoodCount = foodCount - 1;
    setFoodCount(newFoodCount);
    localStorage.setItem('foodCount', newFoodCount.toString());

    // 펫 업데이트
    const updatedPet = {
      ...pet,
      hunger_level: Math.min(100, pet.hunger_level + 20),
      happiness_level: Math.min(100, pet.happiness_level + 20),
      feedCount: pet.feedCount + 1
    };

    // 성장 체크
    checkGrowth(updatedPet);

    toast({
      title: "냠냠! 🍎",
      description: `${pet.name}이(가) 기뻐해요!`,
    });
  };

  const checkGrowth = (pet: Pet) => {
    let updatedPet = { ...pet };
    let growthMessage = '';

    // 알 -> 아기 (먹이 5개)
    if (pet.growth_stage === 'egg' && pet.feedCount >= 5) {
      updatedPet = {
        ...updatedPet,
        growth_stage: 'baby',
        hatched_at: new Date().toISOString(),
        feedCount: 0
      };
      growthMessage = `${pet.name}이(가) 알에서 깨어났어요! 🐣`;
    }
    // 아기 -> 청소년 (먹이 5개)
    else if (pet.growth_stage === 'baby' && pet.feedCount >= 5) {
      updatedPet = {
        ...updatedPet,
        growth_stage: 'teen',
        teen_at: new Date().toISOString(),
        feedCount: 0
      };
      growthMessage = `${pet.name}이(가) 청소년이 되었어요! 🌟`;
    }
    // 청소년 -> 성체 (먹이 5개)
    else if (pet.growth_stage === 'teen' && pet.feedCount >= 5) {
      updatedPet = {
        ...updatedPet,
        growth_stage: 'adult',
        adult_at: new Date().toISOString(),
        feedCount: 0
      };
      growthMessage = `축하합니다! ${pet.name}이(가) 완전히 다 자랐어요! ✨`;
    }

    // 펫 저장
    const updatedStorage = petStorage.map(p => 
      p.id === pet.id ? updatedPet : p
    );
    setPetStorage(updatedStorage);
    localStorage.setItem('petStorage', JSON.stringify(updatedStorage));

    if (growthMessage) {
      toast({
        title: "성장했어요! 🎉",
        description: growthMessage,
      });
    }

    // 선택된 펫 업데이트
    if (selectedPet?.id === pet.id) {
      setSelectedPet(updatedPet);
    }
  };

  const saveName = () => {
    if (!selectedPet || !newName.trim()) return;

    const updatedPet = { ...selectedPet, name: newName.trim() };
    const updatedStorage = petStorage.map(p => 
      p.id === selectedPet.id ? updatedPet : p
    );
    setPetStorage(updatedStorage);
    localStorage.setItem('petStorage', JSON.stringify(updatedStorage));
    setSelectedPet(updatedPet);
    setEditingName(false);

    toast({
      title: "이름 변경 완료! ✏️",
      description: `이제 ${newName}이에요!`,
    });
  };

  const getNextStageProgress = (pet: Pet) => {
    if (pet.growth_stage === 'adult') return 100;
    return (pet.feedCount / 5) * 100;
  };

  const handleDeletePet = (e: React.MouseEvent, pet: Pet) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, pet });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.pet) return;
    
    try {
      setDeleting(true);
      
      // 펫 삭제
      const updatedStorage = petStorage.filter(p => p.id !== deleteDialog.pet!.id);
      setPetStorage(updatedStorage);
      localStorage.setItem('petStorage', JSON.stringify(updatedStorage));

      // 활성 펫 목록에서도 제거
      const updatedActivePets = activePets.filter(id => id !== deleteDialog.pet!.id);
      setActivePets(updatedActivePets);
      localStorage.setItem('activePets', JSON.stringify(updatedActivePets));

      // 선택된 펫이면 다이얼로그도 닫기
      if (selectedPet?.id === deleteDialog.pet!.id) {
        setSelectedPet(null);
      }

      toast({
        title: "삭제 완료! 🗑️",
        description: `${deleteDialog.pet!.name}을(를) 삭제했습니다.`,
      });

      setDeleteDialog({ open: false, pet: null });
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        title: "삭제 실패",
        description: "펫을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, pet: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">펫 보관함을 불러오는 중...</p>
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
            onClick={() => navigate('/main-menu')}
            className="rounded-full bg-white shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">🐾 펫 보관함</h1>
            <p className="text-sm text-muted-foreground">펫을 선택해서 키워보세요!</p>
          </div>
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

        {/* 활성 펫 섹션 */}
        {activePets.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-primary mb-3">🌟 키우는 중인 펫</h2>
            <div className="grid grid-cols-2 gap-3">
              {petStorage
                .filter(pet => activePets.includes(pet.id))
                .map(pet => (
                  <Card 
                    key={pet.id}
                    className="p-3 hover:shadow-lg transition-all cursor-pointer relative"
                    onClick={() => setSelectedPet(pet)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActivePet(pet.id);
                      }}
                    >
                      <X size={14} />
                    </Button>
                    <div className="text-center">
                      <div className="text-4xl mb-1">{getPetEmoji(pet.type, pet.growth_stage)}</div>
                      <h3 className="font-bold text-sm text-foreground truncate">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground">{getStageText(pet.growth_stage)}</p>
                      <div className="mt-2">
                        <Progress value={getNextStageProgress(pet)} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {pet.growth_stage === 'adult' ? '완성!' : `${pet.feedCount}/5`}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* 전체 펫 보관함 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-3">📦 전체 펫 ({petStorage.length})</h2>
          {petStorage.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {petStorage.map(pet => {
                const isActive = activePets.includes(pet.id);
                return (
                  <Card 
                    key={pet.id}
                    className={`p-3 hover:shadow-lg transition-all cursor-pointer relative ${isActive ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedPet(pet)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDeletePet(e, pet)}
                    >
                      <Trash2 size={12} />
                    </Button>
                    <div className="text-center">
                      <div className="text-3xl mb-1">{getPetEmoji(pet.type, pet.growth_stage)}</div>
                      <h3 className="font-bold text-xs text-foreground truncate">{pet.name}</h3>
                      <p className="text-xs text-muted-foreground">{getStageText(pet.growth_stage)}</p>
                      {pet.tier && (
                        <p className={`text-xs font-bold ${getTierColor(pet.tier)}`}>
                          {getTierText(pet.tier)}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="text-6xl mb-3">🥚</div>
              <h3 className="font-bold text-primary mb-2">아직 펫이 없어요</h3>
              <p className="text-sm text-muted-foreground mb-3">
                게임을 완료하고 펫을 받아보세요!
              </p>
              <Button onClick={() => navigate('/main-menu')} className="w-full">
                게임하러 가기
              </Button>
            </Card>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="text-center text-sm text-muted-foreground">
            💡 펫을 선택하면 먹이를 주고 키울 수 있어요!<br/>
            🎮 테마 게임을 완료하면 새로운 펫을 받을 수 있어요!
          </p>
        </div>
      </div>

      {/* 펫 상세 다이얼로그 */}
      <Dialog open={!!selectedPet} onOpenChange={(open) => !open && setSelectedPet(null)}>
        <DialogContent className="mx-auto max-w-sm">
          {selectedPet && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">
                  <div className="text-6xl mb-2">{getPetEmoji(selectedPet.type, selectedPet.growth_stage)}</div>
                  {editingName ? (
                    <div className="flex gap-2 items-center justify-center">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-center"
                        placeholder="새 이름"
                      />
                      <Button size="sm" onClick={saveName}>저장</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>취소</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <span>{selectedPet.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingName(true);
                          setNewName(selectedPet.name);
                        }}
                      >
                        <Edit2 size={14} />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {getStageText(selectedPet.growth_stage)} 단계
                  </p>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* 상태 바 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      배고픔
                    </span>
                    <span className="text-sm font-bold">{selectedPet.hunger_level}%</span>
                  </div>
                  <Progress value={selectedPet.hunger_level} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Sparkles size={16} className="text-yellow-500" />
                      행복도
                    </span>
                    <span className="text-sm font-bold">{selectedPet.happiness_level}%</span>
                  </div>
                  <Progress value={selectedPet.happiness_level} className="h-2" />
                </div>

                {/* 성장 진행도 */}
                {selectedPet.growth_stage !== 'adult' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">다음 단계까지</span>
                      <span className="text-sm font-bold">{selectedPet.feedCount}/5</span>
                    </div>
                    <Progress value={getNextStageProgress(selectedPet)} className="h-2" />
                  </div>
                )}

                {/* 버튼들 */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => feedPet(selectedPet)}
                    className="flex-1"
                    disabled={foodCount <= 0}
                  >
                    🍎 먹이 주기
                  </Button>
                  <Button
                    variant={activePets.includes(selectedPet.id) ? "destructive" : "default"}
                    onClick={() => toggleActivePet(selectedPet.id)}
                    className="flex-1"
                  >
                    {activePets.includes(selectedPet.id) ? (
                      <>
                        <X size={16} className="mr-1" />
                        키우기 중지
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="mr-1" />
                        키우기 시작
                      </>
                    )}
                  </Button>
                </div>

                {/* 티어 표시 */}
                {selectedPet.tier && (
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <p className="text-center">
                      <span className={`text-sm font-bold ${getTierColor(selectedPet.tier)}`}>
                        {getTierText(selectedPet.tier)} 등급
                      </span>
                    </p>
                  </div>
                )}

                {/* 힌트 */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    {selectedPet.growth_stage === 'adult' 
                      ? '🎉 이 펫은 완전히 자랐어요!' 
                      : `💡 먹이를 ${5 - selectedPet.feedCount}개 더 주면 성장해요!`}
                  </p>
                </div>

                {/* 삭제 버튼 */}
                <Button
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePet(e as any, selectedPet);
                  }}
                  className="w-full"
                  size="sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  펫 삭제
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent className="mx-auto max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={20} />
              펫 삭제 확인
            </DialogTitle>
            <DialogDescription className="text-left">
              <strong>'{deleteDialog.pet?.name}'</strong>을(를) 삭제하시겠습니까?
              <br /><br />
              <span className="text-red-600">
                • 삭제된 펫은 복구할 수 없습니다
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={deleting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetStorage;
