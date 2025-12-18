/**
 * Medicine Editor - Container de Especialidade Médica
 * ====================================================
 *
 * Orquestra os sub-editores da especialidade Medicina:
 * - SOAP (Evolução clínica)
 * - Prescrição (Receituário)
 * - Exames (Solicitações laboratoriais)
 *
 * @module plugins/medicina/MedicineEditor
 */

import React, { useState } from 'react';
import { FileText, Pill, FlaskConical, LucideIcon } from 'lucide-react';
import { SoapEditor } from './SoapEditor';
import { PrescriptionEditor } from './PrescriptionEditor';
import { ExamRequestEditor } from './ExamRequestEditor';
import type { EditorRecordData } from '../../types';

type TabId = 'soap' | 'prescription' | 'exams';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: 'soap', label: 'Evolução (SOAP)', icon: FileText },
  { id: 'prescription', label: 'Prescrição', icon: Pill },
  { id: 'exams', label: 'Exames', icon: FlaskConical },
];

interface MedicineEditorProps {
  onSave: (data: EditorRecordData) => void;
}

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab.label}
    </button>
  );
}

export function MedicineEditor({ onSave }: MedicineEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('soap');

  return (
    <div className="space-y-6">
      {/* Navegação de tabs */}
      <div className="flex gap-2 pb-4 border-b border-gray-100">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Conteúdo da tab ativa */}
      {activeTab === 'soap' && <SoapEditor onSave={onSave} />}
      {activeTab === 'prescription' && <PrescriptionEditor onSave={onSave} />}
      {activeTab === 'exams' && <ExamRequestEditor onSave={onSave} />}
    </div>
  );
}
