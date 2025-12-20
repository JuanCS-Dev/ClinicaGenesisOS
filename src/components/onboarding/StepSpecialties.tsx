import React from 'react';
import { Check, Stethoscope, Apple, Brain } from 'lucide-react';
import type { SpecialtyType } from '@/types';

interface StepSpecialtiesProps {
  selectedSpecialties: SpecialtyType[];
  toggleSpecialty: (specialty: SpecialtyType) => void;
}

const SPECIALTIES: Array<{
  id: SpecialtyType;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = [
  { id: 'medicina', name: 'Medicina', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 'nutricao', name: 'Nutrição', icon: Apple, color: 'text-green-500', bg: 'bg-green-500' },
  { id: 'psicologia', name: 'Psicologia', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500' },
];

export function StepSpecialties({ selectedSpecialties, toggleSpecialty }: StepSpecialtiesProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-genesis-dark">
          Quais especialidades você oferece?
        </h2>
        <p className="text-genesis-medium mt-2">
          Selecione uma ou mais especialidades para ativar os módulos corretos
        </p>
      </div>

      <div className="grid gap-4">
        {SPECIALTIES.map(({ id, name, icon: Icon, bg }) => {
          const isSelected = selectedSpecialties.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleSpecialty(id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 group ${
                isSelected
                  ? 'border-genesis-blue bg-genesis-blue/5 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? bg : 'bg-gray-100'}`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
              </div>
              
              <span className={`font-semibold flex-1 text-left text-lg ${isSelected ? 'text-genesis-dark' : 'text-gray-500'}`}>
                {name}
              </span>
              
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-genesis-blue bg-genesis-blue scale-110'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
