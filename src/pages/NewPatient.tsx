import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Phone, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { AvatarUpload } from '../components/ui/AvatarUpload';

const InputGroup = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-semibold text-genesis-medium uppercase tracking-wider ml-1 flex items-center gap-1.5 group-focus-within:text-genesis-blue transition-colors">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {children}
  </div>
);

const StyledInput = (props: any) => (
  <input 
    {...props}
    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-genesis-dark placeholder-gray-400 focus:ring-2 focus:ring-genesis-blue/20 focus:bg-white transition-all duration-300 outline-none shadow-sm hover:bg-gray-100"
  />
);

const StyledSelect = (props: any) => (
  <div className="relative">
     <select 
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium text-genesis-dark focus:ring-2 focus:ring-genesis-blue/20 focus:bg-white transition-all duration-300 outline-none shadow-sm appearance-none hover:bg-gray-100 cursor-pointer"
     />
     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
       <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
     </div>
  </div>
);

export const NewPatient: React.FC = () => {
  const navigate = useNavigate();
  const { addPatient } = usePatients();
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    gender: 'Selecione...',
    insurance: 'Particular',
    avatar: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.phone) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    setSaving(true);

    try {
      // For new patients, use generated avatar if no valid URL uploaded
      // Blob URLs (from preview) won't persist, so use fallback
      const avatarUrl = formData.avatar && !formData.avatar.startsWith('blob:')
        ? formData.avatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;

      await addPatient({
        name: formData.name,
        birthDate: formData.birthDate || '2000-01-01',
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        insurance: formData.insurance,
        tags: ['Novo'],
        avatar: avatarUrl,
      });

      navigate('/patients');
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Erro ao cadastrar paciente. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-enter pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">Novo Paciente</h1>
          <p className="text-genesis-medium text-sm">Preencha os dados para iniciar o prontuário.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/patients')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-genesis-medium hover:bg-gray-100 hover:text-genesis-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-genesis-blue text-white rounded-xl text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Salvar Cadastro
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photo */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-white shadow-soft flex flex-col items-center text-center">
            <AvatarUpload
              currentAvatar={formData.avatar}
              patientName={formData.name}
              onAvatarChange={(url) => setFormData({ ...formData, avatar: url })}
              disabled={saving}
            />
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="lg:col-span-2 space-y-8">
           {/* Section 1: Personal */}
           <div className="bg-white p-8 rounded-3xl border border-white shadow-soft">
              <h3 className="text-lg font-bold text-genesis-dark mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg"><User className="w-4 h-4 text-genesis-blue" /></div>
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                   <InputGroup label="Nome Completo">
                     <StyledInput name="name" placeholder="Ex: Maria Silva Oliveira" value={formData.name} onChange={handleChange} autoFocus />
                   </InputGroup>
                 </div>
                 
                 <InputGroup label="Data de Nascimento">
                    <StyledInput name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                 </InputGroup>

                 <InputGroup label="Gênero">
                    <StyledSelect name="gender" value={formData.gender} onChange={handleChange}>
                       <option>Selecione...</option>
                       <option>Feminino</option>
                       <option>Masculino</option>
                       <option>Outro</option>
                    </StyledSelect>
                 </InputGroup>
              </div>
           </div>

           {/* Section 2: Contact */}
           <div className="bg-white p-8 rounded-3xl border border-white shadow-soft">
              <h3 className="text-lg font-bold text-genesis-dark mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg"><Phone className="w-4 h-4 text-green-600" /></div>
                Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputGroup label="Celular (WhatsApp)">
                    <StyledInput name="phone" placeholder="(11) 99999-9999" value={formData.phone} onChange={handleChange} />
                 </InputGroup>
                 
                 <InputGroup label="Email">
                    <StyledInput name="email" type="email" placeholder="paciente@email.com" value={formData.email} onChange={handleChange} />
                 </InputGroup>
              </div>
           </div>

           {/* Section 3: Extra */}
           <div className="bg-white p-8 rounded-3xl border border-white shadow-soft">
              <h3 className="text-lg font-bold text-genesis-dark mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 rounded-lg"><ShieldCheck className="w-4 h-4 text-purple-600" /></div>
                Convênio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <InputGroup label="Convênio">
                    <StyledSelect name="insurance" value={formData.insurance} onChange={handleChange}>
                       <option>Particular</option>
                       <option>Unimed</option>
                       <option>Bradesco Saúde</option>
                       <option>SulAmérica</option>
                    </StyledSelect>
                 </InputGroup>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
