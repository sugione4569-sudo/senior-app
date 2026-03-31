import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, RotateCcw } from 'lucide-react';

const BADGE_DEFINITIONS = [
  { id: 'badge_1', name: '첫 마법사', icon: '🌟', description: '첫 번째 마법을 성공했어요!' },
  { id: 'badge_2', name: '견습 마법사', icon: '🎨', description: '두 번째 마법을 성공했어요!' },
  { id: 'badge_3', name: '숙련 마법사', icon: '🌈', description: '오 훌륭해요! 조금만 더 힘내세요!' },
  { id: 'badge_4', name: '고급 마법사', icon: '🔥', description: '네 번째 마법을 성공했어요!' },
  { id: 'badge_5', name: '마법의 달인', icon: '⭐', description: '다섯 번째 마법! 대단해요!' },
];

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 1 + Math.random() * 2.5,
  duration: `${2 + Math.random() * 4}s`,
  delay: `${Math.random() * 5}s`,
}));

const LIGHT_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 4 + Math.random() * 5,
  duration: `${12 + Math.random() * 18}s`,
  delay: `${Math.random() * 10}s`,
  dx: `${(Math.random() - 0.5) * 300}px`,
  dy: `${(Math.random() - 0.5) * 300}px`,
}));

const GLOWS = [
  { left: '20%', top: '15%', size: 120, duration: '8s', delay: '0s' },
  { right: '10%', bottom: '25%', size: 150, duration: '10s', delay: '3s' },
  { left: '60%', top: '60%', size: 90, duration: '7s', delay: '5s' },
];

const StarryBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
    {STARS.map(s => (
      <div
        key={`star-${s.id}`}
        className="absolute rounded-full bg-white"
        style={{
          left: s.left,
          top: s.top,
          width: s.size,
          height: s.size,
          animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          willChange: 'opacity, transform',
        }}
      />
    ))}

    {LIGHT_PARTICLES.map(p => (
      <div
        key={`lp-${p.id}`}
        className="absolute rounded-full"
        style={{
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0) 70%)',
          boxShadow: '0 0 8px 2px rgba(255,255,255,0.3)',
          animation: `drift ${p.duration} ease-in-out ${p.delay} infinite`,
          '--dx': p.dx,
          '--dy': p.dy,
          willChange: 'opacity, transform',
        }}
      />
    ))}

    {GLOWS.map((g, i) => (
      <div
        key={`glow-${i}`}
        className="absolute rounded-full"
        style={{
          left: g.left,
          top: g.top,
          right: g.right,
          bottom: g.bottom,
          width: g.size,
          height: g.size,
          background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)',
          animation: `glow ${g.duration} ease-in-out ${g.delay} infinite`,
          willChange: 'opacity, transform',
        }}
      />
    ))}
  </div>
);

const Particle = ({ color, x, y }) => {
  const [opacity, setOpacity] = useState(1);
  const [pos, setPos] = useState({ x, y });
  const velocity = useRef({
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setPos(prev => ({
        x: prev.x + velocity.current.x,
        y: prev.y + velocity.current.y
      }));
      setOpacity(prev => prev - 0.02);
    }, 20);
    return () => clearInterval(timer);
  }, []);

  if (opacity <= 0) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 text-2xl"
      style={{ left: pos.x, top: pos.y, opacity, color }}
    >
      ✨
    </div>
  );
};

const playFireworkSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 6; i++) {
      const t = ctx.currentTime + i * 0.6;
      const len = ctx.sampleRate * 0.4;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < len; j++) {
        d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / len, 4);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800 + Math.random() * 4000;
      filter.Q.value = 0.5;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
    }
  } catch {}
};

const Firework = ({ delay }) => {
  const [phase, setPhase] = useState('hidden');
  const x = useRef(15 + Math.random() * 70);
  const burstY = useRef(10 + Math.random() * 35);
  const color = useRef(['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899', '#f97316'][Math.floor(Math.random() * 7)]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('rising'), delay);
    const t2 = setTimeout(() => setPhase('burst'), delay + 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay]);

  if (phase === 'hidden') return null;

  if (phase === 'rising') {
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${x.current}%`,
          bottom: '0%',
          animation: 'fireworkRise 0.8s ease-out forwards',
          '--burst-y': `${90 - burstY.current}vh`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: color.current,
            boxShadow: `0 0 8px ${color.current}, 0 8px 16px ${color.current}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute pointer-events-none" style={{ left: `${x.current}%`, top: `${burstY.current}%` }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 2 * Math.PI;
        const dist = 50 + Math.random() * 70;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        return (
          <div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: color.current,
              boxShadow: `0 0 6px ${color.current}`,
              animation: 'fireworkBurst 1.2s ease-out forwards',
              '--fx': `${dx}px`,
              '--fy': `${dy}px`,
            }}
          />
        );
      })}
    </div>
  );
};

const FinaleOverlay = ({ onClose, badges }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    playFireworkSound();
    const t = setTimeout(onClose, 10000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
      <style>{`
        @keyframes fireworkRise {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(calc(-1 * var(--burst-y))); opacity: 0.6; }
        }
        @keyframes fireworkBurst {
          0% { transform: translate(0, 0); opacity: 1; }
          60% { opacity: 0.8; }
          100% { transform: translate(var(--fx), var(--fy)); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.5; }
        }
        @keyframes finaleGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,215,0,0.8); }
          50% { text-shadow: 0 0 60px rgba(255,215,0,1), 0 0 120px rgba(255,165,0,0.5); }
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" style={{ opacity: show ? 1 : 0, transition: 'opacity 0.8s' }} />

      {Array.from({ length: 10 }).map((_, i) => (
        <Firework key={`fw-${i}`} delay={i * 500} />
      ))}

      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={`conf-${i}`}
          className="absolute w-3 h-8 rounded-sm pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899'][i % 6],
            animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 3}s infinite`,
            opacity: 0.8,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6" style={{ opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.5)', transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <div className="text-6xl mb-2" style={{ animation: 'confettiFall 0.5s ease-out' }}>🎆</div>
        <h1 className="text-5xl font-black text-yellow-300 text-center" style={{ animation: 'finaleGlow 1.5s ease-in-out infinite' }}>
          축하합니다!
        </h1>
        <p className="text-2xl font-bold text-white text-center">
          모든 마법을 마스터했어요!
        </p>
        <div className="flex gap-4 mt-4">
          {badges.map(b => (
            <div key={b.id} className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-3xl shadow-lg border-2 border-yellow-400 animate-bounce" style={{ animationDelay: `${Math.random() * 0.5}s` }}>
              {b.icon}
            </div>
          ))}
        </div>
        <p className="text-xl text-yellow-200 mt-4">
          당신은 진정한 마법의 달인이에요!
        </p>
        <div className="text-base text-white/50 mt-2">잠시 후 처음으로 돌아갑니다</div>
      </div>
    </div>
  );
};

const BadgePopup = ({ badge, onClose }) => {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setScale(1));
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-4 bg-gradient-to-b from-yellow-50 to-white rounded-3xl p-10 shadow-2xl border-4 border-yellow-400 mx-4"
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="text-7xl animate-bounce">{badge.icon}</div>
        <p className="text-3xl font-black text-yellow-600">배지 획득!</p>
        <p className="text-2xl font-bold text-gray-800">{badge.name}</p>
        <p className="text-xl text-gray-600 text-center">{badge.description}</p>
        <div className="mt-2 text-base text-gray-400">잠시 후 자동으로 닫힙니다</div>
      </div>
    </div>
  );
};

const AliRobot = ({ mood }) => {
  const renderFace = () => {
    switch (mood) {
      case 'listening':
        return (
          <>
            <circle cx="38" cy="36" r="10" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
            <circle cx="62" cy="36" r="10" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
            <circle cx="38" cy="36" r="5" fill="#333">
              <animate attributeName="r" values="5;3.5;5" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="62" cy="36" r="5" fill="#333">
              <animate attributeName="r" values="5;3.5;5" dur="1s" repeatCount="indefinite" />
            </circle>
            <ellipse cx="50" cy="50" rx="4" ry="5" fill="#555" />
          </>
        );

      case 'happy':
        return (
          <>
            <path d="M29 38 Q38 28 47 38" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <path d="M53 38 Q62 28 71 38" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <circle cx="28" cy="44" r="5" fill="#fca5a5" opacity="0.5" />
            <circle cx="72" cy="44" r="5" fill="#fca5a5" opacity="0.5" />
            <path d="M38 48 Q50 60 62 48" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          </>
        );

      case 'sad':
        return (
          <>
            <circle cx="38" cy="38" r="9" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="62" cy="38" r="9" fill="none" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="38" cy="40" r="3" fill="#666" />
            <circle cx="62" cy="40" r="3" fill="#666" />
            <path d="M28 30 Q38 26 46 32" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <path d="M54 32 Q62 26 72 30" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 52 Q50 46 60 52" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="72" cy="28" rx="2" ry="3" fill="#93c5fd" opacity="0.7">
              <animate attributeName="opacity" values="0;0.7;0" dur="2s" repeatCount="indefinite" />
            </ellipse>
          </>
        );

      case 'celebrating':
        return (
          <>
            <polygon points="38,31 40,36 45,36 41,39 42,44 38,41 34,44 35,39 31,36 36,36" fill="#fbbf24" />
            <polygon points="62,31 64,36 69,36 65,39 66,44 62,41 58,44 59,39 55,36 60,36" fill="#fbbf24" />
            <path d="M35 46 Q50 62 65 46" fill="#555" stroke="#333" strokeWidth="1.5" />
            <path d="M37 46 Q50 42 63 46" fill="white" />
            <circle cx="50" cy="8" r="3" fill="#fbbf24">
              <animate attributeName="r" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
            </circle>
          </>
        );

      default:
        return (
          <>
            <circle cx="38" cy="38" r="9" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="62" cy="38" r="9" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="38" cy="38" r="3" fill="#333" />
            <circle cx="62" cy="38" r="3" fill="#333" />
            <path d="M42 48 Q50 54 58 48" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <svg width="160" height="160" viewBox="0 0 100 100">
      <rect x="25" y="15" width="50" height="45" rx="15" fill="white" stroke="#ddd" />
      {renderFace()}
      <rect x="30" y="62" width="40" height="28" rx="10" fill="white" stroke="#ddd" />
      <path
        d="M50 72 Q53 69 56 72 Q59 75 50 82 Q41 75 44 72 Q47 69 50 72"
        fill={mood === 'happy' || mood === 'celebrating' ? '#ef4444' : '#f87171'}
      >
        <animate
          attributeName="opacity"
          values="0.4;1;0.4"
          dur={mood === 'celebrating' ? '0.5s' : '1s'}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

const BADGE_POSITIONS = [
  { left: '5%',  top: '8%',  dur: '4s',  delay: '0s'   },
  { right: '5%', top: '12%', dur: '4.5s', delay: '0.5s' },
  { left: '3%',  bottom: '28%', dur: '5s',  delay: '1s' },
  { right: '3%', bottom: '32%', dur: '3.8s', delay: '0.3s' },
  { left: '8%',  bottom: '10%', dur: '4.2s', delay: '0.7s' },
];

const FloatingBadge = ({ badge, position }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const { dur, delay, ...pos } = position;

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        ...pos,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0)',
        transition: 'opacity 0.6s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="flex flex-col items-center gap-1"
        style={{
          animation: `badgeFloat ${dur} ease-in-out ${delay} infinite`,
        }}
      >
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-2xl shadow-lg border-2 border-yellow-400"
          style={{ boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)' }}
        >
          {badge.icon}
        </div>
        <span className="text-xs font-bold text-white/80 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
          {badge.name}
        </span>
      </div>
    </div>
  );
};

const FloatingBadges = ({ earnedBadges }) => {
  return (
    <>
      <style>{`
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
      `}</style>
      {earnedBadges.map((badge, i) => (
        <FloatingBadge
          key={badge.id}
          badge={badge}
          position={BADGE_POSITIONS[i % BADGE_POSITIONS.length]}
        />
      ))}
    </>
  );
};

export default function App() {
  const [bgColor, setBgColor] = useState('#0a0a2e');
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState('신비로운 마법의 세계에 오신 걸 환영해요!\n저기 빛나는 마이크에 주문을 걸어보실래요?');
  const [particles, setParticles] = useState([]);
  const [isJumping, setIsJumping] = useState(false);
  const [aliMood, setAliMood] = useState('default');
  const [showBadgePopup, setShowBadgePopup] = useState(null);
  const [showFinale, setShowFinale] = useState(false);
  const [listenSeconds, setListenSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const gotResultRef = useRef(false);
  const listenTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const idleTimerRef = useRef(null);

  const LISTEN_DURATION = 10;
  const IDLE_TIMEOUT = 30000;

  const [earnedBadges, setEarnedBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('ali-badges');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [magicCount, setMagicCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('ali-magic-count')) || 0;
    } catch { return 0; }
  });
  const [colorHistory, setColorHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ali-color-history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('ali-badges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  useEffect(() => {
    localStorage.setItem('ali-magic-count', String(magicCount));
  }, [magicCount]);

  useEffect(() => {
    localStorage.setItem('ali-color-history', JSON.stringify(colorHistory));
  }, [colorHistory]);

  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (listenTimerRef.current) {
      clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsListening(false);
    setListenSeconds(0);
  }, []);

  const startCountdown = () => {
    let remaining = LISTEN_DURATION;
    setListenSeconds(remaining);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setListenSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }, 1000);

    listenTimerRef.current = setTimeout(() => {
      if (!gotResultRef.current) {
        stopListening();
        setAliMood('sad');
        setMessage('시간이 다 됐어요.\n마이크를 다시 누르고 천천히 말씀해 주세요!');
        speak('시간이 다 됐어요. 마이크를 다시 눌러주세요.');
        setTimeout(() => setAliMood('default'), 3000);
      }
    }, LISTEN_DURATION * 1000);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("이 브라우저는 음성 인식을 지원하지 않아요.\nChrome 브라우저를 사용해 주세요.");
      return;
    }

    gotResultRef.current = false;

    const recognition = new SR();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setAliMood('listening');
      setMessage('듣고 있어요...\n천천히 "빨갛게 바꿔줘"라고 말해보세요!');
      startCountdown();
    };

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        gotResultRef.current = true;
        stopListening();
        processCommand(last[0].transcript);
      } else {
        setMessage(`"${last[0].transcript}"...\n듣고 있어요, 계속 말씀하세요!`);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;

      stopListening();
      setAliMood('sad');

      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMessage('마이크 사용이 허락되지 않았어요!\n\n브라우저 주소창 왼쪽의 🔒 자물쇠를\n눌러서 마이크를 "허용"으로 바꿔주세요.');
        speak('마이크 사용을 허락해 주세요. 주소창 옆 자물쇠를 눌러보세요.');
      } else if (e.error === 'audio-capture') {
        setMessage('마이크를 찾을 수 없어요!\n\n컴퓨터에 마이크가 연결되어 있는지\n확인해 주세요.');
        speak('마이크를 찾을 수 없어요.');
      } else if (e.error === 'network') {
        setMessage('인터넷 연결이 필요해요!\n\n인터넷이 연결되어 있는지 확인해 주세요.');
        speak('인터넷 연결을 확인해 주세요.');
      } else {
        setMessage(`음성 인식에 문제가 생겼어요.\n(오류: ${e.error})\n\n마이크를 다시 눌러보세요!`);
        speak('음성 인식에 문제가 생겼어요. 다시 시도해 주세요.');
      }
      setTimeout(() => setAliMood('default'), 4000);
    };

    recognition.onend = () => {
      if (!gotResultRef.current && recognitionRef.current) {
        try { recognition.start(); return; } catch {}
      }
      setIsListening(false);
      setListenSeconds(0);
    };

    try {
      recognition.start();
    } catch {
      stopListening();
      setMessage('마이크를 시작할 수 없어요.\n\nChrome 브라우저에서 열어주시고,\n주소창 옆 🔒 자물쇠를 눌러\n마이크를 허용해 주세요.');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      gotResultRef.current = true;
      stopListening();
      setAliMood('default');
      setMessage('알겠어요! 다시 마이크를 누르면 들을게요.');
    } else {
      startListening();
    }
  };

  const processCommand = (cmd) => {
    let newColor = '';
    let colorName = '';
    let colorKey = '';

    if (cmd.includes('빨강') || cmd.includes('빨갛게')) {
      newColor = '#7f1d1d'; colorName = '빨간색'; colorKey = 'red';
    } else if (cmd.includes('파랑') || cmd.includes('파랗게')) {
      newColor = '#1e3a8a'; colorName = '파란색'; colorKey = 'blue';
    } else if (cmd.includes('노랑') || cmd.includes('노랗게')) {
      newColor = '#ca8a04'; colorName = '노란색'; colorKey = 'yellow';
    } else if (cmd.includes('초록') || cmd.includes('초록색')) {
      newColor = '#065f46'; colorName = '초록색'; colorKey = 'green';
    }

    if (newColor) {
      setBgColor(newColor);

      const newMagicCount = magicCount + 1;
      const newColorHistory = colorHistory.includes(colorKey)
        ? colorHistory
        : [...colorHistory, colorKey];

      setMagicCount(newMagicCount);
      setColorHistory(newColorHistory);

      triggerMagic(newColor, colorName, newMagicCount, newColorHistory);
    } else {
      setAliMood('sad');
      const failMsg = `"${cmd}"라고 하셨나요? 빨강, 파랑, 노랑, 초록 중에서 다시 주문을 걸어보세요!`;
      setMessage(failMsg);
      speak(failMsg);
      setTimeout(() => setAliMood('default'), 3000);
    }
  };

  const triggerMagic = (color, name, newMagicCount, newColorHistory) => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 + 100,
      color: '#ffd700'
    }));
    setParticles(prev => [...prev, ...newParticles]);

    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);

    setAliMood('happy');

    const successMsg = `주문대로 멋진 ${name}으로 변했어요! 잘하셨어요!`;
    setMessage(successMsg);
    speak(successMsg);

    setTimeout(() => {
      const nextBadgeIndex = earnedBadges.length;
      if (nextBadgeIndex < BADGE_DEFINITIONS.length) {
        const badge = BADGE_DEFINITIONS[nextBadgeIndex];
        awardBadgesSequentially([badge], 0);
      } else {
        setTimeout(() => setAliMood('default'), 2000);
      }
    }, 2500);
  };

  const awardBadgesSequentially = useCallback((badges, index) => {
    if (index >= badges.length) {
      setAliMood('default');
      return;
    }

    const badge = badges[index];
    setEarnedBadges(prev => {
      const updated = [...prev, badge];
      if (updated.length >= BADGE_DEFINITIONS.length) {
        setTimeout(() => {
          setShowBadgePopup(null);
          setShowFinale(true);
        }, 3000);
      }
      return updated;
    });
    setShowBadgePopup(badge);
    setAliMood('celebrating');

    const isFinal = badge.id === 'badge_5';
    const badgeMsg = isFinal
      ? `축하해요! 마지막 배지 "${badge.name}"를 획득했어요!`
      : `축하해요! "${badge.name}" 배지를 획득했어요! ${badge.description}`;
    setMessage(badgeMsg);
    speak(badgeMsg);

    if (!isFinal) {
      setTimeout(() => {
        setShowBadgePopup(null);
        awardBadgesSequentially(badges, index + 1);
      }, 4500);
    }
  }, []);

  const resetAll = useCallback(() => {
    setBgColor('#0a0a2e');
    setMessage('신비로운 마법의 세계에 오신 걸 환영해요!\n저기 빛나는 마이크에 주문을 걸어보실래요?');
    setAliMood('default');
    setParticles([]);
    setShowBadgePopup(null);
    setEarnedBadges([]);
    setMagicCount(0);
    setColorHistory([]);
    localStorage.removeItem('ali-badges');
    localStorage.removeItem('ali-magic-count');
    localStorage.removeItem('ali-color-history');
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      resetAll();
    }, IDLE_TIMEOUT);
  }, [resetAll]);

  useEffect(() => {
    resetIdleTimer();
    const events = ['click', 'touchstart', 'keydown'];
    const handler = () => resetIdleTimer();
    events.forEach(e => window.addEventListener(e, handler));
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(e => window.removeEventListener(e, handler));
    };
  }, [resetIdleTimer]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between py-12 px-6 transition-all duration-1000 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <StarryBackground />

      <FloatingBadges earnedBadges={earnedBadges} />

      <div className={`relative z-20 flex flex-col items-center transition-transform duration-300 ${isJumping ? '-translate-y-10 scale-110' : ''}`}>
        <AliRobot mood={aliMood} />

        <div className="mt-6 bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 max-w-sm text-center">
          <p className="text-2xl font-black text-gray-800 whitespace-pre-line leading-snug">
            {message}
          </p>
        </div>
      </div>

      <div className="relative z-30 flex flex-col items-center gap-6">
        {isListening ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-white text-2xl font-black bg-red-500/60 px-6 py-3 rounded-full backdrop-blur-md animate-pulse">
              🎤 듣고 있어요... {listenSeconds}초
            </div>
            <div className="text-white/70 text-base">
              마이크를 다시 누르면 멈춰요
            </div>
          </div>
        ) : (
          <div className="text-white text-xl font-bold bg-black/30 px-6 py-2 rounded-full backdrop-blur-md">
            "화면을 <span className="text-yellow-300">노랗게</span> 바꿔줘"
          </div>
        )}

        <button
          onClick={handleMicClick}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white cursor-pointer
            ${isListening
              ? 'bg-red-500 scale-110 shadow-[0_0_60px_rgba(239,68,68,0.6)]'
              : 'bg-gradient-to-br from-yellow-300 to-yellow-600 hover:scale-105 shadow-[0_0_40px_rgba(255,215,0,0.4)]'}
          `}
        >
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
              <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - listenSeconds / LISTEN_DURATION)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
            </>
          )}
          <Mic size={64} color="white" fill={isListening ? "white" : "transparent"} />
        </button>

        <button
          onClick={resetAll}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <RotateCcw size={20} /> 처음으로 돌리기
        </button>
      </div>

      {particles.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
      ))}

      {showBadgePopup && (
        <BadgePopup badge={showBadgePopup} onClose={() => setShowBadgePopup(null)} />
      )}

      {showFinale && (
        <FinaleOverlay
          badges={BADGE_DEFINITIONS}
          onClose={() => {
            setShowFinale(false);
            resetAll();
          }}
        />
      )}
    </div>
  );
}
