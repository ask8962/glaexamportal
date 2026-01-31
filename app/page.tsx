'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, ReactNode } from 'react';

// --- Custom Hooks ---

function useMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  return mouse;
}

function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentScrollY = window.scrollY;
      const speed = currentScrollY - lastScrollY;
      setVelocity(speed * 0.5);
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return velocity;
}

// --- Components ---

function ScrambleText({ children, className = '' }: { children: string, className?: string }) {
  const [text, setText] = useState(children);
  const chars = '!@#$%^&*()_+{}:"<>?|~`1234567890-=';
  const intervalRef = useRef<NodeJS.Timeout>(null);

  const startScramble = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setText(prev =>
        children.split('').map((char, index) => {
          if (index < iteration) return children[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );

      if (iteration >= children.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span
      className={className}
      onMouseEnter={startScramble}
      style={{ fontFamily: 'monospace' }} // Monospace for stability
    >
      {text}
    </span>
  );
}

function VelocityText({ children, className = '' }: { children: ReactNode, className?: string }) {
  const velocity = useScrollVelocity();
  const [skew, setSkew] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setSkew(velocity), 10);
    return () => clearTimeout(timeout);
  }, [velocity]);

  return (
    <h2
      className={`transition-transform duration-100 ease-out will-change-transform ${className}`}
      style={{ transform: `skewX(${-skew}deg)` }}
    >
      {children}
    </h2>
  );
}

function FluidBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
      <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-violet-600 rounded-full blur-[150px] animate-blob mix-blend-multiply" />
      <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-600 rounded-full blur-[150px] animate-blob animation-delay-2000 mix-blend-multiply" />
      <div className="absolute bottom-[-40%] left-[20%] w-[80vw] h-[80vw] bg-pink-600 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-multiply" />
    </div>
  );
}

function MagneticLink({ children, href, className = '' }: { children: string, href: string, className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    setPosition({ x: x * 0.5, y: y * 0.5 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className={`inline-block transition-transform duration-200 ease-out select-none ${className}`}
    >
      <ScrambleText>{children}</ScrambleText>
    </Link>
  );
}

function PortalSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const start = top - viewportHeight;
      const end = top + height;
      const progress = 1 - (top / viewportHeight);

      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[250vh] z-20">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center bg-[#111] text-white transition-colors duration-500">

        {/* The Portal Mask */}
        <div
          className="absolute inset-0 bg-[#000] z-10 flex items-center justify-center pointer-events-none"
          style={{
            clipPath: `circle(${scrollProgress * 150}% at 50% 50%)`,
          }}
        >
          {/* Inner Content (Revealed) */}
          <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center text-white relative overflow-hidden">
            <FluidBackground />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

            <div className="z-10 text-center mix-blend-difference">
              <h2 className="text-[12vw] font-bold leading-none tracking-tighter mb-4">THE CORE</h2>
              <div className="text-2xl font-mono text-gray-400">Where data meets design</div>
            </div>

            {/* 3D Floating Elements */}
            <div
              className="absolute w-[40vw] h-[40vw] border border-white/20 rounded-full animate-spin-slow"
              style={{ transform: `rotateX(60deg) rotateZ(${scrollProgress * 360}deg)` }}
            />
            <div
              className="absolute w-[30vw] h-[30vw] border border-white/20 rounded-full animate-spin-slow-reverse"
              style={{ transform: `rotateY(60deg) rotateZ(${scrollProgress * -360}deg)` }}
            />

            {/* Floating Cards */}
            <div
              className="absolute top-1/2 left-1/4 w-64 h-80 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md p-6"
              style={{ transform: `translateY(${-scrollProgress * 150}px) rotate(-10deg) scale(${0.8 + scrollProgress * 0.2})` }}
            >
              <div className="w-10 h-10 rounded-full bg-violet-600 mb-4" />
              <div className="h-2 w-24 bg-white/20 rounded mb-2" />
              <div className="h-2 w-16 bg-white/20 rounded" />
            </div>

          </div>
        </div>

        {/* Outer Content (Masking) */}
        <div className="text-center z-0 scale-up">
          <div className="text-[12vw] font-black leading-none tracking-tighter opacity-10 uppercase">
            Unlock<br />Potential
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Main Page ---

export default function HomePage() {
  const mouse = useMousePosition();

  // Scroll marquee logic
  const [marqueePos, setMarqueePos] = useState(0);
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setMarqueePos(prev => (prev - 1) % 100);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="bg-[#020202] min-h-screen text-white overflow-x-hidden selection:bg-violet-500 selection:text-white cursor-none">

      {/* Custom Cursor */}
      <div
        className="fixed w-4 h-4 bg-white rounded-full mix-blend-difference pointer-events-none z-[100] transition-transform duration-75 ease-out flex items-center justify-center"
        style={{ left: mouse.x - 8, top: mouse.y - 8 }}
      />
      <div
        className="fixed w-12 h-12 border border-white rounded-full mix-blend-difference pointer-events-none z-[100] transition-transform duration-300 ease-out flex items-center justify-center delay-100"
        style={{ left: mouse.x - 24, top: mouse.y - 24 }}
      />


      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-8 flex justify-between items-center mix-blend-difference">
        <Link href="/" className="text-2xl font-bold tracking-tighter">EP<span className="text-violet-500">.</span></Link>
        <div className="hidden md:flex gap-12 font-mono text-sm">
          <MagneticLink href="#features">FEATURES</MagneticLink>
          <MagneticLink href="#about">ABOUT</MagneticLink>
          <MagneticLink href="/login">LOGIN</MagneticLink>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 h-screen flex flex-col justify-center px-8 md:px-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -left-[20%] w-[100vw] h-[100vw] bg-[radial-gradient(circle,rgba(139,92,246,0.3)_0%,transparent_70%)] animate-pulse-slow" />
        </div>

        <div className="relative z-20">
          <div className="overflow-hidden mb-4">
            <div className="text-sm font-mono text-violet-400 mb-4 animate-slide-up">
              &gt; SYSTEM_READY
            </div>
          </div>

          <h1 className="text-[11vw] font-bold leading-[0.8] tracking-tighter uppercase relative mix-blend-overlay">
            <span className="block animate-slide-up hover:text-violet-500 transition-colors duration-500 cursor-none">Cognitive</span>
            <span className="block animate-slide-up animation-delay-100 italic font-serif opacity-80 pl-24">Evaluation</span>
            <span className="block animate-slide-up animation-delay-200 text-transparent stroke-text hover:text-white transition-all duration-500">Platform</span>
          </h1>

          <div className="mt-16 max-w-lg ml-auto border-l-2 border-violet-500 pl-8">
            <p className="text-xl text-gray-400 font-light leading-relaxed animate-fade-in">
              Identify talent through <span className="text-white font-medium">adaptive intelligence</span>.
              The future of assessment is here, and it's powered by pure data.
            </p>
            <div className="mt-8">
              <Link href="/register" className="inline-flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <ScrambleText className="font-mono text-sm tracking-widest">INITIALIZE_SEQUENCE</ScrambleText>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Infinite Marquee */}
      <div className="py-24 overflow-hidden bg-white text-black border-y border-neutral-800 rotate-1 scale-105">
        <div className="whitespace-nowrap flex" style={{ transform: `translateX(${marqueePos}%)` }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-8xl font-black italic tracking-tighter mx-8">
              PRECISION GRADED <span className="text-transparent stroke-text-black">INSTANTLY</span> •
            </span>
          ))}
        </div>
      </div>

      {/* Portal Reveal Section */}
      <PortalSection />

      {/* Grid Features */}
      <section className="py-40 px-8 bg-[#111]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { id: '01', title: 'Neural Engines', desc: 'AI-driven grading that learns from your rubric.' },
              { id: '02', title: 'Live Telemetry', desc: 'Real-time student performance tracking.' },
              { id: '03', title: 'Quantum Encryption', desc: 'Enterprise-grade security for every byte.' },
              { id: '04', title: 'Global CDN', desc: 'Latency-free testing from anywhere on Earth.' }
            ].map((item, i) => (
              <div key={i} className="group border-t border-white/20 py-12 hover:bg-neutral-900/50 transition-colors duration-300 cursor-none">
                <div className="flex justify-between items-start mb-8">
                  <span className="font-mono text-violet-500 text-sm">/{item.id}</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
                <h3 className="text-5xl font-bold mb-4 group-hover:translate-x-4 transition-transform duration-300">{item.title}</h3>
                <p className="text-gray-500 max-w-md group-hover:translate-x-4 transition-transform duration-300 delay-75">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-[80vh] flex flex-col justify-between p-12 bg-black text-white relative overflow-hidden">
        <FluidBackground />

        <div className="flex justify-between items-start z-10">
          <div className="font-bold text-2xl tracking-tighter">EP.</div>
          <div className="flex gap-8 font-mono text-sm text-gray-400">
            <Link href="#" className="hover:text-white">TWITTER</Link>
            <Link href="#" className="hover:text-white">LINKEDIN</Link>
            <Link href="#" className="hover:text-white">GITHUB</Link>
          </div>
        </div>

        <div className="text-center z-10">
          <h2 className="text-[12vw] font-bold leading-none tracking-tighter mix-blend-difference hover:italic transition-all duration-300">
            CREATE
          </h2>
          <Link href="/register" className="inline-block mt-8 px-12 py-4 bg-white text-black rounded-full font-bold hover:scale-110 transition-transform duration-300">
            GET STARTED
          </Link>
        </div>

        <div className="flex justify-between items-end z-10 text-xs font-mono text-gray-500 border-t border-white/10 pt-8">
          <div>BASE_STATION: MUMBAI</div>
          <div>STATUS: ONLINE</div>
        </div>
      </footer>

      <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 2px white;
        }
        .stroke-text-black {
           -webkit-text-stroke: 2px black;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
            animation: fade-in 1.5s ease-out forwards;
            opacity: 0;
            animation-delay: 0.5s;
        }
        @keyframes fade-in {
             to { opacity: 1; }
        }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        
        .cursor-none {
            cursor: none;
        }
        
        @keyframes spin-slow {
             from { transform: rotateX(60deg) rotateZ(0deg); }
             to { transform: rotateX(60deg) rotateZ(360deg); }
        }
        @keyframes spin-slow-reverse {
             from { transform: rotateY(60deg) rotateZ(360deg); }
             to { transform: rotateY(60deg) rotateZ(0deg); }
        }
        .animate-spin-slow {
             animation: spin-slow 20s linear infinite;
        }
         .animate-spin-slow-reverse {
             animation: spin-slow-reverse 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
