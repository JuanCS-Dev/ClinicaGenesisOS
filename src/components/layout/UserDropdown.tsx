/**
 * UserDropdown Component
 *
 * Premium dropdown menu for user profile actions.
 * Used in Header for quick access to settings, help, and logout.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Shield,
  CreditCard,
  Building2,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useClinicContext } from '@/contexts/ClinicContext'
import { useTheme } from '@/design-system'

interface UserDropdownProps {
  className?: string
}

export function UserDropdown({ className = '' }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const { userProfile, clinic } = useClinicContext()
  const { theme, setTheme } = useTheme()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getSpecialtyLabel = (specialty?: string) => {
    const labels: Record<string, string> = {
      medicina: 'Médico(a)',
      nutricao: 'Nutricionista',
      psicologia: 'Psicólogo(a)',
    }
    return labels[specialty || ''] || 'Profissional'
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handleNavigate = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // Get theme icon based on current theme
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 pl-1 pr-2 py-1 rounded-full transition-all duration-200 group
          ${isOpen ? 'bg-genesis-surface shadow-md' : 'hover:bg-genesis-surface'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full ring-2 ring-white group-hover:ring-genesis-primary/20 transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-genesis-primary flex items-center justify-center text-white text-xs font-semibold shadow-md ring-2 ring-white group-hover:ring-genesis-primary/20 transition-all">
            {getInitials(user?.displayName)}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-genesis-dark leading-tight">
            {user?.displayName || 'Usuário'}
          </p>
          <p className="text-[10px] font-medium text-genesis-medium">
            {getSpecialtyLabel(userProfile?.specialty)}
          </p>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-genesis-medium transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-genesis-surface rounded-2xl shadow-xl border border-genesis-border-subtle overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info Header */}
          <div
            className="p-4 border-b border-genesis-border-subtle"
            style={{
              background: 'linear-gradient(to bottom right, rgba(15, 118, 110, 0.05), transparent)',
            }}
          >
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-xl border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-genesis-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {getInitials(user?.displayName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-genesis-dark truncate">
                  {user?.displayName || 'Usuário'}
                </p>
                <p className="text-xs text-genesis-muted truncate">{user?.email}</p>
                {clinic?.name && (
                  <p className="text-[10px] text-genesis-primary font-medium mt-0.5 truncate">
                    {clinic.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* Profile Section */}
            <div className="mb-1">
              <p className="px-3 py-1.5 text-[10px] font-bold text-genesis-subtle uppercase tracking-wider">
                Conta
              </p>
              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                  <User className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                </div>
                <span>Meu Perfil</span>
              </button>
              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                  <Building2 className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                </div>
                <span>Dados da Clínica</span>
              </button>
            </div>

            {/* Settings Section */}
            <div className="mb-1 pt-1 border-t border-genesis-border-subtle">
              <p className="px-3 py-1.5 text-[10px] font-bold text-genesis-subtle uppercase tracking-wider">
                Configurações
              </p>
              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                  <Settings className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                </div>
                <span>Preferências</span>
              </button>
              <button
                onClick={() => handleNavigate('/billing')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                  <CreditCard className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                </div>
                <span>Faturamento TISS</span>
              </button>
              <button
                onClick={cycleTheme}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                    <ThemeIcon className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                  </div>
                  <span>Tema</span>
                </div>
                <span className="text-xs text-genesis-muted capitalize bg-genesis-hover px-2 py-0.5 rounded">
                  {theme === 'system' ? 'Auto' : theme === 'dark' ? 'Escuro' : 'Claro'}
                </span>
              </button>
            </div>

            {/* Help & Support */}
            <div className="mb-1 pt-1 border-t border-genesis-border-subtle">
              <button
                onClick={() => handleNavigate('/help')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                  <HelpCircle className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                </div>
                <span>Ajuda & Suporte</span>
              </button>
              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-genesis-soft group-hover:bg-genesis-primary/10 transition-colors">
                  <Shield className="w-4 h-4 text-genesis-muted group-hover:text-genesis-primary transition-colors" />
                </div>
                <span>Privacidade & LGPD</span>
              </button>
            </div>

            {/* Logout */}
            <div className="pt-1 border-t border-genesis-border-subtle">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDropdown
