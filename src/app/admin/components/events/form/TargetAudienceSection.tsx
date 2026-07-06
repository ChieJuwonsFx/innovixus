'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/types/database';
import { createField } from '@/app/admin/fields/actions';
import { createLevel } from '@/app/admin/levels/actions';
import MultiSelectWithCreate from '../../MultiSelectWithCreate';

type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];

interface TargetAudienceSectionProps {
  event?: {
    event_levels?: { level_id: string }[];
    event_fields?: { field_id: string }[];
  };
  initialLevels: Level[];
  initialFields: Field[];
  selectedKategori: string;
}

export default function TargetAudienceSection({ event, initialLevels, initialFields, selectedKategori }: TargetAudienceSectionProps) {
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [filteredFields, setFilteredFields] = useState<Field[]>(initialFields);

  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(() => new Set(event?.event_levels?.map(l => l.level_id) || []));
  const [selectedFields, setSelectedFields] = useState<Set<string>>(() => new Set(event?.event_fields?.map(f => f.field_id) || []));

  useEffect(() => {
    const sortedFields = [...fields].sort((a, b) => a.name.localeCompare(b.name));
    if (selectedKategori === 'Info Lomba') {
      setFilteredFields(sortedFields);
    } else {
      setFilteredFields(sortedFields.filter(field => !field.only_lomba));
    }
  }, [selectedKategori, fields]);

  const handleLevelSelectionChange = (levelId: string) => {
    setSelectedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const handleFieldSelectionChange = (fieldId: string) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };
  
  const handleFieldAdded = (newField: Field) => {
    setFields(current => [...current, newField]);
  };

  const handleLevelAdded = (newLevel: Level) => {
    setLevels(current => [...current, newLevel].sort((a, b) => a.name.localeCompare(b.name)));
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-brand">
        Target Peserta
      </h2>
      
      {Array.from(selectedFields).map(id => <input key={`field-hidden-${id}`} type="hidden" name="field_ids" value={id} />)}
      {Array.from(selectedLevels).map(id => <input key={`level-hidden-${id}`} type="hidden" name="level_ids" value={id} />)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Bidang</label>
          <MultiSelectWithCreate
            items={filteredFields}
            selectedItems={selectedFields}
            onSelectionChange={handleFieldSelectionChange}
            createAction={createField}
            onItemAdded={handleFieldAdded}
            placeholder="Pilih satu atau lebih bidang"
            itemName="bidang"
            additionalFormData={{ only_lomba: (selectedKategori === 'Info Lomba').toString() }}
          />
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Level</label>
          <MultiSelectWithCreate
            items={levels}
            selectedItems={selectedLevels}
            onSelectionChange={handleLevelSelectionChange}
            createAction={createLevel}
            onItemAdded={handleLevelAdded}
            placeholder="Pilih satu atau lebih level"
            itemName="level"
          />
        </div>
      </div>
    </div>
  );
}

