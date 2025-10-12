import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Star, RotateCcw, Volume2, Mic, MicOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SCENARIOS } from '@/data/GameScenarios';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface Scenario {
  id: string;
  title: string;
  situation: string;
  options: {
    id: string;
    text: string;
    option_order: number;
    is_correct: boolean;
  }[];
}

const GamePlay = () => {
  const navigate = useNavigate();
  const { theme } = useParams<{ theme: string }>();
  const { toast } = useToast();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // 세션 ID 생성 (임시로 timestamp 사용)
  const userSession = `session_${Date.now()}`;

  // TTS 및 음성인식
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    enabled: !showResult,
    onResult: (transcript) => {
      // "a", "b", "c" 등을 인식
      const match = transcript.match(/[abc에이비씨]/i);
      if (match && !showResult) {
        let index = -1;
        const char = match[0].toLowerCase();
        if (char === 'a' || char === '에이') index = 0;
        else if (char === 'b' || char === '비') index = 1;
        else if (char === 'c' || char === '씨') index = 2;
        
        if (index >= 0 && index < currentScenario?.options.length) {
          handleOptionSelect(index);
        }
      }
    }
  });

  useEffect(() => {
    // localStorage에서 난이도 설정 확인
    const savedLevel = localStorage.getItem('literacyLevel') as 'beginner' | 'intermediate' | 'advanced';
    console.log('📚 Saved literacy level from localStorage:', savedLevel);
    if (savedLevel && savedLevel !== difficultyLevel) {
      setDifficultyLevel(savedLevel);
      console.log('📚 Setting difficulty level to:', savedLevel);
    }
  }, [theme]); // difficultyLevel 제거

  useEffect(() => {
    console.log('📚 Difficulty level changed, reloading scenarios:', difficultyLevel);
    loadScenarios();
  }, [difficultyLevel]); // 별도 useEffect로 분리

  const adjustScenariosDifficulty = (scenarios: Scenario[]) => {
    return scenarios.map(scenario => {
      const adjustedTitle = adjustTextByDifficulty(scenario.title, 'title');
      const adjustedSituation = adjustTextByDifficulty(scenario.situation, 'situation');
      const adjustedOptions = scenario.options.map(option => ({
        ...option,
        text: adjustTextByDifficulty(option.text, 'option')
      }));

      return {
        ...scenario,
        title: adjustedTitle,
        situation: adjustedSituation,
        options: adjustedOptions
      };
    });
  };

  const adjustTextByDifficulty = (text: string, type: 'title' | 'situation' | 'option') => {
    console.log(`🔧 Adjusting ${type} for difficulty ${difficultyLevel}:`, text);
    
    if (difficultyLevel === 'beginner') {
      // 초급: 간단한 어휘로 변경하되 원본 길이 유지
      let adjusted = text;
      
      if (type === 'title') {
        adjusted = text.replace(/숙제를 안 해왔을 때/g, '숙제 안 했어요')
                      .replace(/친구가 괴롭힘을 당할 때/g, '친구가 힘들어해요')
                      .replace(/교실에서 떠들 때/g, '교실에서 시끄러워요')
                      .replace(/어려운/g, '힘든')
                      .replace(/복잡한/g, '어려운');
      } else if (type === 'situation') {
        adjusted = text.replace(/습니다|하세요|했습니다/g, '해요')
                      .replace(/받고 있어요/g, '당해요')
                      .replace(/선생님이|선생님께서/g, '선생님이')
                      .replace(/보여달라고 하셨어요/g, '보여달래요')
                      .replace(/어떻게 해야 할까요/g, '뭘 해야 할까요');
      } else {
        adjusted = text.replace(/합니다|하세요/g, '해요')
                      .replace(/말씀드린다/g, '말해요')
                      .replace(/약속한다/g, '약속해요')
                      .replace(/선택한다/g, '골라요');
      }
      
      console.log(`🔧 Beginner adjusted:`, adjusted);
      return adjusted;
      
    } else if (difficultyLevel === 'advanced') {
      // 고급: 원본 유지하되 어휘만 고급화
      let adjusted = text;
      
      if (type === 'title') {
        // 제목은 원본 유지
        adjusted = text;
      } else if (type === 'situation') {
        // 상황 설명도 원본 유지
        adjusted = text;
      } else {
        // 선택지만 어휘 고급화
        if (text.includes('말해요')) {
          adjusted = text.replace('말해요', '말씀드린다');
        }
        if (text.includes('약속해요')) {
          adjusted = text.replace('약속해요', '약속한다');
        }
        if (text.includes('골라요')) {
          adjusted = text.replace('골라요', '선택한다');
        }
      }
      
      console.log(`🔧 Advanced adjusted:`, adjusted);
      return adjusted;
    }
    
    console.log(`🔧 Intermediate (unchanged):`, text);
    return text; // intermediate는 원본 유지
  };


const loadScenarios = async () => {
  try {
    setLoading(true);

    // Supabase에서 메인 카테고리 + 현재 테마의 시나리오 불러오기
    const { data, error } = await supabase
      .from('scenarios')
      .select(`
        id,
        title,
        situation,
        scenario_options (
          id,
          text,
          option_order,
          is_correct
        )
      `)
      .eq('category', 'main')
      .eq('theme', theme);

    if (error) throw error;

    // 데이터가 없으면 샘플 데이터 생성 후 재조회
    if (!data || data.length === 0) {
      await createSampleData();

      const { data: seeded, error: seededErr } = await supabase
        .from('scenarios')
        .select(`
          id,
          title,
          situation,
          scenario_options (
            id,
            text,
            option_order,
            is_correct
          )
        `)
        .eq('category', 'main')
        .eq('theme', theme);

      if (seededErr) throw seededErr;

      const formattedSeeded = (seeded || []).map((scenario: any) => ({
        id: scenario.id,
        title: adjustTextByDifficulty(scenario.title, 'title'),
        situation: adjustTextByDifficulty(scenario.situation, 'situation'),
        options: scenario.scenario_options
          .sort((a: any, b: any) => a.option_order - b.option_order)
          .map((opt: any) => ({
            ...opt,
            text: adjustTextByDifficulty(opt.text, 'option'),
          })),
      }));

      setScenarios(formattedSeeded);
      return;
    }

    const formatted = data.map((scenario: any) => ({
      id: scenario.id,
      title: adjustTextByDifficulty(scenario.title, 'title'),
      situation: adjustTextByDifficulty(scenario.situation, 'situation'),
      options: scenario.scenario_options
        .sort((a: any, b: any) => a.option_order - b.option_order)
        .map((opt: any) => ({
          ...opt,
          text: adjustTextByDifficulty(opt.text, 'option'),
        })),
    }));

    setScenarios(formatted);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

  const createSampleData = async () => {
    // DB에 데이터가 없을 경우를 위한 기본 처리
    console.log('No scenarios found for theme:', theme);
    toast({
      title: "시나리오가 없습니다",
      description: "이 테마에 대한 시나리오가 아직 없습니다.",
      variant: "destructive"
    });
  };
  const handleNext = async () => {
    if (isCorrect) {
      // 정답인 경우 다음 문제로
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
        resetQuestion();
      } else {
        // 모든 문제 완료 - 새 알 지급 (로컬스토리지)
        try {
          const { getRandomPet, getPetByType } = await import('@/utils/petUtils');
          const randomPet = getRandomPet();
          
          const newPet = {
            id: Date.now().toString(),
            name: `${randomPet.name} 알`,
            type: randomPet.type,
            tier: randomPet.tier,
            growth_stage: 'egg',
            hunger_level: 0,
            happiness_level: 0,
            feedCount: 0,
            created_at: new Date().toISOString()
          };

          // 펫 보관함에 추가
          const storage = localStorage.getItem('petStorage');
          const petStorage = storage ? JSON.parse(storage) : [];
          petStorage.push(newPet);
          localStorage.setItem('petStorage', JSON.stringify(petStorage));

          const tierText = randomPet.tier === 1 ? '전설' : randomPet.tier === 2 ? '희귀' : '일반';
          toast({
            title: "축하합니다! 🎉",
            description: `테마를 완료했어요! ${tierText} 등급 ${randomPet.name} 알을 받았습니다! 🥚`,
          });
        } catch (error) {
          console.error('Error giving egg reward:', error);
        }
        
        navigate('/main-menu');
      }
    } else {
      // 오답인 경우 다시 도전
      resetQuestion();
    }
  };

  const handleOptionSelect = async (index: number) => {
    setSelectedOption(index);
    const correct = currentScenario.options[index].is_correct;
    setIsCorrect(correct);
    setShowResult(true);

    // 진행 상황 저장
    try {
      await supabase
        .from('user_progress')
        .insert([{
          scenario_id: currentScenario.id,
          user_id: 'anonymous', // 임시 사용자 ID
          user_session: userSession,
          is_correct: correct,
          attempts: 1
        }]);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const resetQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    stopSpeaking();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">문제를 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">아직 문제가 준비되지 않았어요.</p>
          <Button onClick={() => navigate('/')}>돌아가기</Button>
        </Card>
      </div>
    );
  }

  const currentScenario = scenarios[currentScenarioIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-white shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">문제 {currentScenarioIndex + 1} / {scenarios.length}</p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="w-10"></div>
        </div>

        {/* 문제 카드 */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className={`font-bold text-primary flex-1 ${difficultyLevel === 'beginner' ? 'text-lg' : difficultyLevel === 'intermediate' ? 'text-base' : 'text-sm'}`}>
              {currentScenario.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speak(currentScenario.title)}
              className="flex-shrink-0 h-8 w-8"
              disabled={isSpeaking}
            >
              <Volume2 size={18} className="text-primary" />
            </Button>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-foreground flex-1 ${difficultyLevel === 'beginner' ? 'text-base leading-relaxed' : difficultyLevel === 'intermediate' ? 'text-sm leading-relaxed' : 'text-sm leading-normal'}`}>
                {currentScenario.situation}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speak(currentScenario.situation)}
                className="flex-shrink-0 h-8 w-8"
                disabled={isSpeaking}
              >
                <Volume2 size={18} className="text-blue-600" />
              </Button>
            </div>
          </div>
          
          {/* 일러스트 영역 (임시) */}
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-8 rounded-lg mb-4 text-center">
            <div className="text-6xl mb-2">🤔</div>
            <p className="text-sm text-muted-foreground">어떻게 해야 할까요?</p>
          </div>
        </Card>

        {/* 음성인식 버튼 */}
        <div className="flex justify-center mb-4">
          <Button
            variant={isListening ? "default" : "outline"}
            onClick={toggleListening}
            className="gap-2"
            disabled={showResult}
          >
            {isListening ? <Mic className="animate-pulse" size={18} /> : <MicOff size={18} />}
            {isListening ? '음성 인식 중...' : '음성으로 답하기'}
          </Button>
        </div>

        {/* 선택지 */}
        <div className="flex flex-col gap-3 mb-6 w-full">
          {currentScenario.options.map((option, index) => {
            let buttonClass = "p-4 text-left h-auto min-h-[60px] border-2 transition-all duration-300 w-full";
            
            if (showResult) {
              if (option.is_correct) {
                buttonClass += " bg-green-100 border-green-500 text-green-700";
              } else if (selectedOption === index) {
                buttonClass += " bg-red-100 border-red-500 text-red-700";
              } else {
                buttonClass += " bg-gray-100 border-gray-300 text-gray-600";
              }
            } else if (selectedOption === index) {
              buttonClass += " border-primary bg-blue-50";
            } else {
              buttonClass += " border-gray-200 hover:border-primary hover:bg-blue-50";
            }

            return (
              <div key={option.id} className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-start gap-3 w-full min-w-0">
                    <span className="font-bold text-primary flex-shrink-0 min-w-[20px] mt-0.5">
                      {String.fromCharCode(97 + index)}.
                    </span>
                    <span className="text-sm leading-relaxed break-words whitespace-pre-wrap flex-1 min-w-0">{option.text}</span>
                    {showResult && option.is_correct && (
                      <Star className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                    )}
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => speak(`${String.fromCharCode(97 + index)}. ${option.text}`)}
                  className="flex-shrink-0 h-auto"
                  disabled={isSpeaking || showResult}
                >
                  <Volume2 size={18} />
                </Button>
              </div>
            );
          })}
        </div>

        {/* 결과 모달 */}
        <Dialog open={showResult} onOpenChange={() => {}}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogTitle className="sr-only">
              {isCorrect ? "정답" : "오답"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isCorrect ? "정답을 맞혔습니다" : "다시 도전해보세요"}
            </DialogDescription>
            {isCorrect ? (
              <div className="text-center text-green-600 p-4">
                <div className="text-6xl mb-4">🎉</div>
                <p className="font-bold text-lg mb-2">정답이에요! 잘했어요!</p>
                <p className="text-sm text-muted-foreground mb-6">다음 문제에 도전해보세요!</p>
                <Button 
                  className="w-full" 
                  onClick={handleNext}
                >
                  {currentScenarioIndex < scenarios.length - 1 ? '다음 문제' : '완료'}
                </Button>
              </div>
            ) : (
              <div className="text-center text-orange-600 p-4">
                <div className="text-6xl mb-4">💪</div>
                <p className="font-bold text-lg mb-2">다시 한번 생각해봐요!</p>
                <p className="text-sm text-muted-foreground mb-6">정답을 다시 선택해보세요!</p>
                <Button 
                  className="w-full" 
                  onClick={handleNext}
                >
                  다시 도전
                  <RotateCcw className="ml-2" size={16} />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Lovable Cloud DB에서 모든 시나리오 데이터를 가져옵니다
// 더 이상 하드코딩된 샘플 데이터는 필요하지 않습니다

export default GamePlay;