import React, { useState } from 'react';
import { Users, Briefcase, Target, TrendingUp, Award, BookOpen, ChevronDown, ChevronUp, Copy, CheckCircle2, Search, BarChart3, AlertCircle, Sparkles } from 'lucide-react';

// Simple Progress Bar Component
const ProgressBar = ({ label, score, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  };
  
  const getColor = () => {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.blue;
    if (score >= 40) return colors.amber;
    return colors.red;
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-body text-sm font-medium text-gray-700">{label}</span>
        <span className="font-body text-sm font-bold text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// Extract match score from job match feedback
const extractMatchScore = (feedback) => {
  if (!feedback) return null;
  const match = feedback.match(/match\s+score[:\s]+(\d+)/i);
  return match ? parseInt(match[1]) : null;
};

// Calculate section completeness scores
const calculateSectionScore = (feedback) => {
  if (!feedback || feedback.length < 50) return 30;
  
  const hasOptions = feedback.toLowerCase().includes('option');
  const hasRecommendations = feedback.toLowerCase().includes('recommend') || feedback.toLowerCase().includes('suggest');
  const hasMetrics = /\d+%|\d+\/\d+/.test(feedback);
  const hasActionItems = feedback.toLowerCase().includes('action') || feedback.toLowerCase().includes('add') || feedback.toLowerCase().includes('improve');
  
  let score = 50;
  if (hasOptions) score += 10;
  if (hasRecommendations) score += 15;
  if (hasMetrics) score += 10;
  if (hasActionItems) score += 15;
  
  return Math.min(score, 95);
};

// Executive Summary Card
const ExecutiveSummary = ({ results, profile }) => {
  const headlineScore = calculateSectionScore(results.headline_feedback);
  const aboutScore = calculateSectionScore(results.about_feedback);
  const experienceScore = calculateSectionScore(results.experience_feedback);
  const skillsScore = calculateSectionScore(results.skills_feedback);
  
  const overallScore = Math.round((headlineScore + aboutScore + experienceScore + skillsScore) / 4);
  
  const getScoreStatus = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 40) return { text: 'Needs Work', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: 'Critical', color: 'text-red-600', bg: 'bg-red-50' };
  };
  
  const status = getScoreStatus(overallScore);
  
  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-600" size={24} />
        <h3 className="font-heading font-bold text-xl text-gray-900">Executive Summary</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-5xl font-bold text-gray-900">{overallScore}</div>
              <div>
                <div className="font-body text-sm text-gray-600">Overall Score</div>
                <div className={`font-body text-sm font-semibold ${status.color}`}>{status.text}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <ProgressBar label="Headline" score={headlineScore} />
            <ProgressBar label="About Section" score={aboutScore} />
            <ProgressBar label="Experience" score={experienceScore} />
            <ProgressBar label="Skills" score={skillsScore} />
          </div>
        </div>
        
        <div className={`p-4 ${status.bg} rounded-lg border border-purple-200`}>
          <h4 className="font-body font-semibold text-gray-900 mb-3">Quick Stats</h4>
          <div className="space-y-2 font-body text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Profile Completeness:</span>
              <span className="font-semibold">{Math.round((profile.skills.length / 10) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Experience Entries:</span>
              <span className="font-semibold">{profile.experiences.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Skills Listed:</span>
              <span className="font-semibold">{profile.skills.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Projects:</span>
              <span className="font-semibold">{profile.projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Certifications:</span>
              <span className="font-semibold">{profile.certifications.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Match Score Card
const JobMatchScoreCard = ({ feedback }) => {
  const matchScore = extractMatchScore(feedback);
  
  if (!matchScore) return null;
  
  const getMatchStatus = (score) => {
    if (score >= 80) return { text: 'Strong Match', color: 'text-green-600', bg: 'bg-green-500' };
    if (score >= 60) return { text: 'Good Match', color: 'text-blue-600', bg: 'bg-blue-500' };
    if (score >= 40) return { text: 'Fair Match', color: 'text-amber-600', bg: 'bg-amber-500' };
    return { text: 'Weak Match', color: 'text-red-600', bg: 'bg-red-500' };
  };
  
  const status = getMatchStatus(matchScore);
  
  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-blue-600" size={24} />
        <h3 className="font-heading font-bold text-xl text-gray-900">Job Match Score</h3>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
            <circle 
              cx="64" 
              cy="64" 
              r="56" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - matchScore / 100)}`}
              className={status.bg.replace('bg-', 'text-')}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{matchScore}%</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className={`font-body text-2xl font-bold mb-2 ${status.color}`}>
            {status.text}
          </div>
          <p className="font-body text-sm text-gray-700">
            Your profile has a <strong>{matchScore}% match</strong> with the target job description. 
            {matchScore < 70 && " Review the detailed analysis below for improvement suggestions."}
            {matchScore >= 70 && matchScore < 85 && " You're on the right track - a few tweaks will strengthen your match."}
            {matchScore >= 85 && " Excellent! Your profile aligns well with this role."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Comparison View Component
const ComparisonView = ({ analysis, availablePersonas, profile }) => {
  const personas = Object.keys(analysis.results);
  
  if (personas.length < 2) return null;
  
  const getScoreForPersona = (persona) => {
    const results = analysis.results[persona];
    const headlineScore = calculateSectionScore(results.headline_feedback);
    const aboutScore = calculateSectionScore(results.about_feedback);
    const experienceScore = calculateSectionScore(results.experience_feedback);
    return Math.round((headlineScore + aboutScore + experienceScore) / 3);
  };
  
  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-gray-300 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-gray-700" size={24} />
        <h3 className="font-heading font-bold text-xl text-gray-900">Persona Comparison</h3>
      </div>
      
      <p className="font-body text-sm text-gray-600 mb-4">
        See how your profile performs across different audiences
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {personas.map(persona => {
          const personaInfo = availablePersonas.find(p => p.id === persona);
          const Icon = personaInfo?.icon || Users;
          const score = getScoreForPersona(persona);
          
          return (
            <div key={persona} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className="text-brand-secondary" />
                <span className="font-body text-sm font-semibold text-gray-900">
                  {personaInfo?.label || persona}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{score}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="font-body text-sm text-blue-900">
          <strong>Insight:</strong> Scores vary by audience because different personas value different aspects of your profile. 
          Focus on the highest-priority audience for your current goals.
        </p>
      </div>
    </div>
  );
};

const DiffView = ({ original, feedback, type, activePersona, copyToClipboard, copiedStates }) => {
  const extractSuggestion = (feedback) => {
    const optionMatch = feedback.match(/OPTION\s+\d+:\s*(.+?)(?=\n|$)/i);
    if (optionMatch) return optionMatch[1].trim();
    const lines = feedback.split('\n').filter(line => line.trim());
    for (const line of lines) { 
      if (line.length > 50 && line.length < 250 && !line.includes('?') && !line.toLowerCase().includes('current')) 
        return line.trim(); 
    }
    return null;
  };
  const suggestion = extractSuggestion(feedback);
  if (!suggestion) return null;
  
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="font-body text-sm font-semibold text-gray-700 mb-3">Suggested Improvement:</div>
      <div className="space-y-3">
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="font-body text-xs text-red-600 font-medium mb-1">Current:</div>
          <div className="font-body text-sm text-gray-700 line-through opacity-70">{original || 'Not provided'}</div>
        </div>
        <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
          <div className="font-body text-xs text-green-600 font-medium mb-1">Suggested:</div>
          <div className="font-body text-sm text-gray-800">{suggestion}</div>
        </div>
      </div>
      <button onClick={() => copyToClipboard(suggestion, `${type}-${activePersona}`)} className="font-body mt-3 px-4 py-2 bg-brand-primary text-black rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-2 text-sm font-medium">
        {copiedStates[`${type}-${activePersona}`] ? <><CheckCircle2 size={16} />Copied!</> : <><Copy size={16} />Copy Suggestion</>}
      </button>
    </div>
  );
};

const FeedbackSection = ({ title, feedback, sectionKey, icon, originalContent, isExpanded, onToggle, completed, loading, ...props }) => {
  if (!feedback) return null;
  const Icon = icon;
  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={onToggle} className="w-full px-5 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors group">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-brand-secondary group-hover:text-brand-secondary" />
          <span className="font-body text-base font-semibold text-gray-800">{title}</span>
          {completed && loading && <CheckCircle2 size={16} className="text-green-500" />}
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>
      {isExpanded && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
          <div className="font-body whitespace-pre-wrap text-gray-700 text-sm leading-relaxed mb-4">{feedback}</div>
          {originalContent && <DiffView feedback={feedback} original={originalContent} type={sectionKey} {...props} />}
        </div>
      )}
    </div>
  );
};

const AnalysisResults = ({ analysis, profile, activePersona, setActivePersona, availablePersonas, expandedSections, setExpandedSections, copyToClipboard, copiedStates, startNewAnalysis }) => {
  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  const results = analysis.results[activePersona] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-secondary to-brand-primary">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-gray-900">Analysis Complete</h1>
              <p className="font-body text-base text-gray-600">Your personalized LinkedIn optimization report</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          
          {/* Executive Summary - Always shown first */}
          <ExecutiveSummary results={results} profile={profile} />
          
          {/* Job Match Score Card - Only if job seeking */}
          {results.job_match_feedback && results.job_match_feedback.trim() && (
            <JobMatchScoreCard feedback={results.job_match_feedback} />
          )}
          
          {/* Comparison View - Only if multiple personas */}
          <ComparisonView 
            analysis={analysis} 
            availablePersonas={availablePersonas} 
            profile={profile}
          />
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-brand-primary" size={20} />
              <h3 className="font-heading font-bold text-lg font-semibold text-gray-900">View by Audience</h3>
            </div>
            <div className="flex flex-wrap gap-3 mb-5">
              {Object.keys(analysis.results).map(persona => {
                const personaInfo = availablePersonas.find(p => p.id === persona);
                const Icon = personaInfo?.icon || Users;
                return (
                  <button 
                    key={persona} 
                    onClick={() => { 
                      setActivePersona(persona); 
                      const expanded = {}; 
                      Object.keys(analysis.results[persona]).forEach(key => { 
                        if (key !== 'holistic_feedback') expanded[key] = true; 
                      }); 
                      setExpandedSections(expanded); 
                    }} 
                    className={`font-body px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activePersona === persona ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'}`}
                  >
                    <Icon size={18} />
                    {personaInfo ? personaInfo.label : persona.charAt(0).toUpperCase() + persona.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Job Match Section - Full details */}
          {results.job_match_feedback && results.job_match_feedback.trim() && (
            <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Search className="text-blue-600" size={24} />
                Job Match Analysis Details
              </h3>
              <div className="font-body text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-5 rounded-lg border border-blue-200 max-h-96 overflow-y-auto">
                {results.job_match_feedback}
              </div>
              <div className="mt-4 p-3 bg-blue-100 border-l-4 border-blue-500 rounded">
                <p className="font-body text-sm text-blue-900">
                  <strong>Tip:</strong> Use the specific recommendations above to optimize your profile for ATS (Applicant Tracking Systems) and recruiter searches.
                </p>
              </div>
            </div>
          )}
          
          {results.holistic_feedback && (
            <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Target className="text-amber-600" size={24} />
                Strategic Overview
              </h3>
              <div className="font-body text-gray-800 whitespace-pre-wrap leading-relaxed">{results.holistic_feedback}</div>
            </div>
          )}
          
          <div className="space-y-3">
            <FeedbackSection title="Headline Analysis" feedback={results.headline_feedback} sectionKey="headline" icon={Briefcase} originalContent={profile.headline} isExpanded={!!expandedSections['headline']} onToggle={() => toggleSection('headline')} copyToClipboard={copyToClipboard} copiedStates={copiedStates} activePersona={activePersona} />
            <FeedbackSection title="About Section" feedback={results.about_feedback} sectionKey="about" icon={Users} originalContent={profile.about} isExpanded={!!expandedSections['about']} onToggle={() => toggleSection('about')} copyToClipboard={copyToClipboard} copiedStates={copiedStates} activePersona={activePersona} />
            <FeedbackSection title="Experience" feedback={results.experience_feedback} sectionKey="experience" icon={TrendingUp} isExpanded={!!expandedSections['experience']} onToggle={() => toggleSection('experience')} />
            <FeedbackSection title="Education" feedback={results.education_feedback} sectionKey="education" icon={BookOpen} isExpanded={!!expandedSections['education']} onToggle={() => toggleSection('education')} />
            <FeedbackSection title="Skills" feedback={results.skills_feedback} sectionKey="skills" icon={Award} isExpanded={!!expandedSections['skills']} onToggle={() => toggleSection('skills')} />
            <FeedbackSection title="Projects" feedback={results.projects_feedback} sectionKey="projects" icon={Target} isExpanded={!!expandedSections['projects']} onToggle={() => toggleSection('projects')} />
            <FeedbackSection title="Certifications" feedback={results.certifications_feedback} sectionKey="certifications" icon={Award} isExpanded={!!expandedSections['certifications']} onToggle={() => toggleSection('certifications')} />
          </div>
          
          <button onClick={startNewAnalysis} className="btn w-full btn-secondary mt-8">Start New Analysis</button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;