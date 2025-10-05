import React from 'react';
import { Plus, X } from 'lucide-react';
const Step2_ExperienceEducation = ({ profile, handleArrayItemChange, addArrayItem, removeArrayItem }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-3">Professional Experience</label>
        {profile.experiences.map((exp, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-sm font-semibold text-gray-700">Position {idx + 1}</span>
              {profile.experiences.length > 1 && (
                <button 
                  onClick={() => removeArrayItem('experiences', idx)} 
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <input 
              type="text" 
              value={exp.jobTitle} 
              onChange={(e) => handleArrayItemChange('experiences', idx, 'jobTitle', e.target.value)} 
              placeholder="Job Title" 
              className="form-input mb-3 bg-white" 
            />
            
            <input 
              type="text" 
              value={exp.company} 
              onChange={(e) => handleArrayItemChange('experiences', idx, 'company', e.target.value)} 
              placeholder="Company Name" 
              className="form-input mb-3 bg-white" 
            />
            
            {/* Date Range Section */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="font-body block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="month" 
                  value={exp.startDate || ''} 
                  onChange={(e) => handleArrayItemChange('experiences', idx, 'startDate', e.target.value)} 
                  className="form-input bg-white text-sm" 
                />
              </div>
              <div>
                <label className="font-body block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="month" 
                  value={exp.isCurrent ? '' : (exp.endDate || '')} 
                  onChange={(e) => handleArrayItemChange('experiences', idx, 'endDate', e.target.value)} 
                  disabled={exp.isCurrent}
                  className="form-input bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
            
            {/* Current Position Checkbox */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={exp.isCurrent || false} 
                onChange={(e) => {
                  handleArrayItemChange('experiences', idx, 'isCurrent', e.target.checked);
                  if (e.target.checked) {
                    handleArrayItemChange('experiences', idx, 'endDate', 'Present');
                  }
                }} 
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary rounded" 
              />
              <span className="font-body text-sm text-gray-700">I currently work here</span>
            </label>
            
            <textarea 
              value={exp.description} 
              onChange={(e) => handleArrayItemChange('experiences', idx, 'description', e.target.value)} 
              placeholder="Describe your key responsibilities and achievements..." 
              rows={4} 
              className="form-input bg-white" 
            />
          </div>
        ))}
        <button 
          onClick={() => addArrayItem('experiences', { 
            jobTitle: '', 
            company: '', 
            description: '', 
            startDate: '', 
            endDate: '', 
            isCurrent: false 
          })} 
          className="btn-add"
        >
          <Plus size={18} /> Add Experience
        </button>
      </div>
      
      {/* Education section */}
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-3">Education</label>
        {profile.education.map((edu, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-sm font-semibold text-gray-700">Education {idx + 1}</span>
              {profile.education.length > 1 && (
                <button 
                  onClick={() => removeArrayItem('education', idx)} 
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
      
            <input 
            type="text" 
            value={edu.degree} 
            onChange={(e) => handleArrayItemChange('education', idx, 'degree', e.target.value)} 
            placeholder="Degree (e.g., Bachelor of Science in Computer Science)" 
            className="form-input mb-3 bg-white" 
          />
      
          <input 
        type="text" 
        value={edu.institution} 
        onChange={(e) => handleArrayItemChange('education', idx, 'institution', e.target.value)} 
        placeholder="Institution" 
        className="form-input mb-3 bg-white" 
          />
      
          {/* Date Range Section */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-body block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="month" 
                value={edu.startDate || ''} 
                onChange={(e) => handleArrayItemChange('education', idx, 'startDate', e.target.value)} 
                className="form-input bg-white text-sm" 
              />
            </div>
            <div>
              <label className="font-body block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="month" 
                value={edu.isCurrent ? '' : (edu.endDate || '')} 
                onChange={(e) => handleArrayItemChange('education', idx, 'endDate', e.target.value)} 
                disabled={edu.isCurrent}
                className="form-input bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
              />
          </div>
      </div>
      
      {/* Currently Studying Checkbox */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input 
          type="checkbox" 
          checked={edu.isCurrent || false} 
          onChange={(e) => {
            handleArrayItemChange('education', idx, 'isCurrent', e.target.checked);
            if (e.target.checked) {
              handleArrayItemChange('education', idx, 'endDate', 'Present');
            }
          }} 
          className="h-4 w-4 text-brand-primary focus:ring-brand-primary rounded" 
        />
        <span className="font-body text-sm text-gray-700">Currently studying here</span>
      </label>
      
      <textarea 
        value={edu.description} 
        onChange={(e) => handleArrayItemChange('education', idx, 'description', e.target.value)} 
        placeholder="Relevant coursework, honors, or achievements (optional)" 
        rows={2} 
        className="form-input bg-white" 
      />
    </div>
  ))}
  <button 
    onClick={() => addArrayItem('education', { 
      degree: '', 
      institution: '', 
      description: '', 
      startDate: '', 
      endDate: '', 
      isCurrent: false 
    })} 
    className="btn-add"
  >
    <Plus size={18} /> Add Education
  </button>
</div>
</div>
  );
};

export default Step2_ExperienceEducation;