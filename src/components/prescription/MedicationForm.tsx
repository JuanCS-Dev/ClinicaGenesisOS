/**
 * MedicationForm Component
 *
 * Form for adding and editing a single medication in a prescription.
 * Includes medication search, dosage, frequency, and instructions.
 */

import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { MedicationSearch } from './MedicationSearch';
import type {
  PrescriptionMedication,
  MemedMedication,
  MedicationUnit,
  AdministrationRoute,
} from '@/types';
import { ADMINISTRATION_ROUTE_LABELS } from '@/types';

const UNITS: MedicationUnit[] = [
  'comprimido',
  'cápsula',
  'ml',
  'mg',
  'gota',
  'ampola',
  'sachê',
  'envelope',
  'adesivo',
  'aplicação',
  'unidade',
];

const ROUTES: AdministrationRoute[] = [
  'oral',
  'sublingual',
  'topical',
  'intravenous',
  'intramuscular',
  'subcutaneous',
  'inhalation',
  'rectal',
  'vaginal',
  'ophthalmic',
  'nasal',
  'auricular',
  'transdermal',
];

export interface MedicationFormProps {
  /** The medication data */
  medication: PrescriptionMedication;
  /** Index in the medications array */
  index: number;
  /** Callback when medication is selected from search */
  onMedicationSelect: (index: number, medication: MemedMedication) => void;
  /** Callback to update a field */
  onUpdate: (index: number, field: keyof PrescriptionMedication, value: unknown) => void;
  /** Callback to remove this medication */
  onRemove: (index: number) => void;
}

/**
 * Form for a single medication entry.
 */
export const MedicationForm: FC<MedicationFormProps> = ({
  medication,
  index,
  onMedicationSelect,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="p-4 border border-genesis-border rounded-xl space-y-4">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-genesis-muted">
          Medicamento {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="p-1 hover:bg-red-50 rounded text-red-500"
          title="Remover medicamento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Medication search */}
      <MedicationSearch
        onSelect={(med) => onMedicationSelect(index, med)}
        placeholder="Buscar medicamento..."
      />

      {medication.name && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <span className="font-medium text-blue-900">{medication.name}</span>
          {medication.isControlled && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 text-amber-800 rounded">
              {medication.controlType}
            </span>
          )}
        </div>
      )}

      {/* Dosage & Frequency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Posologia
          </label>
          <input
            type="text"
            value={medication.dosage}
            onChange={(e) => onUpdate(index, 'dosage', e.target.value)}
            placeholder="Ex: 1 comprimido"
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Frequência
          </label>
          <input
            type="text"
            value={medication.frequency}
            onChange={(e) => onUpdate(index, 'frequency', e.target.value)}
            placeholder="Ex: 8 em 8 horas"
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
          />
        </div>
      </div>

      {/* Duration & Quantity */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Duração
          </label>
          <input
            type="text"
            value={medication.duration}
            onChange={(e) => onUpdate(index, 'duration', e.target.value)}
            placeholder="Ex: 7 dias"
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Quantidade
          </label>
          <input
            type="number"
            min="1"
            value={medication.quantity}
            onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Unidade
          </label>
          <select
            value={medication.unit}
            onChange={(e) => onUpdate(index, 'unit', e.target.value)}
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Route & Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-genesis-text mb-1">
            Via de Administração
          </label>
          <select
            value={medication.route}
            onChange={(e) => onUpdate(index, 'route', e.target.value)}
            className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
          >
            {ROUTES.map((route) => (
              <option key={route} value={route}>
                {ADMINISTRATION_ROUTE_LABELS[route]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={medication.continuousUse}
              onChange={(e) => onUpdate(index, 'continuousUse', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-genesis-border focus:ring-genesis-primary"
            />
            <span className="text-sm text-genesis-text">Uso contínuo</span>
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-genesis-text mb-1">
          Instruções adicionais (opcional)
        </label>
        <input
          type="text"
          value={medication.instructions || ''}
          onChange={(e) => onUpdate(index, 'instructions', e.target.value)}
          placeholder="Ex: Tomar com água, após as refeições"
          className="w-full px-3 py-2 border border-genesis-border rounded-lg focus:outline-none focus:ring-2 focus:ring-genesis-primary"
        />
      </div>
    </div>
  );
};
