import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Egg, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pet {
  id: string;
  name: string;
  type: string;
  growth_stage: string;
  hunger_level: number;
  happiness_level: number;
}

interface Profile {
  food_count: number;
}

const PetGarden = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetsAndProfile();
  }, []);

  const fetchPetsAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 프로필 가져오기
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    // 펫 가져오기
    const { data: petsData } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setPets(petsData || []);
    setLoading(false);
  };

  const feedPet = async (petId: string) => {
    if (!profile || profile.food_count <= 0) {
      toast({
        title: "먹이가 부족해요!",
        description: "게임을 플레이해서 먹이를 모아주세요.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 먹이 감소
    await supabase
      .from("profiles")
      .update({ food_count: profile.food_count - 1 })
      .eq("id", user.id);

    // 펫 배고픔 증가
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      const newHunger = Math.min(100, pet.hunger_level + 20);
      await supabase
        .from("pets")
        .update({ hunger_level: newHunger })
        .eq("id", petId);

      toast({
        title: "냠냠!",
        description: "펫이 행복해합니다! 🎉",
      });

      fetchPetsAndProfile();
    }
  };

  const getPetEmoji = (stage: string, type: string) => {
    if (stage === "egg") return "🥚";
    if (stage === "baby") return "🐣";
    if (stage === "adult") {
      if (type === "cat") return "🐱";
      if (type === "dog") return "🐶";
      if (type === "bird") return "🐦";
      if (type === "fish") return "🐠";
      return "🐾";
    }
    return "🐾";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/main-menu")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            메인 메뉴
          </Button>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">먹이: {profile?.food_count || 0}개</span>
            </div>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl text-center">🌸 펫 정원 🌸</CardTitle>
          </CardHeader>
        </Card>

        {pets.length === 0 ? (
          <Card className="p-12 text-center">
            <Egg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">펫이 없어요!</h3>
            <p className="text-muted-foreground mb-4">
              게임 테마를 완료하면 새로운 알을 받을 수 있어요!
            </p>
            <Button onClick={() => navigate("/main-game")}>
              게임하러 가기
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pet.name}</span>
                    <span className="text-4xl">{getPetEmoji(pet.growth_stage, pet.type)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">성장 단계:</span>
                    <span className="font-medium">
                      {pet.growth_stage === "egg" && "알"}
                      {pet.growth_stage === "baby" && "아기"}
                      {pet.growth_stage === "adult" && "성체"}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>배고픔:</span>
                      <span>{pet.hunger_level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${pet.hunger_level}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>행복도:</span>
                      <span>{pet.happiness_level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${pet.happiness_level}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => feedPet(pet.id)}
                    className="w-full gap-2"
                    disabled={pet.hunger_level >= 100}
                  >
                    <Heart className="w-4 h-4" />
                    먹이 주기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetGarden;
