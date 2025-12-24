import React, { useState, useEffect } from 'react';
import { Activity, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-genesis-surface/90 backdrop-blur-xl border-b border-genesis-border/50 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-genesis-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
            <Activity className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tighter leading-none text-genesis-dark">CLÍNICA<span className="text-genesis-primary">GENESIS</span></span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-genesis-medium font-bold">System One</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {['Manifesto', 'Tecnologia', 'Membership'].map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/${item.toLowerCase()}`)}
                className="text-xs font-bold uppercase tracking-widest text-genesis-muted hover:text-genesis-dark transition-colors relative group"
              >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-genesis-dark transition-all duration-300 group-hover:w-full"></span>
              </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="hidden md:block text-xs font-bold uppercase tracking-wider text-genesis-dark hover:text-genesis-primary transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/apply')}
            className="px-6 py-3 bg-genesis-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-genesis-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 group"
          >
            <Lock className="w-3 h-3 group-hover:text-genesis-primary transition-colors" />
            Falar com Concierge
          </button>
        </div>
      </div>
    </nav>
  );
}
