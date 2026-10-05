export interface WordItem {
  id: string;
  word: string;
  definition: string;
  category?: string;
}

export const DEFAULT_VOCABULARY: WordItem[] = [
  {
    id: "w1",
    word: "entertainment",
    definition: "something people watch for pleasure",
    category: "Sports & Media"
  },
  {
    id: "w2",
    word: "ring",
    definition: "the place where two boxers fight",
    category: "Arena & Equipment"
  },
  {
    id: "w3",
    word: "crowd",
    definition: "a large group of people",
    category: "People & Atmosphere"
  },
  {
    id: "w4",
    word: "Commentator",
    definition: "the person who describes the action in a sport",
    category: "People & Roles"
  },
  {
    id: "w5",
    word: "go crazy",
    definition: "get very excited, shout and jump up and down",
    category: "Actions & Reactions"
  },
  {
    id: "w6",
    word: "fans",
    definition: "people who like a sports person or famous celebrity",
    category: "People & Atmosphere"
  },
  {
    id: "w7",
    word: "salary",
    definition: "the money you earn for work",
    category: "Business & Career"
  },
  {
    id: "w8",
    word: "spectator",
    definition: "a person who watches a boxing match",
    category: "People & Roles"
  },
  {
    id: "w9",
    word: "scream",
    definition: "to make a loud, high sound when excited",
    category: "Actions & Reactions"
  }
];

export function getRandomWordChoices(targetWord: WordItem, allWords: WordItem[], count: number = 4): string[] {
  const choices = [targetWord.word];
  const remaining = allWords.filter(w => w.word.toLowerCase() !== targetWord.word.toLowerCase());
  
  // Shuffle remaining
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length && choices.length < count; i++) {
    choices.push(shuffled[i].word);
  }

  // Shuffle choices
  return choices.sort(() => Math.random() - 0.5);
}
