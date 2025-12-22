/**
 * Edit Patient Page
 *
 * Form for editing existing patient data.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, User, Phone, ShieldCheck, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { usePatient } from '../hooks/usePatient';
import { AvatarUpload } from '../components/ui/AvatarUpload';

interface InputGroupProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-semibold text-genesis-medium uppercase tracking-wider ml-1 flex items-center gap-1.5 group-focus-within:text-genesis-primary transition-colors">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {children}
  </div>
);

const StyledInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full px-4 py-3 bg-genesis-soft border-none rounded-xl text-sm font-medium text-genesis-dark placeholder-gray-400 focus:ring-2 focus:ring-genesis-primary/20 focus:bg-genesis-surface transition-all duration-300 outline-none shadow-sm hover:bg-genesis-hover"
  />
);

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      {...props}
      className="w-full px-4 py-3 bg-genesis-soft border-none rounded-xl text-sm font-medium text-genesis-dark focus:ring-2 focus:ring-genesis-primary/20 focus:bg-genesis-surface transition-all duration-300 outline-none shadow-sm appearance-none hover:bg-genesis-hover cursor-pointer"
    />
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronRight className="w-4 h-4 text-genesis-subtle rotate-90" />
    </div>
  </div>
);

interface FormData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  gender: string;
  insurance: string;
  avatar: string;
}

export function EditPatient() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { patient, loading: loadingPatient } = usePatient(id || '');
  const { updatePatient } = usePatients();
  const [saving, setSaving] = useState(false);
  const initializedRef = useRef(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    gender: '',
    insurance: '',
    avatar: '',
  });

  // Load patient data into form when patient loads (only once)
  useEffect(() => {
    if (patient && !initializedRef.current) {
      initializedRef.current = true;
      setFormData({
        name: patient.name || '',
        birthDate: patient.birthDate || '',
        phone: patient.phone || '',
        email: patient.email || '',
        gender: patient.gender || '',
        insurance: patient.insurance || 'Particular',
        avatar: patient.avatar || '',
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id) return;

    if (!formData.name || !formData.phone) {
      toast.warning('Preencha os campos obrigatórios.');
      return;
    }

    setSaving(true);

    try {
      await updatePatient(id, {
        name: formData.name,
        birthDate: formData.birthDate,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        insurance: formData.insurance,
        avatar: formData.avatar,
      });

      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar paciente. Tente novamente.');
      setSaving(false);
    }
  };

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-primary animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-genesis-medium">Paciente não encontrado.</p>
        <button
          onClick={() => navigate('/patients')}
          className="text-genesis-primary font-semibold mt-4 hover:underline"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-enter pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate(`/patients/${id}`)}
            className="flex items-center gap-1 text-sm text-genesis-medium hover:text-genesis-dark mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">Editar Paciente</h1>
          <p className="text-genesis-medium text-sm">Atualize os dados de {patient.name}.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/patients/${id}`)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-genesis-medium hover:bg-genesis-hover hover:text-genesis-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-genesis-primary text-white rounded-xl text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo */}
        <div className="space-y-6">
          <div className="bg-genesis-surface p-8 rounded-3xl border border-white shadow-soft flex flex-col items-center text-center">
            <AvatarUpload
              currentAvatar={formData.avatar}
              patientId={id}
              patientName={patient.name}
              onAvatarChange={(url) => setFormData({ ...formData, avatar: url })}
              disabled={saving}
            />
            <p className="text-sm font-bold text-genesis-dark mt-4">{patient.name}</p>
            <p className="text-xs text-genesis-medium">{patient.age} anos</p>
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Personal */}
          <div className="bg-genesis-surface p-8 rounded-3xl border border-white shadow-soft">
            <h3 className="text-lg font-bold text-genesis-dark mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-genesis-primary" />
              </div>
              Dados Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputGroup label="Nome Completo">
                  <StyledInput
                    name="name"
                    placeholder="Ex: Maria Silva Oliveira"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>

              <InputGroup label="Data de Nascimento">
                <StyledInput
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup label="Gênero">
                <StyledSelect name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </StyledSelect>
              </InputGroup>
            </div>
          </div>

          {/* Section 2: Contact */}
          <div className="bg-genesis-surface p-8 rounded-3xl border border-white shadow-soft">
            <h3 className="text-lg font-bold text-genesis-dark mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Celular (WhatsApp)">
                <StyledInput
                  name="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </InputGroup>

              <InputGroup label="Email">
                <StyledInput
                  name="email"
                  type="email"
                  placeholder="paciente@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </InputGroup>
            </div>
          </div>

          {/* Section 3: Insurance */}
          <div className="bg-genesis-surface p-8 rounded-3xl border border-white shadow-soft">
            <h3 className="text-lg font-bold text-genesis-dark mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              Convênio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Convênio">
                <StyledSelect name="insurance" value={formData.insurance} onChange={handleChange}>
                  <option value="Particular">Particular</option>
                  <option value="Unimed">Unimed</option>
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="SulAmérica">SulAmérica</option>
                </StyledSelect>
              </InputGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
