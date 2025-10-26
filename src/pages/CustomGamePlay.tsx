import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Star, RotateCcw, Zap, Trash2, Volume2, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

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

const CustomGamePlay = () => {
  const navigate = useNavigate();
  const { themeName } = useParams<{ themeName: string }>();
  const { toast } = useToast();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [deleteScenarioDialog, setDeleteScenarioDialog] = useState(false);
  const [deletingScenario, setDeletingScenario] = useState(false);

  const userSession = `session_${Date.now()}`;
  const decodedThemeName = decodeURIComponent(themeName || "");

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
        if (char === "a" || char === "에이") index = 0;
        else if (char === "b" || char === "비") index = 1;
        else if (char === "c" || char === "씨") index = 2;

        if (index >= 0 && index < currentScenario?.options.length) {
          handleOptionSelect(index);
        }
      }
    },
  });

  useEffect(() => {
    // localStorage에서 난이도 설정 확인
    const savedLevel = localStorage.getItem("literacyLevel") as "beginner" | "intermediate" | "advanced";
    console.log("📚 Custom - Saved literacy level from localStorage:", savedLevel);
    if (savedLevel && savedLevel !== difficultyLevel) {
      setDifficultyLevel(savedLevel);
      console.log("📚 Custom - Setting difficulty level to:", savedLevel);
    }
  }, [themeName]); // difficultyLevel 제거

  useEffect(() => {
    console.log("📚 Custom - Difficulty level changed, reloading scenarios:", difficultyLevel);
    loadScenarios();
  }, [difficultyLevel]); // 별도 useEffect로 분리

  const adjustScenariosDifficulty = (scenarios: Scenario[]) => {
    return scenarios.map((scenario) => {
      const adjustedTitle = adjustTextByDifficulty(scenario.title, "title");
      const adjustedSituation = adjustTextByDifficulty(scenario.situation, "situation");
      const adjustedOptions = scenario.options.map((option) => ({
        ...option,
        text: adjustTextByDifficulty(option.text, "option"),
      }));

      return {
        ...scenario,
        title: adjustedTitle,
        situation: adjustedSituation,
        options: adjustedOptions,
      };
    });
  };

  const adjustTextByDifficulty = (text: string, type: "title" | "situation" | "option") => {
    console.log(`🔧 Custom - Adjusting ${type} for difficulty ${difficultyLevel}:`, text);

    if (difficultyLevel === "beginner") {
      // 초급: 간단한 어휘로 변경하되 원본 길이 유지
      let adjusted = text;

      if (type === "title") {
        adjusted = text
          .replace(/괴롭힘을 당할 때/g, "힘들어할 때")
          .replace(/대처/g, "해결하기")
          .replace(/어려운/g, "힘든")
          .replace(/복잡한/g, "어려운");
      } else if (type === "situation") {
        adjusted = text
          .replace(/습니다|하셨습니다/g, "어요")
          .replace(/하세요/g, "해요")
          .replace(/어떻게 해야 할까요/g, "뭘 해야 할까요")
          .replace(/놀림을 받고/g, "괴롭힘을 당하고")
          .replace(/복잡한/g, "어려운");
      } else {
        adjusted = text
          .replace(/말씀드리고/g, "말하고")
          .replace(/약속한다/g, "약속해요")
          .replace(/거짓말한다/g, "거짓말해요")
          .replace(/말씀드린다/g, "말해요")
          .replace(/선택한다/g, "골라요");
      }

      console.log(`🔧 Custom - Beginner adjusted:`, adjusted);
      return adjusted;
    } else if (difficultyLevel === "advanced") {
      // 고급: 원본 유지하되 어휘만 고급화
      let adjusted = text;

      if (type === "title") {
        // 제목은 원본 유지
        adjusted = text;
      } else if (type === "situation") {
        // 상황 설명도 원본 유지
        adjusted = text;
      } else {
        // 선택지만 어휘 고급화
        if (text.includes("말하고")) {
          adjusted = text.replace("말하고", "말씀드리고");
        }
        if (text.includes("약속해요")) {
          adjusted = text.replace("약속해요", "약속한다");
        }
        if (text.includes("골라요")) {
          adjusted = text.replace("골라요", "선택한다");
        }
      }

      console.log(`🔧 Custom - Advanced adjusted:`, adjusted);
      return adjusted;
    }

    console.log(`🔧 Custom - Intermediate (unchanged):`, text);
    return text; // intermediate는 원본 유지
  };

  const loadScenarios = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("scenarios")
        .select(
          `
          id,
          title,
          situation,
          scenario_options (
            id,
            text,
            option_order,
            is_correct
          )
        `,
        )
        .eq("category", "custom")
        .eq("theme", decodedThemeName);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "시나리오 없음",
          description: "이 테마에 대한 시나리오를 찾을 수 없습니다.",
          variant: "destructive",
        });
        navigate("/secret-mission");
        return;
      }

      const formattedScenarios = data.map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        situation: scenario.situation,
        options: scenario.scenario_options
          .sort(() => Math.random() - 0.5)
          .map((opt, index) => ({
            ...opt,
            option_order: index,
          })),
      }));

      // 랜덤하게 섞기
      const shuffled = [...formattedScenarios].sort(() => Math.random() - 0.5);

      // 난이도에 맞게 시나리오 조정
      console.log("Current difficulty level:", difficultyLevel);
      const adjustedScenarios = adjustScenariosDifficulty(shuffled);
      console.log("Adjusted scenarios:", adjustedScenarios);
      setScenarios(adjustedScenarios);
    } catch (error) {
      console.error("Error loading scenarios:", error);
      toast({
        title: "오류",
        description: "시나리오를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionIndex: number) => {
    if (showResult) return;

    setSelectedOption(optionIndex);
    const currentScenario = scenarios[currentScenarioIndex];
    const correctOption = currentScenario.options.find((opt) => opt.is_correct);
    const isAnswerCorrect = optionIndex === correctOption?.option_order;

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    // 정답이면 먹이 지급 (로컬스토리지)
    if (isAnswerCorrect) {
      try {
        const currentFood = parseInt(localStorage.getItem("foodCount") || "0");
        localStorage.setItem("foodCount", (currentFood + 1).toString());
      } catch (error) {
        console.error("Error giving food reward:", error);
      }
    }

    // 진행 상황 저장
    try {
      await supabase.from("user_progress").insert([
        {
          scenario_id: currentScenario.id,
          user_id: "anonymous", // 임시 사용자 ID
          user_session: userSession,
          is_correct: isAnswerCorrect,
          attempts: 1,
        },
      ]);

      // 틀린 경우 오답노트에 추가
      if (!isAnswerCorrect) {
        await supabase.from("wrong_answers").insert([
          {
            scenario_id: currentScenario.id,
            user_id: "anonymous", // 임시 사용자 ID
            correct_count: 0,
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleNext = async () => {
    if (isCorrect) {
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex((prev) => prev + 1);
        resetQuestion();
      } else {
        // 모든 문제 완료 - 새 알 지급 (로컬스토리지)
        try {
          const { getRandomPet } = await import("@/utils/petUtils");
          const randomPet = getRandomPet();

          const newPet = {
            id: Date.now().toString(),
            name: `${randomPet.name} 알`,
            type: randomPet.type,
            tier: randomPet.tier,
            growth_stage: "egg",
            hunger_level: 0,
            happiness_level: 0,
            feedCount: 0,
            created_at: new Date().toISOString(),
          };

          // 펫 보관함에 추가
          const storage = localStorage.getItem("petStorage");
          const petStorage = storage ? JSON.parse(storage) : [];
          petStorage.push(newPet);
          localStorage.setItem("petStorage", JSON.stringify(petStorage));

          const tierText = randomPet.tier === 1 ? "전설" : randomPet.tier === 2 ? "희귀" : "일반";
          toast({
            title: "🎊 비밀 임무 완료!",
            description: `모든 임무를 성공적으로 수행했습니다! ${tierText} 등급 ${randomPet.name} 알을 받았습니다! 🥚`,
          });
        } catch (error) {
          console.error("Error giving egg reward:", error);
        }

        navigate("/secret-mission");
      }
    } else {
      resetQuestion();
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

  const handleDeleteScenario = () => {
    setDeleteScenarioDialog(true);
  };

  const handleConfirmDeleteScenario = async () => {
    if (scenarios.length === 0) return;

    try {
      setDeletingScenario(true);
      const currentScenario = scenarios[currentScenarioIndex];

      // 현재 시나리오의 옵션들 삭제
      const { error: optionsError } = await supabase
        .from("scenario_options")
        .delete()
        .eq("scenario_id", currentScenario.id);

      if (optionsError) throw optionsError;

      // 시나리오 삭제
      const { error: scenarioError } = await supabase.from("scenarios").delete().eq("id", currentScenario.id);

      if (scenarioError) throw scenarioError;

      // 남은 시나리오들로 업데이트
      const updatedScenarios = scenarios.filter((_, index) => index !== currentScenarioIndex);
      setScenarios(updatedScenarios);

      if (updatedScenarios.length === 0) {
        // 모든 문제가 삭제되면 비밀임무 페이지로 이동
        toast({
          title: "문제 삭제 완료",
          description: "모든 문제가 삭제되었습니다.",
        });
        navigate("/secret-mission");
      } else {
        // 현재 인덱스 조정
        const newIndex =
          currentScenarioIndex >= updatedScenarios.length ? updatedScenarios.length - 1 : currentScenarioIndex;
        setCurrentScenarioIndex(newIndex);
        resetQuestion();

        toast({
          title: "문제 삭제 완료",
          description: "문제가 삭제되었습니다.",
        });
      }

      setDeleteScenarioDialog(false);
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast({
        title: "삭제 실패",
        description: "문제를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDeletingScenario(false);
    }
  };

  const handleCancelDeleteScenario = () => {
    setDeleteScenarioDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">비밀 임무를 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">비밀 임무가 준비되지 않았어요.</p>
          <Button onClick={() => navigate("/secret-mission")}>돌아가기</Button>
        </Card>
      </div>
    );
  }

  const currentScenario = scenarios[currentScenarioIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/secret-mission")}
            className="rounded-full bg-white shadow-md"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
              <Zap size={16} className="text-purple-600" />
              임무 {currentScenarioIndex + 1} / {scenarios.length}
            </p>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteScenario}
            className="rounded-full bg-white shadow-md text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={18} />
          </Button>
        </div>

        {/* 문제 카드 */}
        <Card className="p-6 mb-6 border-purple-200">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2
              className={`font-bold text-primary flex-1 ${difficultyLevel === "beginner" ? "text-lg" : difficultyLevel === "intermediate" ? "text-base" : "text-sm"}`}
            >
              {currentScenario.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speak(currentScenario.title)}
              className="flex-shrink-0 h-8 w-8"
              disabled={isSpeaking}
            >
              <Volume2 size={18} className="text-purple-600" />
            </Button>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-100">
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-foreground flex-1 ${difficultyLevel === "beginner" ? "text-base leading-relaxed" : difficultyLevel === "intermediate" ? "text-sm leading-relaxed" : "text-sm leading-normal"}`}
              >
                {currentScenario.situation}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speak(currentScenario.situation)}
                className="flex-shrink-0 h-8 w-8"
                disabled={isSpeaking}
              >
                <Volume2 size={18} className="text-purple-600" />
              </Button>
            </div>
          </div>

          {/* 일러스트 영역 */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 rounded-lg mb-4 text-center">
            <div className="text-6xl mb-2">🤔</div>
            <p className="text-sm text-purple-600 font-medium">어떻게 해야 할까요?</p>
          </div>
        </Card>

        {/* 음성인식 버튼 */}
        <div className="flex justify-center mb-4">
          <Button
            variant={isListening ? "default" : "outline"}
            onClick={toggleListening}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            disabled={showResult}
          >
            {isListening ? <Mic className="animate-pulse" size={18} /> : <MicOff size={18} />}
            {isListening ? "음성 인식 중..." : "음성으로 답하기"}
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
              buttonClass += " border-purple-500 bg-purple-50";
            } else {
              buttonClass += " border-purple-200 hover:border-purple-400 hover:bg-purple-50";
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
                    <span className="font-bold text-purple-600 flex-shrink-0 min-w-[20px] mt-0.5">
                      {String.fromCharCode(97 + index)}.
                    </span>
                    <span className="text-sm leading-relaxed break-words whitespace-pre-wrap flex-1 min-w-0">
                      {option.text}
                    </span>
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
            <DialogTitle className="sr-only">{isCorrect ? "임무 성공" : "임무 실패"}</DialogTitle>
            <DialogDescription className="sr-only">
              {isCorrect ? "임무를 성공했습니다" : "다시 도전해보세요"}
            </DialogDescription>
            {isCorrect ? (
              <div className="text-center text-green-600 p-4">
                <div className="text-6xl mb-4">🎉</div>
                <p className="font-bold text-lg mb-2">임무 성공! 훌륭해요!</p>
                <p className="text-sm text-muted-foreground mb-6">다음 비밀 임무에 도전해보세요!</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleNext}>
                  {currentScenarioIndex < scenarios.length - 1 ? "다음 임무" : "임무 완료"}
                </Button>
              </div>
            ) : (
              <div className="text-center text-orange-600 p-4">
                <div className="text-6xl mb-4">💪</div>
                <p className="font-bold text-lg mb-2">다시 한번 도전해봐요!</p>
                <p className="text-sm text-muted-foreground mb-6">임무를 다시 수행해보세요!</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleNext}>
                  다시 도전
                  <RotateCcw className="ml-2" size={16} />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 문제 삭제 확인 다이얼로그 */}
        <Dialog open={deleteScenarioDialog} onOpenChange={(open) => !open && handleCancelDeleteScenario()}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogTitle className="sr-only">문제 삭제 확인</DialogTitle>
            <DialogDescription className="sr-only">현재 문제를 삭제하시겠습니까?</DialogDescription>
            <div className="text-center p-4">
              <div className="text-6xl mb-4 text-red-500">⚠️</div>
              <p className="font-bold text-lg mb-2 text-red-600">문제 삭제 확인</p>
              <p className="text-sm text-muted-foreground mb-6">
                현재 문제를 삭제하시겠습니까?
                <br />
                <span className="text-red-600 font-medium">삭제된 문제는 복구할 수 없습니다.</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelDeleteScenario}
                  disabled={deletingScenario}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmDeleteScenario}
                  disabled={deletingScenario}
                >
                  {deletingScenario ? (
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomGamePlay;
