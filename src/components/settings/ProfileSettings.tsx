/**
 * Profile Settings Component
 * ==========================
 *
 * User profile management: name, photo, specialty, contact info.
 */

import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, Loader2 } from 'lucide-react';
import { useClinicContext } from '@/contexts/ClinicContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { SpecialtyType } from '@/types';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuthContext();
  const { userProfile, updateUserProfile, refreshUserProfile } = useClinicContext();

  const [formData, setFormData] = useState({
    displayName: '',
    specialty: 'medicina' as SpecialtyType,
  });
  const [saving, setSaving] = useState(false);

  // Initialize form with current profile
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        specialty: userProfile.specialty || 'medicina',
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        specialty: formData.specialty,
      });

      await refreshUserProfile();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const specialties = [
    { value: 'medicina', label: 'Medicina' },
    { value: 'nutricao', label: 'Nutrição' },
    { value: 'psicologia', label: 'Psicologia' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-genesis-dark">Meu Perfil</h2>
        <p className="text-sm text-genesis-muted mt-1">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-4 p-4 bg-genesis-soft rounded-xl">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-genesis-primary flex items-center justify-center text-white text-2xl font-bold">
            {formData.displayName
              ? formData.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 p-1.5 bg-genesis-surface border border-genesis-border rounded-full shadow-sm hover:bg-genesis-hover transition-colors">
            <Camera className="w-4 h-4 text-genesis-muted" />
          </button>
        </div>
        <div>
          <p className="font-medium text-genesis-dark">{formData.displayName || 'Seu Nome'}</p>
          <p className="text-sm text-genesis-muted">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-genesis-dark mb-1.5">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Dr. João Silva"
              className="w-full pl-10 pr-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder:text-genesis-subtle focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-genesis-dark mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-muted" />
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-10 pr-4 py-2.5 bg-genesis-soft border border-genesis-border rounded-xl text-genesis-muted cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-genesis-subtle mt-1">
            O email não pode ser alterado
          </p>
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm font-medium text-genesis-dark mb-1.5">
            Especialidade
          </label>
          <select
            value={formData.specialty}
            onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
            className="w-full px-4 py-2.5 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all appearance-none cursor-pointer"
          >
            {specialties.map(spec => (
              <option key={spec.value} value={spec.value}>
                {spec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-genesis-border">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-genesis-primary text-white font-medium rounded-xl hover:bg-genesis-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
