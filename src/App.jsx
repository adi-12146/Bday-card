import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Heart,
  Music2,
  Pause,
  Sparkles,
} from "lucide-react";

// Personalize these two names for the birthday recipient and sender.
const RECIPIENT_NAME = "Deepali Arora";
const SENDER_NAME = "Antriksh Dwivedi";
// The custom background track lives in public/music/b.mp3.
const MUSIC_SRC = "/music/b.mp3";
const GALLERY = [
  {
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=85",
    caption: "Beautiful moments",
    note: "the ones worth keeping",
    alt: "A couple sharing a quiet moment",
  },
  {
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=85",
    caption: "Your kind of magic",
    note: "in the little things",
    alt: "Soft pink flowers in the sunlight",
  },
  {
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=85",
    caption: "That lovely smile",
    note: "my favourite view",
    alt: "Friends laughing together",
  },
  {
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=85",
    caption: "A little daydream",
    note: "just like you",
    alt: "A dreamy sunset over a field",
  },
  {
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=85",
    caption: "Forever memories",
    note: "and all the ones to come",
    alt: "Golden light over a summer landscape",
  },
];

const FLOATERS = Array.from({ length: 14 }, (_, index) => ({
  left: `${(index * 37 + 8) % 100}%`,
  delay: `${(index % 7) * -1.7}s`,
  duration: `${13 + (index % 5) * 2}s`,
  size: 10 + (index % 4) * 4,
}));

function FloatingDetails() {
  return (
    <div className="floaters" aria-hidden="true">
      {FLOATERS.map((item, index) => (
        <span
          className={index % 3 === 0 ? "floater floater-star" : "floater"}
          key={item.left + index}
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            fontSize: item.size,
          }}
        >
          {index % 3 === 0 ? "✦" : "♡"}
        </span>
      ))}
    </div>
  );
}

function SectionEyebrow({ children, light = false }) {
  return (
    <span className={`eyebrow${light ? " eyebrow-light" : ""}`}>
      <span className="eyebrow-line" />
      {children}
      <span className="eyebrow-line" />
    </span>
  );
}

function SectionHeading({ eyebrow, title, children, light = false }) {
  return (
    <div className="section-heading">
      <SectionEyebrow light={light}>{eyebrow}</SectionEyebrow>
      <h2 className={light ? "heading-light" : ""}>{title}</h2>
      {children && <p className={light ? "copy-light" : ""}>{children}</p>}
    </div>
  );
}

function MusicControl() {
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const intervalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const stopSynth = () => {
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    contextRef.current?.close();
    contextRef.current = null;
  };

  const startSynth = async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setAudioError(true);
      return false;
    }

    const context = new AudioContext();
    contextRef.current = context;
    await context.resume();
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 392, 349.23];
    let noteIndex = 0;
    const playNote = () => {
      if (context.state !== "running") return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.value = notes[noteIndex++ % notes.length];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 1.2);
    };
    playNote();
    intervalRef.current = window.setInterval(playNote, 850);
    return true;
  };

  const toggleMusic = async () => {
    if (isPlaying) {
      if (MUSIC_SRC) audioRef.current?.pause();
      else stopSynth();
      setIsPlaying(false);
      return;
    }
    setAudioError(false);
    if (MUSIC_SRC) {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch {
        setAudioError(true);
      }
    } else {
      setIsPlaying(await startSynth());
    }
  };

  useEffect(() => () => {
    stopSynth();
  }, []);

  return (
    <>
      {MUSIC_SRC && (
        <audio
          ref={audioRef}
          src={MUSIC_SRC}
          loop
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setIsPlaying(false);
            setAudioError(true);
          }}
        />
      )}
      <div className="music-wrap">
        <motion.button
          className={`music-button${isPlaying ? " music-button-playing" : ""}`}
          onClick={toggleMusic}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={isPlaying ? "Pause background music" : "Play background music"}
          title={isPlaying ? "Pause the music" : "Play a little music"}
        >
          {isPlaying ? <Pause size={17} /> : <Music2 size={18} />}
          <span>{isPlaying ? "Music on" : "Our little soundtrack"}</span>
          {isPlaying && <span className="music-bars" aria-hidden="true"><i /><i /><i /></span>}
        </motion.button>
        {audioError && <span className="music-error">Add a music file at public/music/birthday-song.mp3</span>}
      </div>
    </>
  );
}

function Envelope({ opened, onOpen }) {
  return (
    <div className={`envelope-wrap${opened ? " envelope-open" : ""}`}>
      <motion.div
        className="envelope"
        initial={{ y: 18, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <motion.div className="envelope-letter" animate={opened ? { y: -82, scale: 1.08 } : { y: 0, scale: 1 }} transition={{ duration: 0.75 }}>
          <span>For your special day</span>
          <Heart size={22} fill="currentColor" />
        </motion.div>
        <div className="envelope-back" />
        <div className="envelope-front" />
        <motion.div className="envelope-flap" animate={opened ? { rotateX: 180 } : { rotateX: 0 }} transition={{ duration: 0.7 }} />
        <span className="envelope-seal"><Heart size={18} fill="currentColor" /></span>
      </motion.div>
      <motion.button
        className="button button-primary hero-button"
        onClick={onOpen}
        whileHover={{ y: -3, boxShadow: "0 16px 34px rgba(173, 86, 126, .22)" }}
        whileTap={{ scale: 0.97 }}
      >
        {opened ? "A note, just for you" : "Open your surprise"}
        <span className="button-emoji">💌</span>
      </motion.button>
    </div>
  );
}

function ConfettiBurst({ burst }) {
  const pieces = Array.from({ length: 34 }, (_, index) => ({
    x: `${Math.cos((index / 34) * Math.PI * 2) * (65 + (index % 4) * 20)}vw`,
    y: `${Math.sin((index / 34) * Math.PI * 2) * (45 + (index % 3) * 15)}vh`,
    hue: [342, 22, 46, 275, 4][index % 5],
    delay: (index % 8) * 0.025,
  }));
  return (
    <AnimatePresence>
      {burst > 0 && (
        <div className="confetti-layer" key={burst} aria-hidden="true">
          {pieces.map((piece, index) => (
            <motion.i
              key={`${burst}-${index}`}
              className="confetti-piece"
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
              animate={{ x: piece.x, y: piece.y, opacity: 0, rotate: 520, scale: 1 }}
              transition={{ duration: 1.8 + (index % 4) * 0.15, delay: piece.delay, ease: "easeOut" }}
              style={{ backgroundColor: `hsl(${piece.hue} 75% 68%)` }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function BirthdayCake({ wished }) {
  return (
    <div className={`cake-scene${wished ? " candles-out" : ""}`} aria-label={wished ? "A birthday cake with extinguished candles" : "A birthday cake with glowing candles"}>
      <div className="cake-sparkles" aria-hidden="true">✦　·　✧　·　✦</div>
      <div className="candles">
        {[0, 1, 2].map((candle) => (
          <div className="candle" key={candle}>
            <span className="flame" />
            <span className="candle-stick" />
          </div>
        ))}
      </div>
      <div className="cake cake-top"><span className="icing-drip" /></div>
      <div className="cake cake-middle" />
      <div className="cake cake-bottom" />
      <div className="cake-plate" />
      {wished && <motion.span className="wish-smoke" initial={{ opacity: 0, y: 5 }} animate={{ opacity: [0, 0.7, 0], y: -36 }} transition={{ duration: 1.4 }}>✧</motion.span>}
    </div>
  );
}

function MemoryCard({ item, index }) {
  return (
    <motion.article
      className="polaroid"
      initial={{ opacity: 0, y: 30, rotate: index % 2 ? 3 : -3 }}
      whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 2 : -2 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay: index * 0.09 }}
      whileHover={{ y: -12, rotate: 0, scale: 1.04, transition: { duration: 0.25 } }}
    >
      <div className="polaroid-photo">
        <img src={item.image} alt={item.alt} loading="lazy" />
        <span className="photo-shine" />
      </div>
      <div className="polaroid-caption">
        <strong>{item.caption}</strong>
        <span>{item.note}</span>
      </div>
    </motion.article>
  );
}

function App() {
  const [opened, setOpened] = useState(false);
  const [wished, setWished] = useState(false);
  const [burst, setBurst] = useState(0);
  const [finalRevealed, setFinalRevealed] = useState(false);
  const [letterVisible, setLetterVisible] = useState(false);
  const celebrationRef = useRef(null);

  const openSurprise = () => {
    if (opened) {
      celebrationRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setOpened(true);
    setLetterVisible(true);
    window.setTimeout(() => celebrationRef.current?.scrollIntoView({ behavior: "smooth" }), 2500);
  };

  const makeWish = () => {
    if (wished) return;
    setWished(true);
    setBurst((count) => count + 1);
  };

  return (
    <main className="min-h-screen">
      <MusicControl />
      <section className="hero-section" id="home">
        <FloatingDetails />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <header className="site-header">
          <a className="brand" href="#home" aria-label="A little birthday surprise, home">
            <span className="brand-icon"><Heart size={15} fill="currentColor" /></span>
            <span>a little something</span>
          </a>
          <span className="header-note">made with love, just for you <span>♡</span></span>
        </header>

        <div className="hero-content">
          <motion.div className="hero-pretitle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Sparkles size={14} /> a tiny surprise for a very special girl
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}>
            Hey Beautiful <span className="hero-heart">,</span>
            <span className="hero-name">{RECIPIENT_NAME} <i>♡</i></span>
          </motion.h1>
          <motion.p className="hero-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}>
            Someone has a little surprise for you...
          </motion.p>
          <Envelope opened={opened} onOpen={openSurprise} />
          <AnimatePresence>
            {letterVisible && (
              <motion.div className="opening-note" initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.3 }}>
                <span className="opening-note-script">To my favourite person,</span>
                <p>Today, the world gets a little brighter because it gets to celebrate <em>you.</em></p>
                <span className="opening-note-sign">— {SENDER_NAME} <Heart size={12} fill="currentColor" /></span>
              </motion.div>
            )}
          </AnimatePresence>
          <a className="scroll-cue" href="#celebration"><span>there&apos;s more, keep going</span><ArrowDown size={15} /></a>
        </div>
        <div className="hero-bottom-note"><span>01</span><span className="hero-bottom-rule" /><span>YOUR DAY, YOUR MAGIC</span></div>
      </section>

      <section className="celebration-section" id="celebration" ref={celebrationRef}>
        <FloatingDetails />
        <ConfettiBurst burst={burst} />
        <div className="celebration-content">
          <SectionHeading eyebrow="the day we celebrate you" title={<>Happy Birthday,<br /><em>Girl!</em> <span className="cake-emoji">♡</span></>}>
            Today is all about you and the beautiful smile that makes everything brighter.
          </SectionHeading>
          <div className="birthday-stage">
            <div className="balloon balloon-pink"><span /></div>
            <div className="balloon balloon-lilac"><span /></div>
            <div className="balloon balloon-peach"><span /></div>
            <BirthdayCake wished={wished} />
            <div className="stage-flower flower-left">✿</div>
            <div className="stage-flower flower-right">✿</div>
          </div>
          <motion.button className={`button button-primary wish-button${wished ? " wish-button-done" : ""}`} onClick={makeWish} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
            {wished ? "Your wish is on its way" : "Make a wish"}
            <Sparkles size={16} />
          </motion.button>
          <span className="wish-footnote">{wished ? "The universe is listening ✨" : "Close your eyes, make it a good one"} </span>
        </div>
        <span className="section-index">02 <span> / THE CELEBRATION</span></span>
      </section>

      <section className="letter-section" id="letter">
        <div className="letter-inner">
          <motion.div className="letter-copy" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
            <SectionHeading eyebrow="a little note, from me to you" title={<>A few words<br />from my <em>heart.</em> <span>♡</span></>} />
            <p className="letter-intro">Some things are easier to write down. So, here goes...</p>
            <div className="signature">
              <span>With all my heart,</span>
              <strong>{SENDER_NAME}</strong>
            </div>
          </motion.div>
          <motion.article className="letter-card" initial={{ opacity: 0, y: 35, rotate: 1.5 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8 }}>
            <span className="letter-card-stamp"><Heart size={19} fill="currentColor" /></span>
            <span className="letter-card-date">A NOTE FOR YOUR BIRTHDAY <span>✦</span></span>
            <div className="letter-rule" />
            <motion.div
              className="letter-handwriting"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.035 } } }}
            >
              {"Aaj ke din khush raho, Jyda Stress lene ki jarrorat nahi hai.".split(" ").map((word, index) => (
                <motion.span key={index} variants={{ hidden: { opacity: 0, y: 7 }, visible: { opacity: 1, y: 0 } }}>{word} </motion.span>
              ))}
            </motion.div>
            <motion.p className="letter-handwriting letter-second-paragraph" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.8 }}>
              Keep smiling, keep shining and never stop being the amazing person you are.
            </motion.p>
            <motion.p className="letter-handwriting letter-last-line" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 3.2 }}>
              Happy Birthday once again! <span className="letter-heart">♥</span>
            </motion.p>
            <span className="letter-card-flower" aria-hidden="true">✿</span>
          </motion.article>
          <span className="letter-decoration letter-decoration-one" aria-hidden="true">♡</span>
          <span className="letter-decoration letter-decoration-two" aria-hidden="true">✦</span>
        </div>
        <span className="section-index">03 <span> / FROM THE HEART</span></span>
      </section>

  

      <section className="final-section" id="final">
        <div className="night-sky" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => <i key={index} style={{ left: `${(index * 43 + 5) % 100}%`, top: `${(index * 29 + 7) % 100}%`, animationDelay: `${(index % 9) * 0.35}s` }} />)}
        </div>
        <div className="final-glow" />
        <div className="final-content">
          <SectionHeading eyebrow="just one last thing" title={<>One last<br /><em>thing...</em> <span>♡</span></>} light />
          <AnimatePresence mode="wait">
            {!finalRevealed ? (
              <motion.div className="final-prompt" key="prompt" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}>
                <p>Okay, promise this is the last one.</p>
                <motion.button className="button button-light" onClick={() => setFinalRevealed(true)} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  Click for a little surprise <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div className="final-message" key="message" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <motion.div className="final-heart" initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.18, 1], rotate: 0 }} transition={{ duration: 0.8, times: [0, 0.65, 1] }}>
                  <Heart size={45} fill="currentColor" strokeWidth={1.3} />
                  <span className="final-heart-spark">✦</span>
                </motion.div>
                <p>I may not have the perfect words, but I genuinely wish you a lifetime of smiles, peace and happiness. You deserve the very best. <strong>Happy Birthday, Beautiful!</strong> <span>❤️</span></p>
                <div className="final-signature">
                  <span>With lots of love,</span>
                  <strong>Your Special Someone <Heart size={12} fill="currentColor" /></strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <footer className="site-footer">
          <span>made with a little extra love</span>
          <span><Heart size={12} fill="currentColor" /> for {RECIPIENT_NAME}, always</span>
          <a href="#home">back to the top <ArrowDown size={12} /></a>
        </footer>
        <span className="section-index section-index-light">04 <span> / JUST FOR YOU</span></span>
      </section>
    </main>
  );
}

export default App;
