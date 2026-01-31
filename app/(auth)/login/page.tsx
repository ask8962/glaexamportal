'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ui/Toast';

// --- Canvas Logic ---

function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Particles
        const particles: Particle[] = [];
        const particleCount = 150; // Density
        const connectionDistance = 150;
        const mouseDistance = 200;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                // Premium palette: Blue/Violet/White
                const colors = ['rgba(139, 92, 246, 0.5)', 'rgba(56, 189, 248, 0.5)', 'rgba(255, 255, 255, 0.3)'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off walls
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Interaction with mouse
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    // Gentle easing towards mouse (gravity)
                    this.vx += dx * 0.0001;
                    this.vy += dy * 0.0001;
                }

                // Drag/Friction to stop infinite speed
                this.vx *= 0.99;
                this.vy *= 0.99;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Initialize
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and Draw Particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw Connections
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-black" />;
}

// --- UI Components ---

function ModernInput({
    label, type, value, onChange, placeholder, disabled, icon
}: {
    label: string, type: string, value: string, onChange: (e: any) => void, placeholder: string, disabled: boolean, icon: any
}) {
    const [focus, setFocus] = useState(false);

    return (
        <div className="mb-6 relative">
            <div
                className={`flex items-center bg-white/5 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden ${focus
                        ? 'border-violet-400/50 shadow-[0_0_30px_rgba(139,92,246,0.2)]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
            >
                <div className={`pl-5 transition-colors ${focus ? 'text-violet-400' : 'text-gray-400'}`}>
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    className="w-full bg-transparent px-5 py-4 text-white placeholder-gray-500 focus:outline-none text-base"
                />
            </div>
            <label
                className={`absolute left-12 transition-all duration-300 pointer-events-none ${focus || value ? '-top-6 text-xs text-violet-400' : 'top-4 text-gray-500 opacity-0'
                    }`}
            >
                {label}
            </label>
        </div>
    );
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signIn(email, password);
            Cookies.set('user-email', email, { expires: 7 });
            const isAdmin = email === 'ganukalp70@gmail.com';
            showToast.success('Welcome back, Traveler.');
            router.push(isAdmin ? '/admin' : '/dashboard');
        } catch (error: unknown) {
            showToast.error('Dimensions misaligned. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            showToast.success('Portal opened.');
            router.push('/dashboard');
        } catch (error: unknown) {
            showToast.error('Connection severed.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">

            {/* The Living Background */}
            <InteractiveBackground />

            {/* The Floating Monolith (Card) */}
            <div className="relative z-10 w-full max-w-md p-8 animate-float">

                {/* Glass Container */}
                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">

                    {/* Inner Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.8)]" />

                    <div className="text-center mb-10 mt-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500 mb-6 shadow-lg animate-pulse-slow">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        </div>
                        <h1 className="text-3xl font-light text-white tracking-wide">Enter the Portal</h1>
                        <p className="text-gray-400 text-sm mt-2 font-light">Your journey begins here.</p>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <ModernInput
                            label="Email"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isLoading}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                        />
                        <ModernInput
                            label="Password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isLoading}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-white text-black rounded-2xl font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
                        >
                            {isLoading ? 'Initializing...' : 'Login'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="h-[1px] bg-white/10 flex-1" />
                        <span className="text-xs text-gray-500 uppercase tracking-widest">or</span>
                        <div className="h-[1px] bg-white/10 flex-1" />
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors text-gray-300 hover:text-white group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </button>

                    <div className="mt-8 text-center">
                        <Link href="/register" className="text-gray-500 text-sm hover:text-white transition-colors">
                            Need an account? <span className="text-violet-400">Join here</span>
                        </Link>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
