import React from 'react';
import { Users, Briefcase, Plus, X } from 'lucide-react';

const Step4_TargetAudience = ({ profile, availablePersonas, togglePersona, handleInputChange, addJobDescription, removeJobDescription, handleJobDescriptionChange }) => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl border border-brand-primary">
        <div className="flex items-center gap-2 mb-3">
          <Users className="text-brand-secondary" size={24} />
          <h2 className="font-heading font-bold text-lg text-black">Target Audience</h2>
        </div>
        <p className="font-body text-sm text-black mb-5">Select who you want to optimize your profile for. Receive tailored feedback for each audience.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availablePersonas.map(persona => {
            const Icon = persona.icon;
            return (
              <label key={persona.id} className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${profile.target_personas.includes(persona.id) ? 'border-brand-primary bg-white shadow-md' : 'border-gray-200 hover:border-brand-primary bg-white hover:shadow-sm'}`}>
                <input type="checkbox" checked={profile.target_personas.includes(persona.id)} onChange={() => togglePersona(persona.id)} className="mt-1 mr-3 h-4 w-4 text-brand-primary focus:ring-brand-primary rounded" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><Icon size={16} className="text-brand-secondary" /><div className="font-body font-semibold text-gray-900 text-base">{persona.label}</div></div>
                  <div className="font-body text-xs text-gray-600">{persona.description}</div>
                </div>
              </label>
            );
          })}
        </div>
        <div className="mt-4 px-3 py-2 bg-white rounded-lg border border-brand-primary">
          <span className="font-body text-sm font-medium text-brand-secondary">{profile.target_personas.length} audience{profile.target_personas.length !== 1 ? 's' : ''} selected</span>
        </div>
      </div>

      {/* Job Switch Section */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="text-blue-600" size={24} />
          <h2 className="font-heading font-bold text-lg text-gray-900">Job Seeking Mode (Optional)</h2>
        </div>
        
        <label className="flex items-start p-4 rounded-xl border-2 border-blue-300 bg-white cursor-pointer transition-all hover:shadow-md mb-4">
          <input 
            type="checkbox" 
            checked={profile.is_job_seeking} 
            onChange={(e) => handleInputChange('is_job_seeking', e.target.checked)} 
            className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
          />
          <div className="flex-1">
            <div className="font-body font-semibold text-gray-900 text-base mb-1">I'm actively looking for a job switch</div>
            <div className="font-body text-sm text-gray-600">Enable this to receive job-specific optimization and matching analysis</div>
          </div>
        </label>

        {profile.is_job_seeking && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
              <p className="font-body text-sm text-amber-800 font-medium">
                <strong>Tip:</strong> Paste job descriptions you're interested in. Our AI will analyze how well your profile matches and suggest improvements.
              </p>
            </div>

            <label className="font-body block text-base font-semibold text-gray-900 mb-2">
              Target Job Descriptions
              <span className="text-sm font-normal text-gray-600 ml-2">(Add at least one)</span>
            </label>

            {profile.target_job_descriptions.map((desc, idx) => (
              <div key={idx} className="border-2 border-blue-200 rounded-lg p-5 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-body text-sm font-semibold text-gray-700">Job Description {idx + 1}</span>
                  {profile.target_job_descriptions.length > 1 && (
                    <button 
                      onClick={() => removeJobDescription(idx)} 
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => handleJobDescriptionChange(idx, e.target.value)}
                  placeholder="Paste the complete job description here (responsibilities, requirements, qualifications, etc.)"
                  rows={8}
                  className="form-input bg-white"
                />
                <div className="font-body text-xs text-gray-500 mt-2">
                  {desc.length} characters
                </div>
              </div>
            ))}

            <button 
              onClick={addJobDescription} 
              className="btn-add w-full justify-center py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            >
              <Plus size={18} /> Add Another Job Description
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4_TargetAudience;