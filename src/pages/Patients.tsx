/**
 * Patients Page
 *
 * Displays list of all patients in the clinic.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';

export function Patients() {
  const navigate = useNavigate();
  const { patients, loading } = usePatients();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-genesis-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-enter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-genesis-dark tracking-tight">Pacientes</h1>
          <p className="text-genesis-medium text-sm font-medium">
            Gerencie seus cadastros e histórico clínico.
          </p>
        </div>
        <button
          onClick={() => navigate('/patients/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-genesis-dark text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-white shadow-soft overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-50 flex gap-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-genesis-medium group-focus-within:text-genesis-blue transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou telefone..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium text-genesis-dark focus:ring-2 focus:ring-genesis-blue/20 focus:bg-white transition-all placeholder-gray-400 shadow-inner"
            />
          </div>
        </div>

        {/* Table */}
        {patients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-genesis-medium text-sm mb-4">
              Nenhum paciente cadastrado ainda.
            </p>
            <button
              onClick={() => navigate('/patients/new')}
              className="text-genesis-blue font-semibold text-sm hover:underline"
            >
              Cadastrar primeiro paciente
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-genesis-medium uppercase tracking-wider text-[10px]">
                  Nome
                </th>
                <th className="px-6 py-4 font-bold text-genesis-medium uppercase tracking-wider text-[10px]">
                  Contato
                </th>
                <th className="px-6 py-4 font-bold text-genesis-medium uppercase tracking-wider text-[10px]">
                  Convênio
                </th>
                <th className="px-6 py-4 font-bold text-genesis-medium uppercase tracking-wider text-[10px]">
                  Tags
                </th>
                <th className="px-6 py-4 font-bold text-genesis-medium uppercase tracking-wider text-[10px] text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50/80 transition-all cursor-pointer group"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={
                            patient.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}`
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="font-bold text-genesis-dark text-sm group-hover:text-genesis-blue transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-[11px] font-medium text-genesis-medium">
                          {patient.age} anos
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-genesis-dark text-xs">{patient.phone}</p>
                    <p className="text-[11px] text-genesis-medium">{patient.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
                      {patient.insurance || 'Particular'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {patient.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-white border border-gray-100 text-genesis-medium text-[10px] font-bold rounded-md uppercase tracking-wide shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-genesis-dark hover:bg-white rounded-full transition-all shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
