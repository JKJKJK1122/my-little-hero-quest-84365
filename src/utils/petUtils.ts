// 펫 티어 시스템

export interface PetType {
  type: string;
  name: string;
  emoji: {
    egg: string;
    baby: string;
    teen: string;
    adult: string;
  };
  tier: 1 | 2 | 3;
}

// 3티어 (70%)
const tier3Pets: PetType[] = [
  { type: 'snake', name: '뱀', emoji: { egg: '🥚', baby: '🐍', teen: '🐍', adult: '🐍✨' }, tier: 3 },
  { type: 'lizard', name: '도마뱀', emoji: { egg: '🥚', baby: '🦎', teen: '🦎', adult: '🦎✨' }, tier: 3 },
  { type: 'frog', name: '개구리', emoji: { egg: '🥚', baby: '🐸', teen: '🐸', adult: '🐸✨' }, tier: 3 },
  { type: 'bird', name: '새', emoji: { egg: '🥚', baby: '🐣', teen: '🐦', adult: '🦜' }, tier: 3 },
  { type: 'ladybug', name: '무당벌레', emoji: { egg: '🥚', baby: '🐞', teen: '🐞', adult: '🐞✨' }, tier: 3 },
  { type: 'gorilla', name: '고릴라', emoji: { egg: '🥚', baby: '🦍', teen: '🦍', adult: '🦍✨' }, tier: 3 },
  { type: 'octopus', name: '오징어', emoji: { egg: '🥚', baby: '🐙', teen: '🐙', adult: '🐙✨' }, tier: 3 },
  { type: 'starfish', name: '불가사리', emoji: { egg: '🥚', baby: '⭐', teen: '⭐', adult: '⭐✨' }, tier: 3 },
  { type: 'fish', name: '물고기', emoji: { egg: '🥚', baby: '🐠', teen: '🐟', adult: '🐡' }, tier: 3 },
  { type: 'camel', name: '낙타', emoji: { egg: '🥚', baby: '🐫', teen: '🐫', adult: '🐫✨' }, tier: 3 },
  { type: 'snail', name: '달팽이', emoji: { egg: '🥚', baby: '🐌', teen: '🐌', adult: '🐌✨' }, tier: 3 },
  { type: 'jellyfish', name: '해파리', emoji: { egg: '🥚', baby: '🪼', teen: '🪼', adult: '🪼✨' }, tier: 3 },
  { type: 'spider', name: '거미', emoji: { egg: '🥚', baby: '🕷️', teen: '🕷️', adult: '🕷️✨' }, tier: 3 },
  { type: 'shrimp', name: '새우', emoji: { egg: '🥚', baby: '🦐', teen: '🦐', adult: '🦐✨' }, tier: 3 },
  { type: 'pig', name: '돼지', emoji: { egg: '🥚', baby: '🐷', teen: '🐖', adult: '🐗' }, tier: 3 },
  { type: 'butterfly', name: '나비', emoji: { egg: '🥚', baby: '🐛', teen: '🦋', adult: '🦋✨' }, tier: 3 },
  { type: 'hamster', name: '햄스터', emoji: { egg: '🥚', baby: '🐹', teen: '🐹', adult: '🐹✨' }, tier: 3 },
  { type: 'turtle', name: '거북이', emoji: { egg: '🥚', baby: '🐢', teen: '🐢', adult: '🐢✨' }, tier: 3 },
];

// 2티어 (25%)
const tier2Pets: PetType[] = [
  { type: 'lion', name: '사자', emoji: { egg: '🥚', baby: '🦁', teen: '🦁', adult: '🦁✨' }, tier: 2 },
  { type: 'dog', name: '강아지', emoji: { egg: '🥚', baby: '🐶', teen: '🐕', adult: '🦮' }, tier: 2 },
  { type: 'cat', name: '고양이', emoji: { egg: '🥚', baby: '🐱', teen: '😺', adult: '🐈' }, tier: 2 },
  { type: 'rabbit', name: '토끼', emoji: { egg: '🥚', baby: '🐰', teen: '🐇', adult: '🐇✨' }, tier: 2 },
  { type: 'bear', name: '곰', emoji: { egg: '🥚', baby: '🐻', teen: '🐻', adult: '🐻✨' }, tier: 2 },
  { type: 'squirrel', name: '다람쥐', emoji: { egg: '🥚', baby: '🐿️', teen: '🐿️', adult: '🐿️✨' }, tier: 2 },
  { type: 'whale', name: '고래', emoji: { egg: '🥚', baby: '🐋', teen: '🐳', adult: '🐳✨' }, tier: 2 },
  { type: 'raccoon', name: '너구리', emoji: { egg: '🥚', baby: '🦝', teen: '🦝', adult: '🦝✨' }, tier: 2 },
  { type: 'fox', name: '여우', emoji: { egg: '🥚', baby: '🦊', teen: '🦊', adult: '🦊✨' }, tier: 2 },
  { type: 'elephant', name: '코끼리', emoji: { egg: '🥚', baby: '🐘', teen: '🐘', adult: '🐘✨' }, tier: 2 },
  { type: 'otter', name: '수달', emoji: { egg: '🥚', baby: '🦦', teen: '🦦', adult: '🦦✨' }, tier: 2 },
  { type: 'horse', name: '말', emoji: { egg: '🥚', baby: '🐴', teen: '🐎', adult: '🐎✨' }, tier: 2 },
  { type: 'tiger', name: '호랑이', emoji: { egg: '🥚', baby: '🐯', teen: '🐅', adult: '🐅✨' }, tier: 2 },
];

// 1티어 (5%)
const tier1Pets: PetType[] = [
  { type: 'unicorn', name: '유니콘', emoji: { egg: '🥚✨', baby: '🦄', teen: '🦄✨', adult: '🦄💫' }, tier: 1 },
  { type: 'dragon', name: '드래곤', emoji: { egg: '🥚✨', baby: '🐲', teen: '🐉', adult: '🐲✨' }, tier: 1 },
  { type: 'panda', name: '판다', emoji: { egg: '🥚✨', baby: '🐼', teen: '🐼', adult: '🐼✨' }, tier: 1 },
  { type: 'penguin', name: '펭귄', emoji: { egg: '🥚✨', baby: '🐧', teen: '🐧', adult: '🐧✨' }, tier: 1 },
  { type: 'polar_bear', name: '북극곰', emoji: { egg: '🥚✨', baby: '🐻‍❄️', teen: '🐻‍❄️', adult: '🐻‍❄️✨' }, tier: 1 },
  { type: 'shark', name: '상어', emoji: { egg: '🥚✨', baby: '🦈', teen: '🦈', adult: '🦈✨' }, tier: 1 },
  { type: 'dinosaur', name: '공룡', emoji: { egg: '🥚✨', baby: '🦕', teen: '🦖', adult: '🦖✨' }, tier: 1 },
];

export const allPets = [...tier1Pets, ...tier2Pets, ...tier3Pets];

// 티어별 확률에 따른 랜덤 펫 선택
export const getRandomPet = (): PetType => {
  const random = Math.random() * 100;
  
  if (random < 5) {
    // 1티어 (5%)
    return tier1Pets[Math.floor(Math.random() * tier1Pets.length)];
  } else if (random < 30) {
    // 2티어 (25%)
    return tier2Pets[Math.floor(Math.random() * tier2Pets.length)];
  } else {
    // 3티어 (70%)
    return tier3Pets[Math.floor(Math.random() * tier3Pets.length)];
  }
};

// 타입으로 펫 정보 찾기
export const getPetByType = (type: string): PetType | undefined => {
  return allPets.find(pet => pet.type === type);
};

// 펫 이모지 가져오기
export const getPetEmoji = (type: string, stage: 'egg' | 'baby' | 'teen' | 'adult'): string => {
  const pet = getPetByType(type);
  return pet?.emoji[stage] || '🥚';
};

// 티어 텍스트 가져오기
export const getTierText = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1: return '전설';
    case 2: return '희귀';
    case 3: return '일반';
    default: return '일반';
  }
};

// 티어 색상 가져오기
export const getTierColor = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1: return 'text-yellow-500';
    case 2: return 'text-purple-500';
    case 3: return 'text-blue-500';
    default: return 'text-gray-500';
  }
};
