import React from 'react';
import { Building2, Phone, MapPin } from 'lucide-react';

interface StepClinicInfoProps {
  clinicName: string;
  setClinicName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
}

export function StepClinicInfo({
  clinicName,
  setClinicName,
  phone,
  setPhone,
  address,
  setAddress,
}: StepClinicInfoProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-genesis-dark">
          Vamos configurar sua clínica
        </h2>
        <p className="text-genesis-medium mt-2">
          Preencha os dados básicos para começar
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="clinicName" className="block text-sm font-semibold text-genesis-dark mb-2">
            Nome da Clínica *
          </label>
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium group-focus-within:text-genesis-primary transition-colors" />
            <input
              id="clinicName"
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Ex: Clínica São Paulo"
              className="w-full pl-12 pr-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-genesis-dark mb-2">
            Telefone
          </label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium group-focus-within:text-genesis-primary transition-colors" />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full pl-12 pr-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-genesis-dark mb-2">
            Endereço
          </label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-genesis-medium group-focus-within:text-genesis-primary transition-colors" />
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número - Cidade, Estado"
              className="w-full pl-12 pr-4 py-3 bg-genesis-surface border border-genesis-border rounded-xl text-genesis-dark placeholder-genesis-medium/50 focus:outline-none focus:ring-2 focus:ring-genesis-primary/20 focus:border-genesis-primary transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
