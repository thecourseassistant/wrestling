import { Wrestler } from '../data/wrestlers';
import { sound } from '../utils/audio';

export type ActionType = 
  | 'IDLE' 
  | 'WALKING' 
  | 'RUNNING' 
  | 'DODGING' 
  | 'SMACKING' 
  | 'PUNCH' 
  | 'KICK' 
  | 'DROPKICK' 
  | 'CLOTHESLINE' 
  | 'GRAPPLE' 
  | 'BODYSLAM' 
  | 'SUPLEX' 
  | 'FINISHER' 
  | 'ROPE_REBOUND_FINISHER'
  | 'VICTORY'
  | 'TAUNT' 
  | 'HURT' 
  | 'FLOWN_OFF' 
  | 'DOWN' 
  | 'PINNING' 
  | 'BEING_PINNED';

export interface WrestlerState {
  id: string;
  wrestlerData: Wrestler;
  x: number;
  y: number;
  vx: number;
  vy: number;
  airY: number;
  airVy: number;
  rotation: number;
  facingLeft: boolean;
  hp: number;
  superGauge: number;
  action: ActionType;
  actionTimer: number;
  actionFrame: number;
  isPlayer: boolean;
  isGrounded: boolean;
  pinCount: number;
}

export interface ParticleEffect {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale?: number;
}

export interface ShockwaveEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
}

export class WrestlingMatchEngine {
  public player: WrestlerState;
  public opponent: WrestlerState;

  // 🥊 OPPONENT 2-LIFE SYSTEM (150 HP PER PHASE = 300 TOTAL HP)
  public opponentLifePhase: 1 | 2 = 1;

  public width: number = 800;
  public height: number = 450;
  
  public roundNumber: number = 1;
  public isRoundIntroActive: boolean = false;
  public roundReasonMessage: string = "";

  public playerJoyX: number = 0;
  public playerJoyY: number = 0;

  public comboStreak: number = 0;

  public finisherStage: 'NONE' | 'RUN_TO_ROPES' | 'BOUNCE_ROPES' | 'SPRING_LEAP' | 'SLAM_IMPACT' = 'NONE';
  public finisherTimer: number = 0;

  public isPlayerKoPending: boolean = false;
  public playerKoTimer: number = 0;

  public questionsAnsweredCount: number = 0;
  public totalVocabularyCount: number = 9;
  public correctCount: number = 0;
  public incorrectCount: number = 0;
  public matchTimeSpent: number = 0;
  public isMatchOver: boolean = false;
  public matchResultType: 'KNOCK OUT WIN' | 'GAME OVER' = 'GAME OVER';
  public isVocabPopupActive: boolean = false;

  public screenShake: number = 0;

  public particles: ParticleEffect[] = [];
  public shockwaves: ShockwaveEffect[] = [];
  public flashes: { x: number; y: number; radius: number; life: number }[] = [];
  public commentMessage: string = "";

  private onSuperGaugeFullCallback?: () => void;
  private onAudioTrigger?: (type: string) => void;

  constructor(
    playerWrestler: Wrestler,
    opponentWrestler: Wrestler,
    onSuperGaugeFull?: () => void,
    onAudioTrigger?: (type: string) => void
  ) {
    this.player = {
      id: 'player',
      wrestlerData: playerWrestler,
      x: 260,
      y: 280,
      vx: 0,
      vy: 0,
      airY: 0,
      airVy: 0,
      rotation: 0,
      facingLeft: false,
      hp: 100,
      superGauge: 0,
      action: 'IDLE',
      actionTimer: 0,
      actionFrame: 0,
      isPlayer: true,
      isGrounded: true,
      pinCount: 0
    };

    this.opponent = {
      id: 'opponent',
      wrestlerData: opponentWrestler,
      x: 540,
      y: 280,
      vx: 0,
      vy: 0,
      airY: 0,
      airVy: 0,
      rotation: 0,
      facingLeft: true,
      hp: 150,
      superGauge: 0,
      action: 'IDLE',
      actionTimer: 0,
      actionFrame: 0,
      isPlayer: false,
      isGrounded: true,
      pinCount: 0
    };

    this.opponentLifePhase = 1;

    this.onSuperGaugeFullCallback = onSuperGaugeFull;
    this.onAudioTrigger = onAudioTrigger;
  }

  public handleJoystickMove(joyX: number, joyY: number) {
    this.playerJoyX = joyX;
    this.playerJoyY = joyY;
  }

  public handleButtonPress(action: 'dodge' | 'smack' | 'pin', isPressed: boolean) {
    if (!isPressed || this.isMatchOver || this.isVocabPopupActive || this.isRoundIntroActive || this.finisherStage !== 'NONE' || this.isPlayerKoPending) return;
    if (this.player.action === 'FLOWN_OFF' || this.player.action === 'DOWN' || this.player.action === 'BEING_PINNED') return;

    if (action === 'dodge') {
      this.player.action = 'DODGING';
      this.player.actionTimer = 22;
      this.player.actionFrame = 0;

      const slideDir = this.player.facingLeft ? -1 : 1;
      const targetX = this.player.x + slideDir * 55;
      this.player.x = Math.max(130, Math.min(670, targetX));
      this.player.vx = slideDir * 4.5;

      this.triggerAudio('rope');
      return;
    }

    if (action === 'smack') {
      const strikeRoll = Math.random();

      if (strikeRoll < 0.35) {
        // Quick Punch
        this.player.action = 'PUNCH';
        this.player.actionTimer = 20;
        this.player.actionFrame = 0;

        const inRange = this.isHitIn2DRange(this.player, this.opponent, 75, 22);

        if (inRange) {
          // 🛡️ PARRY ONLY TRIGGERS IF THE ATTACK WOULD ACTUALLY HIT THE OPPONENT!
          const isParried = Math.random() < 0.22 && this.opponent.action !== 'DOWN' && this.opponent.action !== 'HURT' && this.opponent.action !== 'FLOWN_OFF';

          if (isParried) {
            sound.playParrySound();
            this.opponent.action = 'DODGING';
            this.opponent.actionTimer = 15;

            // Opponent counter-strikes cleanly in range
            this.player.hp = Math.max(0, this.player.hp - 5);
            this.player.action = 'HURT';
            this.player.actionTimer = 16;
            this.player.vx = this.opponent.facingLeft ? -5 : 5;
            this.comboStreak = 0;
            this.triggerAudio('punch');
          } else {
            this.damageOpponent(6);
            this.opponent.action = 'HURT';
            this.opponent.actionTimer = 16;
            this.opponent.vx = this.player.facingLeft ? -5 : 5;

            this.comboStreak++;
            this.triggerAudio('punch');
            this.increaseSuperGauge(12);
          }
        }
      } else if (strikeRoll < 0.70) {
        // Heavy Kick
        this.player.action = 'KICK';
        this.player.actionTimer = 24;
        this.player.actionFrame = 0;

        const inRange = this.isHitIn2DRange(this.player, this.opponent, 85, 22);

        if (inRange) {
          const isParried = Math.random() < 0.22 && this.opponent.action !== 'DOWN' && this.opponent.action !== 'HURT' && this.opponent.action !== 'FLOWN_OFF';

          if (isParried) {
            sound.playParrySound();
            this.opponent.action = 'DODGING';
            this.opponent.actionTimer = 15;

            this.player.hp = Math.max(0, this.player.hp - 5);
            this.player.action = 'HURT';
            this.player.actionTimer = 16;
            this.player.vx = this.opponent.facingLeft ? -5 : 5;
            this.comboStreak = 0;
            this.triggerAudio('punch');
          } else {
            this.damageOpponent(10);
            this.opponent.action = 'HURT';
            this.opponent.actionTimer = 20;
            this.opponent.vx = this.player.facingLeft ? -7 : 7;

            this.comboStreak++;
            this.triggerAudio('punch');
            this.increaseSuperGauge(18);
          }
        }
      } else {
        // Flying Jump Smack
        this.player.action = 'SMACKING';
        this.player.actionTimer = 28;
        this.player.actionFrame = 0;
        this.player.airVy = -9;

        const leapDir = this.player.facingLeft ? -6 : 6;
        this.player.vx = leapDir;

        const inRange = this.isHitIn2DRange(this.player, this.opponent, 110, 22);

        if (inRange) {
          const isParried = Math.random() < 0.22 && this.opponent.action !== 'DOWN' && this.opponent.action !== 'HURT' && this.opponent.action !== 'FLOWN_OFF';

          if (isParried) {
            sound.playParrySound();
            this.opponent.action = 'DODGING';
            this.opponent.actionTimer = 15;

            this.player.hp = Math.max(0, this.player.hp - 6);
            this.player.action = 'HURT';
            this.player.actionTimer = 18;
            this.comboStreak = 0;
            this.triggerAudio('punch');
          } else {
            this.damageOpponent(15);
            this.opponent.action = 'FLOWN_OFF';
            this.opponent.actionTimer = 50;
            this.opponent.vx = leapDir * 1.2;
            this.opponent.airVy = -8;

            this.screenShake = 12;
            this.addShockwave(this.opponent.x, this.opponent.y);

            this.comboStreak++;
            this.triggerAudio('thud');
            this.increaseSuperGauge(25);
          }
        } else {
          this.triggerAudio('rope');
        }
      }
      return;
    }

    if (action === 'pin') {
      if (this.opponent.action === 'DOWN' && this.isHitIn2DRange(this.player, this.opponent, 90, 25)) {
        this.player.action = 'PINNING';
        this.player.actionTimer = 180;
        this.opponent.action = 'BEING_PINNED';
      }
    }
  }

  private damageOpponent(amount: number) {
    this.opponent.hp -= amount;

    if (this.opponent.hp <= 0) {
      if (this.opponentLifePhase === 1) {
        this.opponentLifePhase = 2;
        this.opponent.hp = 150;
        this.screenShake = 20;
        this.addShockwave(this.opponent.x, this.opponent.y);
        this.triggerAudio('super_full');
      } else {
        this.opponent.hp = 0;
      }
    }
  }

  public isHitIn2DRange(attacker: { x: number; y: number }, target: WrestlerState, maxDx = 70, maxDy = 22): boolean {
    if (!target.isPlayer && (target.action === 'DOWN' || target.action === 'FLOWN_OFF')) {
      return false;
    }

    const dx = Math.abs(attacker.x - target.x);
    const dy = Math.abs(attacker.y - target.y);
    return dx < maxDx && dy < maxDy;
  }

  public update(dt: number) {
    if (this.isMatchOver || this.isRoundIntroActive) return;

    this.matchTimeSpent += dt;

    sound.updateCrowdRoar(this.comboStreak);

    if (this.screenShake > 0) {
      this.screenShake -= dt * 30;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    this.particles.forEach(p => {
      p.life--;
      p.y += p.vy;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    this.shockwaves.forEach(s => {
      s.life--;
      s.radius += 2.5;
    });
    this.shockwaves = this.shockwaves.filter(s => s.life > 0);

    if (this.isPlayerKoPending) {
      this.playerKoTimer -= dt;
      this.player.action = 'DOWN';
      this.player.actionTimer = 100;
      this.opponent.action = 'VICTORY';
      this.opponent.actionTimer = 100;

      if (this.playerKoTimer <= 0) {
        this.isPlayerKoPending = false;
        if (this.questionsAnsweredCount < this.totalVocabularyCount) {
          this.triggerRoundIntro("PLAYER HP EXHAUSTED! SECOND ROUND START!");
        } else {
          this.isMatchOver = true;
          this.matchResultType = 'GAME OVER';
        }
      }
      return;
    }

    if (this.finisherStage !== 'NONE') {
      this.opponent.action = 'IDLE';
      this.opponent.vx = 0;
      this.opponent.vy = 0;
      this.updateRopeReboundFinisherSequence();
      return;
    }

    if (this.isVocabPopupActive) return;

    const joyDist = Math.hypot(this.playerJoyX, this.playerJoyY);
    const canMove = !['FLOWN_OFF', 'DOWN', 'BEING_PINNED', 'DODGING', 'SMACKING', 'FINISHER', 'PUNCH', 'KICK'].includes(this.player.action);

    if (canMove && joyDist > 0.1) {
      const speed = 2.8;
      this.player.vx = this.playerJoyX * speed;
      this.player.vy = this.playerJoyY * speed * 0.55;

      if (this.playerJoyX !== 0) {
        this.player.facingLeft = this.playerJoyX < 0;
      }
      this.player.action = 'WALKING';
    } else if (this.player.action === 'WALKING' && joyDist <= 0.1) {
      this.player.action = 'IDLE';
    }

    [this.player, this.opponent].forEach(w => {
      w.actionFrame++;

      if (w.airY < 0 || w.airVy !== 0) {
        w.airY += w.airVy;
        w.airVy += 0.8;

        if (w.airY >= 0) {
          w.airY = 0;
          w.airVy = 0;
          if (w.action === 'FLOWN_OFF') {
            w.action = 'DOWN';
            w.actionTimer = 110;
            w.rotation = Math.PI / 2;
            this.addShockwave(w.x, w.y);
            this.screenShake = 12;
            this.triggerAudio('thud');
          } else {
            w.rotation = 0;
          }
        }
      }

      w.x += w.vx;
      w.y += w.vy;

      if (w.action === 'FLOWN_OFF') {
        w.vx *= 0.94;
        w.vy *= 0.94;
        w.rotation += w.facingLeft ? -0.2 : 0.2;
      } else if (w.action === 'DODGING' || w.action === 'SMACKING') {
        w.vx *= 0.88;
        w.vy *= 0.88;
      } else {
        w.vx *= 0.8;
        w.vy *= 0.8;
      }

      w.x = Math.max(130, Math.min(670, w.x));
      w.y = Math.max(160, Math.min(360, w.y));

      if (w.actionTimer > 0) {
        w.actionTimer--;
        if (w.actionTimer === 0 && w.action !== 'DOWN' && w.action !== 'BEING_PINNED') {
          w.action = 'IDLE';
          w.rotation = 0;
        }
      }

      if (w.action === 'DOWN' && w.actionTimer === 0) {
        if (w.hp > 0) {
          w.action = 'IDLE';
          w.rotation = 0;
        }
      }
    });

    const dx = this.player.x - this.opponent.x;
    const dy = this.player.y - this.opponent.y;
    const dist = Math.hypot(dx, dy);
    const minDist = 48;

    if (dist < minDist && dist > 0 && Math.abs(dy) < 22) {
      const overlap = minDist - dist;
      const pushX = (dx / dist) * overlap * 0.5;

      this.player.x += pushX;
      this.opponent.x -= pushX;
    }

    if (this.player.hp <= 0 && !this.isPlayerKoPending) {
      this.isPlayerKoPending = true;
      this.playerKoTimer = 3.5;
      this.player.action = 'DOWN';
      this.player.actionTimer = 220;

      this.opponent.action = 'VICTORY';
      this.opponent.actionTimer = 220;
      this.opponent.facingLeft = this.player.x < this.opponent.x;

      sound.playYouLoseSound();
      return;
    }

    if (this.opponent.hp <= 0 && this.opponentLifePhase === 2 && this.questionsAnsweredCount < this.totalVocabularyCount) {
      this.triggerRoundIntro("OPPONENT DEFEATED! ADVANCING TO NEXT ROUND!");
      return;
    }

    this.updateOpponentAI();
  }

  public triggerRopeReboundFinisher(wordName: string) {
    this.finisherStage = 'RUN_TO_ROPES';
    this.finisherTimer = 0;
    this.player.action = 'RUNNING';
    this.player.facingLeft = false;

    this.opponent.action = 'IDLE';
  }

  private updateRopeReboundFinisherSequence() {
    this.finisherTimer++;
    this.opponent.action = 'IDLE';

    if (this.finisherStage === 'RUN_TO_ROPES') {
      this.player.x += 11;
      if (this.player.x >= 660) {
        this.player.x = 660;
        this.finisherStage = 'BOUNCE_ROPES';
        this.finisherTimer = 0;
        this.triggerAudio('rope');
      }
    } else if (this.finisherStage === 'BOUNCE_ROPES') {
      if (this.finisherTimer > 8) {
        this.finisherStage = 'SPRING_LEAP';
        this.finisherTimer = 0;
        this.player.facingLeft = true;
      }
    } else if (this.finisherStage === 'SPRING_LEAP') {
      this.player.x -= 12;

      if (this.player.x <= this.opponent.x + 30) {
        this.finisherStage = 'SLAM_IMPACT';
        this.player.action = 'FINISHER';
        this.player.actionTimer = 60;

        this.damageOpponent(35);

        this.opponent.action = 'DOWN';
        this.opponent.actionTimer = 120;
        this.opponent.vx = -8;
        this.opponent.rotation = Math.PI / 2;

        this.player.hp = Math.min(100, this.player.hp + 25);

        this.screenShake = 20;
        this.addShockwave(this.opponent.x, this.opponent.y);

        this.triggerAudio('thud');
        this.triggerAudio('correct');

        setTimeout(() => {
          this.finisherStage = 'NONE';
          if (this.questionsAnsweredCount >= this.totalVocabularyCount) {
            this.isMatchOver = true;
            this.matchResultType = 'KNOCK OUT WIN';
            this.triggerAudio('bell');
          }
        }, 1200);
      }
    }
  }

  public triggerRoundIntro(reason: string) {
    this.roundNumber++;
    this.roundReasonMessage = reason;
    this.isRoundIntroActive = true;
    this.triggerAudio('bell');
  }

  public startNextRound() {
    this.isRoundIntroActive = false;
    this.isPlayerKoPending = false;
    this.playerKoTimer = 0;
    this.player.hp = 100;
    this.opponent.hp = 150;
    this.opponentLifePhase = 1;
    this.player.x = 260;
    this.player.y = 280;
    this.opponent.x = 540;
    this.opponent.y = 280;
    this.player.action = 'IDLE';
    this.opponent.action = 'IDLE';
  }

  private updateOpponentAI() {
    if (this.opponent.action === 'HURT' || this.opponent.action === 'FLOWN_OFF' || this.opponent.action === 'DOWN' || this.opponent.action === 'BEING_PINNED' || this.opponent.action === 'VICTORY') return;

    const isPlayerDownOrHurt = this.player.action === 'DOWN' || this.player.action === 'FLOWN_OFF' || this.player.action === 'HURT' || this.player.action === 'BEING_PINNED';

    if (isPlayerDownOrHurt) {
      this.opponent.action = 'WALKING';
      const stepBackDir = this.player.x < this.opponent.x ? 1 : -1;
      this.opponent.vx = stepBackDir * 2.0;
      this.opponent.vy = 0;
      this.opponent.facingLeft = stepBackDir < 0;
      return;
    }

    const dx = this.player.x - this.opponent.x;
    const dy = this.player.y - this.opponent.y;

    this.opponent.facingLeft = dx < 0;

    if (Math.abs(dy) > 18 || Math.abs(dx) > 75) {
      this.opponent.action = 'WALKING';
      this.opponent.vx = (dx / (Math.abs(dx) || 1)) * 1.0;
      this.opponent.vy = (dy / (Math.abs(dy) || 1)) * 0.6;
    } else {
      this.opponent.vx = 0;
      this.opponent.vy = 0;

      if (this.opponent.actionTimer <= 0) {
        const moveChoice = Math.random();
        if (moveChoice < 0.35) {
          this.opponent.action = 'PUNCH';
          this.opponent.actionTimer = 65;
          this.checkOpponentStrikeHit('punch');
        } else if (moveChoice < 0.65) {
          this.opponent.action = 'KICK';
          this.opponent.actionTimer = 70;
          this.checkOpponentStrikeHit('kick');
        } else {
          this.opponent.action = 'DROPKICK';
          this.opponent.actionTimer = 75;
          this.opponent.airVy = -7;
          this.checkOpponentStrikeHit('dropkick');
        }
      }
    }
  }

  private checkOpponentStrikeHit(type: 'punch' | 'kick' | 'dropkick' | 'suplex') {
    if (this.player.action === 'DODGING') return;

    if (this.isHitIn2DRange(this.opponent, this.player, 75, 22)) {
      let dmg = 4;
      if (type === 'kick') dmg = 6;
      if (type === 'dropkick') dmg = 9;

      this.player.hp = Math.max(0, this.player.hp - dmg);
      this.comboStreak = 0;

      if (type === 'dropkick') {
        this.player.action = 'FLOWN_OFF';
        this.player.actionTimer = 110;
        this.player.vx = this.opponent.facingLeft ? -8 : 8;
        this.player.airVy = -9;
        this.screenShake = 12;
      } else {
        this.player.action = 'HURT';
        this.player.actionTimer = 16;
        this.player.vx = this.opponent.facingLeft ? -6 : 6;
      }

      this.triggerAudio('punch');
    }
  }

  public increaseSuperGauge(amount: number) {
    if (this.player.superGauge >= 100) return;

    this.player.superGauge = Math.min(100, this.player.superGauge + amount);

    if (this.player.superGauge >= 100) {
      this.isVocabPopupActive = true;
      this.triggerAudio('super_full');
      if (this.onSuperGaugeFullCallback) {
        this.onSuperGaugeFullCallback();
      }
    }
  }

  public executeCorrectVocabCombo(wordName: string) {
    this.isVocabPopupActive = false;
    this.player.superGauge = 0;
    this.correctCount++;
    this.questionsAnsweredCount++;

    this.triggerRopeReboundFinisher(wordName);
  }

  public executeIncorrectVocabCombo() {
    this.isVocabPopupActive = false;
    this.player.superGauge = 0;
    this.incorrectCount++;
    this.questionsAnsweredCount++;

    this.player.hp = Math.max(0, this.player.hp - 25);
    this.comboStreak = 0;

    this.player.action = 'FLOWN_OFF';
    this.player.actionTimer = 110;
    this.player.vx = -8;
    this.player.airVy = -9;

    this.opponent.action = 'SUPLEX';
    this.opponent.actionTimer = 40;

    this.screenShake = 14;

    this.triggerAudio('incorrect');

    if (this.questionsAnsweredCount >= this.totalVocabularyCount) {
      this.isMatchOver = true;
      this.matchResultType = this.player.hp > 0 ? 'KNOCK OUT WIN' : 'GAME OVER';
      this.triggerAudio('bell');
    }
  }

  private addParticle(x: number, y: number, text: string, color: string, scale: number = 1.0) {
    this.particles.push({
      x,
      y,
      text,
      color,
      life: 60,
      maxLife: 60,
      vy: -1.4,
      scale
    });
  }

  private addShockwave(x: number, y: number) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 60,
      life: 25
    });
  }

  private triggerAudio(type: string) {
    if (this.onAudioTrigger) {
      this.onAudioTrigger(type);
    }
  }
}
