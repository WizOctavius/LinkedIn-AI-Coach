import React from 'react';

const Step1_HeadlineSummary = ({ profile, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-2">Professional Headline</label>
        <input
          type="text"
          value={profile.headline}
          onChange={(e) => handleInputChange('headline', e.target.value)}
          placeholder="e.g., Full Stack Developer | React & Node.js Expert"
          className="form-input"
          maxLength={220}
        />
        <div className="font-body text-xs text-gray-500 mt-1 flex justify-between">
          <span>Maximum 220 characters</span>
          <span className={profile.headline.length > 200 ? 'text-amber-600 font-medium' : ''}>
            {profile.headline.length}/220
          </span>
        </div>
      </div>
      <div>
        <label className="font-body block text-base font-semibold text-gray-900 mb-2">About Section</label>
        <textarea
          value={profile.about}
          onChange={(e) => handleInputChange('about', e.target.value)}
          placeholder="Share your professional story..."
          rows={8}
          className="form-input"
        />
      </div>
    </div>
  );
};

export default Step1_HeadlineSummary;