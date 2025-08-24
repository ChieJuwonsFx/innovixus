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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Template
      </label>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onTemplateChange('blue')}
          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
            selectedTemplate === 'blue'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
        >
          <div className="h-8 rounded bg-[#100C56] mb-2"></div>
          <div className="text-sm text-center text-gray-600 dark:text-white font-medium">Blue Theme</div>
        </button>
        
        <button
          type="button"
          onClick={() => onTemplateChange('white')}
          className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
            selectedTemplate === 'white'
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
        >
          <div className="h-8 rounded bg-white border border-gray-300 mb-2"></div>
          <div className="text-sm text-center text-gray-600 dark:text-white font-medium">White Theme</div>
        </button>
      </div>
    </div>
  );
}