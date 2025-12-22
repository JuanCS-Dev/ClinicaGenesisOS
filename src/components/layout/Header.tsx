import React from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { CommandPalette, useCommandPalette } from '../search';

export const Header: React.FC = () => {
  const { isOpen, open, close } = useCommandPalette();

  return (
    <>
    <header className="h-16 px-8 flex items-center justify-between sticky top-0 z-10 bg-genesis-soft/80 backdrop-blur-xl border-b border-genesis-border/50 transition-all duration-300">
      {/* Search Trigger - Opens Command Palette */}
      <div className="flex items-center flex-1">
        <button
          onClick={open}
          className="relative group w-96 hidden md:flex items-center gap-2 px-3 py-2 bg-white/60 border border-transparent rounded-xl text-sm text-genesis-medium/70 shadow-sm hover:bg-white/80 hover:shadow-glow transition-all duration-300"
        >
          <Search className="w-4 h-4 text-genesis-medium" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 rounded border border-gray-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <button className="relative p-2 text-genesis-medium hover:text-genesis-dark hover:bg-white rounded-full transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm"></span>
        </button>
        
        <div className="h-6 w-px bg-genesis-medium/20"></div>
        
        <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white transition-all duration-200 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-genesis-blue to-blue-400 flex items-center justify-center text-white text-xs font-semibold shadow-md ring-2 ring-white group-hover:ring-genesis-blue/20 transition-all">
            DA
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-genesis-dark leading-tight">Dr. André</p>
            <p className="text-[10px] font-medium text-genesis-medium">Nutricionista</p>
          </div>
          <ChevronDown className="w-3 h-3 text-genesis-medium group-hover:text-genesis-dark transition-colors" />
        </button>
      </div>
    </header>
    
    {/* Command Palette Modal */}
    <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  );
};