import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

const STAR_COUNT = 160;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: randomBetween(0, 100),
  y: randomBetween(0, 100),
  size: randomBetween(0.8, 2.8),
  opacity: randomBetween(0.3, 1),
  duration: randomBetween(3, 9),
  delay: randomBetween(0, 6),
}));

export default function LoadingScreen() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const counterRef = useRef(null);
  const glowRef = useRef(null);

  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [letters] = useState("Freelance Studio".split(""));

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX / width - 0.5) * 30);
    mouseY.set((clientY / height - 0.5) * 30);
    if (glowRef.current) {
      glowRef.current.style.left = clientX + "px";
      glowRef.current.style.top = clientY + "px";
    }
  }, [mouseX, mouseY]);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(logoRef.current,
      { scale: 0.6, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 1.1, ease: "expo.out" }
    )
    .fromTo(textRef.current?.children ?? [],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "expo.out" },
      "-=0.5"
    )
    .fromTo(counterRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5 },
      "-=0.3"
    );

    // Counter 0 → 100
    let start = null;
    const duration = 3800;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * 100));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(100);
        setTimeout(() => setDone(true), 400);
      }
    }
    requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (!done) return;
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.03,
      duration: 0.9,
      ease: "expo.inOut",
      onComplete: () => navigate("/login"),
    });
  }, [done, navigate]);

  return (
    <AnimatePresence>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="fixed inset-0 overflow-hidden bg-black"
        style={{ zIndex: 9999 }}
      >
        {/* Noise grain */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        {/* Galaxy gradient */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, #2d0a1f 0%, #1a0510 40%, #000000 100%)",
        }} />

        {/* Aurora top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(236,72,153,0.15) 0%, transparent 70%)" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Aurora bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(190,24,93,0.12) 0%, transparent 70%)" }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Stars */}
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Mouse glow */}
        <div
          ref={glowRef}
          className="pointer-events-none fixed"
          style={{
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.12s ease, top 0.12s ease",
          }}
        />

        {/* Center content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6"
          style={{ x: springX, y: springY }}
        >
          {/* Logo */}
          <div ref={logoRef} style={{ opacity: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg"
              style={{ boxShadow: "0 0 40px rgba(236,72,153,0.5), 0 0 80px rgba(236,72,153,0.2)" }}>
              <span className="text-black font-bold text-2xl select-none">FS</span>
            </div>
          </div>

          {/* Title letters */}
          <div ref={textRef} className="flex gap-[2px]">
            {letters.map((l, i) => (
              <span
                key={i}
                className="text-white font-light tracking-[0.25em] text-xl md:text-2xl select-none"
                style={{ opacity: 0, textShadow: "0 0 20px rgba(236,72,153,0.5)" }}
              >
                {l === " " ? "\u00A0" : l}
              </span>
            ))}
          </div>

          {/* Counter + dots */}
          <div ref={counterRef} className="flex flex-col items-center gap-4 mt-2" style={{ opacity: 0 }}>
            <span className="text-pink-300/70 text-xs tracking-widest tabular-nums select-none">
              {String(count).padStart(3, "0")}%
            </span>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
