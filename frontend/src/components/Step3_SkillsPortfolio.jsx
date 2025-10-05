import React from 'react';
import { Plus, X } from 'lucide-react';

const Step3_SkillsPortfolio = ({
  profile,
  skillInput,
  setSkillInput,
  addSkill,
  removeSkill,
  handleArrayItemChange,
  addArrayItem,
  removeArrayItem
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-3">Skills & Expertise</label>
        <div className="flex gap-2 mb-3">
          <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter" className="form-input flex-1" />
          <button onClick={addSkill} className="px-5 py-2 bg-brand-primary text-black rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-2 font-medium"><Plus size={20} /> Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, idx) => (
            <span key={idx} className="skill-tag">{skill}<button onClick={() => removeSkill(skill)} className="ml-2 text-brand-secondary hover:text-black hover:bg-white/50 rounded-full p-0.5"><X size={14} /></button></span>
          ))}
        </div>
      </div>
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-3">Projects</label>
        {profile.projects.map((proj, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-sm font-semibold text-gray-700">Project {idx + 1}</span>
              {profile.projects.length > 1 && <button onClick={() => removeArrayItem('projects', idx)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"><X size={18} /></button>}
            </div>
            <input type="text" value={proj.name} onChange={(e) => handleArrayItemChange('projects', idx, 'name', e.target.value)} placeholder="Project Name" className="form-input mb-3 bg-white" />
            <textarea value={proj.description} onChange={(e) => handleArrayItemChange('projects', idx, 'description', e.target.value)} placeholder="Project description..." rows={3} className="form-input bg-white" />
          </div>
        ))}
        <button onClick={() => addArrayItem('projects', { name: '', description: '' })} className="btn-add"><Plus size={18} /> Add Project</button>
      </div>
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-3">Certifications</label>
        {profile.certifications.map((cert, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="font-body text-sm font-semibold text-gray-700">Certification {idx + 1}</span>
              {profile.certifications.length > 1 && <button onClick={() => removeArrayItem('certifications', idx)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"><X size={18} /></button>}
            </div>
            <input type="text" value={cert.name} onChange={(e) => handleArrayItemChange('certifications', idx, 'name', e.target.value)} placeholder="Certification Name" className="form-input mb-3 bg-white" />
            <input type="text" value={cert.organization} onChange={(e) => handleArrayItemChange('certifications', idx, 'organization', e.target.value)} placeholder="Issuing Organization" className="form-input bg-white" />
          </div>
        ))}
        <button onClick={() => addArrayItem('certifications', { name: '', organization: '' })} className="btn-add"><Plus size={18} /> Add Certification</button>
      </div>
    </div>
  );
};

export default Step3_SkillsPortfolio;