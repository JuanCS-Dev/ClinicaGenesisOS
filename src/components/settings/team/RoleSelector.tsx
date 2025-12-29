/**
 * Role Selector Component
 *
 * Dropdown for selecting user roles with visual indicators.
 *
 * @module components/settings/team/RoleSelector
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Crown, Shield, Stethoscope, UserCircle } from 'lucide-react'
import type { UserRole } from '@/types/clinic/clinic'

interface RoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
  disabled?: boolean
  isOwner?: boolean
}

interface RoleConfig {
  label: string
  description: string
  icon: typeof Crown
  color: string
  bgColor: string
}

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  owner: {
    label: 'Proprietário',
    description: 'Acesso total à clínica',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  admin: {
    label: 'Administrador',
    description: 'Gerencia equipe e financeiro',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  professional: {
    label: 'Profissional',
    description: 'Atende pacientes e prontuários',
    icon: Stethoscope,
    color: 'text-genesis-primary',
    bgColor: 'bg-genesis-soft',
  },
  receptionist: {
    label: 'Recepcionista',
    description: 'Agenda e cadastros básicos',
    icon: UserCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
}

// Roles that can be assigned (owner cannot be assigned)
const ASSIGNABLE_ROLES: UserRole[] = ['admin', 'professional', 'receptionist']

export function RoleSelector({
  value,
  onChange,
  disabled = false,
  isOwner = false,
}: RoleSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentRole = ROLE_CONFIG[value]
  const Icon = currentRole.icon

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

  // Owner role is never changeable
  if (isOwner || value === 'owner') {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${currentRole.bgColor} ${currentRole.color}
          text-sm font-medium
        `}
      >
        <Icon className="w-4 h-4" />
        {currentRole.label}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${currentRole.bgColor} ${currentRole.color}
          text-sm font-medium
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
        `}
      >
        <Icon className="w-4 h-4" />
        {currentRole.label}
        {!disabled && (
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-genesis-surface border border-genesis-border-subtle rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {ASSIGNABLE_ROLES.map(role => {
            const config = ROLE_CONFIG[role]
            const RoleIcon = config.icon
            const isSelected = role === value

            return (
              <button
                key={role}
                type="button"
                onClick={() => {
                  onChange(role)
                  setIsOpen(false)
                }}
                className={`
                  w-full flex items-start gap-3 p-3 text-left
                  transition-colors duration-150
                  ${isSelected ? 'bg-genesis-soft' : 'hover:bg-genesis-hover'}
                `}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                >
                  <RoleIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div>
                  <div
                    className={`font-medium ${isSelected ? 'text-genesis-primary' : 'text-genesis-dark'}`}
                  >
                    {config.label}
                  </div>
                  <div className="text-xs text-genesis-muted">{config.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
