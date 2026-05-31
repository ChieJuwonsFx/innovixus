import { PostTemplate } from '@/types/event';

interface TemplateSelectorProps {
  selectedTemplate: PostTemplate;
  onTemplateChange: (template: PostTemplate) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onTemplateChange
}: TemplateSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Template
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onTemplateChange('blue')}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            selectedTemplate === 'blue'
              ? 'border-[#003366] bg-slate-50 shadow-sm dark:bg-slate-950'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Blue Theme</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">White badge, blue canvas</div>
            </div>
            <div className="h-3 w-3 rounded-full bg-[#003366]"></div>
          </div>
          <div className="h-10 rounded-2xl bg-[#003366] p-3">
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onTemplateChange('white')}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            selectedTemplate === 'white'
              ? 'border-[#003366] bg-slate-50 shadow-sm dark:bg-slate-950'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">White Theme</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Blue badge, white canvas</div>
            </div>
            <div className="h-3 w-3 rounded-full border border-[#003366] bg-white"></div>
          </div>
          <div className="h-10 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          </div>
        </button>
      </div>
    </div>
  );
}