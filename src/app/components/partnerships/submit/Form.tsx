'use client';

import React, { useState } from 'react';
import { Database } from '@/types/database';
import { checkAndCreateOrganizer, submitFullPartnership } from '../../../partnerships/actions'; 
import { PackageCheck, Check } from 'lucide-react';

import Step1_OrganizerForm from './Step1_OrganizerForm';
import Step2_EventForm from './Step2_EventForm';
import Step3_Review from './Step3_Review';
import Step4_Success from './Step4_Success';
import ConfirmationModal from './ConfirmationModal';

const StepTracker = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Penyelenggara', 'Detail Event', 'Review', 'Selesai'];
  return (
    <div className="flex items-start w-full"> 
      {steps.map((title, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <React.Fragment key={title}>
            <div className="flex flex-col items-center text-center w-20">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 shrink-0 ${
                isActive ? 'bg-blue-600 border-blue-600 text-white' :
                isCompleted ? 'bg-green-500 border-green-500 text-white' :
                'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {isCompleted ? <Check size={24} /> : <span className="font-bold">{stepNumber}</span>}
              </div>
              <p className={`mt-2 text-xs font-semibold sm:text-sm transition-colors duration-300 ${
                isActive || isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}>{title}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-full flex-auto border-b-2 mt-5 transition-colors duration-300 ${
                isCompleted ? 'border-green-500' : 'border-slate-300 dark:border-slate-700'
              }`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

type Package = Database['public']['Tables']['packages']['Row'];
type Organizer = Database['public']['Tables']['organizers']['Row'];
type Level = Database['public']['Tables']['levels']['Row'];
type Field = Database['public']['Tables']['fields']['Row'];
type OrganizerData = Pick<Organizer, 'name' | 'instagram'>;
type EventData = Omit<Database['public']['Tables']['events']['Insert'], 'id' | 'organizer_id' | 'user_id' | 'status' | 'partnership_id'>;

interface PartnershipFormProps {
  selectedPackage: Package;
  allOrganizers: Pick<Organizer, 'id' | 'name'>[];
  allLevels: Level[];
  allFields: Field[];
}

type OrganizerCheckResult = {
  status: 'exact_match' | 'partial_match' | 'created' | 'error';
  data?: Organizer;
  message?: string;
};

export default function PartnershipMultiStepForm({ selectedPackage, allLevels, allFields }: PartnershipFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizerData, setOrganizerData] = useState<OrganizerData>({ name: '', instagram: '' });
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [validatedOrganizer, setValidatedOrganizer] = useState<Organizer | null>(null);
  const [organizerConfirmation, setOrganizerConfirmation] = useState<{ message: string; data: Organizer } | null>(null);

  const handleOrganizerSubmit = async (data: OrganizerData) => {
    setIsLoading(true);
    setOrganizerData(data);
    const result = await checkAndCreateOrganizer(data) as OrganizerCheckResult;
    setIsLoading(false);
    if (!result || result.status === 'error' || !result.data) {
      alert(result?.message || 'Terjadi kesalahan saat memeriksa penyelenggara.');
      return;
    }
    if (result.status === 'exact_match' || result.status === 'created') {
      setValidatedOrganizer(result.data);
      setStep(2);
    } else if (result.status === 'partial_match') {
      setOrganizerConfirmation({
        message: `Penyelenggara bernama "${result.data.name}" dengan Instagram "${result.data.instagram}" sudah terdaftar. Apakah ini penyelenggara yang sama?`,
        data: result.data,
      });
    }
  };
  const handleConfirmation = (useExisting: boolean) => {
    if (useExisting && organizerConfirmation) {
      setValidatedOrganizer(organizerConfirmation.data);
      setStep(2);
    }
    setOrganizerConfirmation(null);
  };
  const saveEventData = (data: EventData) => {
    setEventData(data);
    setStep(3);
  };
  const handleFinalSubmit = async () => {
    if (!validatedOrganizer || !eventData) {
      setError("Data tidak lengkap.");
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await submitFullPartnership({
      packageId: selectedPackage.id,
      organizerId: validatedOrganizer.id,
      eventData,
    });
    setIsLoading(false);
    if (result.success) {
      setStep(4);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {organizerConfirmation && (
        <ConfirmationModal
          message={organizerConfirmation.message}
          onConfirm={() => handleConfirmation(true)}
          onCancel={() => handleConfirmation(false)}
        />
      )}
      
      <div className="border rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 mb-8 border-slate-200 dark:border-slate-800">
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Paket yang Anda Pilih</p>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <PackageCheck size={20} />
              {selectedPackage.name}
            </p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {selectedPackage.price > 0 ? `Rp ${selectedPackage.price.toLocaleString('id-ID')}` : 'Gratis'}
            </p>
          </div>
        </div>
        <StepTracker currentStep={step} />
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm border-slate-200 dark:border-slate-800">
        <div className="p-6 sm:p-8">
          {step === 1 && (
            <Step1_OrganizerForm onSubmit={handleOrganizerSubmit} initialData={organizerData} isLoading={isLoading} />
          )}

          {step === 2 && validatedOrganizer && (
            <Step2_EventForm 
              onNext={saveEventData} 
              onBack={() => setStep(1)}
              selectedPackage={selectedPackage}
              initialData={eventData}
              organizers={[validatedOrganizer]}
              levels={allLevels}
              fields={allFields}
              preselectedOrganizerId={validatedOrganizer.id}
            />
          )}
          
          {step === 3 && validatedOrganizer && eventData && (
            <Step3_Review 
              organizer={validatedOrganizer}
              event={eventData}
              onBack={() => setStep(2)}
              onSubmit={handleFinalSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}

          {step === 4 && validatedOrganizer && eventData && (
            <Step4_Success
              selectedPackage={selectedPackage}
              organizer={validatedOrganizer}
              event={eventData}
            />
          )}
        </div>
      </div>
    </div>
  );
}