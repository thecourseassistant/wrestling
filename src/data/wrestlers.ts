import redjacketAvatarImg from '../assets/images/redjacket_face_avatar_1791183687043.jpg';
import heavyAvatarImg from '../assets/images/heavyweight_face_avatar_1791183703697.jpg';

export interface Wrestler {
  id: string;
  name: string;
  nickname: string;
  finisherName: string;
  avatarImage: string;
  primaryColor: string;
  secondaryColor: string;
  skinTone: string;
  hairColor: string;
  hairStyle: 'red_jacket' | 'heavy_brawler';
  facePaint?: string;
  stats: {
    power: number;
    speed: number;
    defense: number;
  };
  signatureCatchphrase: string;
}

export const WRESTLER_ROSTER: Wrestler[] = [
  {
    id: "red_jacket_hero",
    name: "Red Jacket Brawler",
    nickname: "Agile Striker",
    finisherName: "Flying Jump Smackdown",
    avatarImage: redjacketAvatarImg,
    primaryColor: "#ef4444",
    secondaryColor: "#2563eb",
    skinTone: "#f59e0b",
    hairColor: "#fde047",
    hairStyle: "red_jacket",
    stats: { power: 9, speed: 8, defense: 8 },
    signatureCatchphrase: "Speed and vocabulary power!"
  },
  {
    id: "heavyweight_brawler",
    name: "Big Earthquake",
    nickname: "Heavyweight Colossus",
    finisherName: "Seismic Ground Splash",
    avatarImage: heavyAvatarImg,
    primaryColor: "#1e293b",
    secondaryColor: "#0f172a",
    skinTone: "#d97706",
    hairColor: "#475569",
    hairStyle: "heavy_brawler",
    stats: { power: 10, speed: 4, defense: 10 },
    signatureCatchphrase: "FEEL THE SEISMIC CRUSH OF WORDS!"
  }
];
