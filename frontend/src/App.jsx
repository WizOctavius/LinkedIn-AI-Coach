import React, { useState } from 'react';
import { Briefcase, Check, ArrowRight, ArrowLeft, Target } from 'lucide-react';

import Step1_HeadlineSummary from './components/Step1_HeadlineSummary.jsx';
import Step2_ExperienceEducation from './components/Step2_ExperienceEducation.jsx';
import Step3_SkillsPortfolio from './components/Step3_SkillsPortfolio.jsx';
import Step4_TargetAudience from './components/Step4_TargetAudience.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import AnalysisResults from './components/AnalysisResults.jsx';
import { Users, TrendingUp, Award } from 'lucide-react'; 

const LinkedInProfileAnalyzer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
  headline: '',
  about: '',
  experiences: [{ 
    jobTitle: '', 
    company: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    isCurrent: false 
  }],
    education: [{ 
    degree: '', 
    institution: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    isCurrent: false 
  }],
  skills: [],
  projects: [{ name: '', description: '' }],
  certifications: [{ name: '', organization: '' }],
  target_personas: ['general'],
  is_job_seeking: false,
  target_job_descriptions: ['']
});
  const [skillInput, setSkillInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState('');
  const [currentStreamingSection, setCurrentStreamingSection] = useState('');
  const [streamingData, setStreamingData] = useState({});
  const [completedSections, setCompletedSections] = useState(new Set());
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [activePersona, setActivePersona] = useState('general');
  const [copiedStates, setCopiedStates] = useState({});
  const [validationError, setValidationError] = useState('');
  const [useStreaming] = useState(true);

  const availablePersonas = [
    { id: 'general', label: 'General Audience', description: 'Broad professional appeal', icon: Users },
    { id: 'recruiter', label: 'Recruiters', description: 'Optimized for recruiter searches', icon: Target },
    { id: 'hiring_manager', label: 'Hiring Managers', description: 'Technical fit evaluation', icon: Briefcase },
    { id: 'client', label: 'Potential Clients', description: 'Service/expertise focus', icon: TrendingUp },
    { id: 'investor', label: 'Investors', description: 'Business potential emphasis', icon: Award },
    { id: 'peer', label: 'Industry Peers', description: 'Collaboration opportunities', icon: Users }
  ];
  
  const steps = [
    { number: 1, title: 'Headline & Summary', description: 'Your first impression' },
    { number: 2, title: 'Experience & Education', description: 'Your professional journey' },
    { number: 3, title: 'Skills & Portfolio', description: 'Your expertise showcase' },
    { number: 4, title: 'Target Audience', description: 'Who do you want to reach?' }
  ];

  const togglePersona = (personaId) => {
    setProfile(prev => {
      const currentPersonas = prev.target_personas || ['general'];
      if (currentPersonas.includes(personaId)) {
        if (currentPersonas.length === 1) return prev;
        return { ...prev, target_personas: currentPersonas.filter(p => p !== personaId) };
      } else {
        return { ...prev, target_personas: [...currentPersonas, personaId] };
      }
    });
  };
  
  const handleInputChange = (field, value) => setProfile({ ...profile, [field]: value });
  
  const handleArrayItemChange = (arrayName, index, field, value) => {
    const newArray = [...profile[arrayName]];
    newArray[index][field] = value;
    setProfile({ ...profile, [arrayName]: newArray });
  };
  
  const addArrayItem = (arrayName, template) => setProfile({ ...profile, [arrayName]: [...profile[arrayName], template] });
  
  const removeArrayItem = (arrayName, index) => {
    if (profile[arrayName].length > 1) {
      const newArray = profile[arrayName].filter((_, i) => i !== index);
      setProfile({ ...profile, [arrayName]: newArray });
    }
  };
  
  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };
  
  const removeSkill = (skillToRemove) => setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });

  // Job Description handlers
  const addJobDescription = () => setProfile({ ...profile, target_job_descriptions: [...profile.target_job_descriptions, ''] });
  
  const removeJobDescription = (index) => {
    if (profile.target_job_descriptions.length > 1) {
      const newDescriptions = profile.target_job_descriptions.filter((_, i) => i !== index);
      setProfile({ ...profile, target_job_descriptions: newDescriptions });
    }
  };
  
  const handleJobDescriptionChange = (index, value) => {
    const newDescriptions = [...profile.target_job_descriptions];
    newDescriptions[index] = value;
    setProfile({ ...profile, target_job_descriptions: newDescriptions });
  };

  const validateStep = (step) => {
    setValidationError('');
    switch (step) {
      case 1:
        if (!profile.headline.trim()) { setValidationError('Please enter your professional headline before continuing.'); return false; }
        if (!profile.about.trim()) { setValidationError('Please fill in your About section before continuing.'); return false; }
        break;
      case 2:
  // Check if user has filled any experiences
  const filledExperiences = profile.experiences.filter(exp => 
    exp.jobTitle.trim() || exp.company.trim() || exp.description.trim()
  );
  
  // If they've started filling an experience, it must be complete including dates
  const hasIncompleteExperience = filledExperiences.some(exp => 
    !exp.jobTitle.trim() || 
    !exp.company.trim() || 
    !exp.description.trim() || 
    !exp.startDate.trim()
  );
  
  if (filledExperiences.length === 0) {
    setValidationError('Please add at least one work experience.');
    return false;
  }
  
  if (hasIncompleteExperience) {
    setValidationError('Please complete all experience entries including Job Title, Company, Start Date, and Description. Remove any empty entries.');
    return false;
  }

  const filledEducation = profile.education.filter(edu => 
    edu.degree.trim() || edu.institution.trim()
  );
  
  const hasIncompleteEducation = filledEducation.some(edu => 
    !edu.degree.trim() || 
    !edu.institution.trim() || 
    !edu.startDate.trim()
  );
  
  if (filledEducation.length === 0) {
    setValidationError('Please add at least one education entry.');
    return false;
  }
  
  if (hasIncompleteEducation) {
    setValidationError('Please complete all education entries including dates.');
    return false;
  }
        break;
      case 3:
        if (profile.skills.length < 3) { setValidationError(`Please add at least ${3 - profile.skills.length} more skill(s). You currently have ${profile.skills.length}.`); return false; }
        break;
      case 4:
        if (profile.target_personas.length === 0) { setValidationError('Please select at least one target audience before analyzing.'); return false; }
        if (profile.is_job_seeking) {
          const hasValidJobDesc = profile.target_job_descriptions.some(desc => desc.trim().length > 50);
          if (!hasValidJobDesc) {
            setValidationError('Please add at least one job description with more than 50 characters when Job Seeking Mode is enabled.');
            return false;
          }
        }
        break;
      default: return true;
    }
    return true;
  };
  
  const handleNextStep = () => { if (validateStep(currentStep)) { setCurrentStep(currentStep + 1); setValidationError(''); } };
  const handlePreviousStep = () => { setCurrentStep(currentStep - 1); setValidationError(''); };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    setTimeout(() => setCopiedStates({ ...copiedStates, [key]: false }), 2000);
  };
  
  const analyzeProfileStreaming = async () => {
  if (!validateStep(4)) return;
  setLoading(true); setError(''); setAnalysis(null); setValidationError(''); setCurrentStep(5);
  setStreamingStatus('Initializing...'); setStreamingData({}); setCompletedSections(new Set());
  
  try {
    const response = await fetch('http://localhost:8000/analyze-stream', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(profile) 
    });
    
    if (!response.ok) { 
      console.error('HTTP Error:', response.status);
      throw new Error('Streaming failed. Falling back to standard analysis...'); 
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentPersonaData = {};
    let allPersonaResults = {};
    let currentPersona = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '' || !line.startsWith('data: ')) continue;
        
        try {
          const jsonStr = line.slice(6).trim(); 
          if (!jsonStr) continue;
          
          const data = JSON.parse(jsonStr);
          console.log('Received:', data.type); 
          
          if (data.type === 'persona_start') {
            currentPersona = data.persona;
            setStreamingStatus(`Analyzing for ${availablePersonas.find(p => p.id === data.persona)?.label || data.persona}...`);
            currentPersonaData = { 
              headline_feedback: '', about_feedback: '', experience_feedback: '', 
              education_feedback: '', skills_feedback: '', projects_feedback: '', 
              certifications_feedback: '', holistic_feedback: '', job_match_feedback: '' 
          };
          } else if (data.type === 'section_start') {
            setCurrentStreamingSection(data.section);
            setStreamingStatus(`Analyzing ${data.section}...`);
          } else if (data.type === 'stream') {
            const sectionKey = `${data.section}_feedback`;
            currentPersonaData[sectionKey] = (currentPersonaData[sectionKey] || '') + data.chunk;
            setStreamingData(prev => ({ ...prev, [currentPersona]: { ...currentPersonaData } }));
          } else if (data.type === 'section_complete') {
            setCompletedSections(prev => new Set([...prev, data.section]));
          } else if (data.type === 'persona_complete') {
            allPersonaResults[currentPersona] = { ...currentPersonaData };
          } else if (data.type === 'complete') {
            setAnalysis({ results: data.results });
            setActivePersona(Object.keys(data.results)[0]);
            const expanded = {};
            Object.keys(data.results[Object.keys(data.results)[0]]).forEach(key => { 
              if (key !== 'holistic_feedback') expanded[key] = true; 
            });
            setExpandedSections(expanded);
            setStreamingStatus('Analysis complete!');
          } else if (data.type === 'error') {
            console.error('Backend error:', data.message);
            if (data.trigger_fallback) { 
              throw new Error('Backend error: ' + data.message); 
            }
            setError(data.message);
          }
        } catch (parseError) { 
          // Only log parse errors, don't fail the entire stream
          console.warn('Parse error for line:', line, parseError.message);
        }
      }
    }
  } catch (err) {
    console.error('Streaming failed:', err.message);
    setStreamingStatus('Switching to fallback mode...');
    await analyzeProfileFallback();
  } finally {
    setLoading(false); 
    setStreamingStatus(''); 
    setCurrentStreamingSection('');
  }
};
  
  const analyzeProfileFallback = async () => {
    setStreamingStatus('Using standard analysis mode...');
    try {
      const response = await fetch('http://localhost:8000/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      if (!response.ok) { throw new Error('Analysis failed. Please check your API keys and try again.'); }
      const data = await response.json();
      setAnalysis(data);
      const firstPersona = Object.keys(data.results)[0];
      setActivePersona(firstPersona);
      const expanded = {};
      if (data.results && data.results[firstPersona]) {
        Object.keys(data.results[firstPersona]).forEach(key => { if (key !== 'holistic_feedback') { expanded[key] = true; } });
      }
      setExpandedSections(expanded);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const analyzeProfile = () => {
    if (useStreaming) {
      analyzeProfileStreaming();
    } else {
      setLoading(true); setError(''); setAnalysis(null); setValidationError(''); setCurrentStep(5);
      analyzeProfileFallback().finally(() => setLoading(false));
    }
  };

  const startNewAnalysis = () => {
    setCurrentStep(1);
    setAnalysis(null);
    setError('');
    setStreamingData({});
    setCompletedSections(new Set());
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1_HeadlineSummary profile={profile} handleInputChange={handleInputChange} />;
      case 2: return <Step2_ExperienceEducation profile={profile} handleArrayItemChange={handleArrayItemChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case 3: return <Step3_SkillsPortfolio profile={profile} skillInput={skillInput} setSkillInput={setSkillInput} addSkill={addSkill} removeSkill={removeSkill} handleArrayItemChange={handleArrayItemChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />;
      case 4: return <Step4_TargetAudience 
        profile={profile} 
        availablePersonas={availablePersonas} 
        togglePersona={togglePersona} 
        handleInputChange={handleInputChange}
        addJobDescription={addJobDescription}
        removeJobDescription={removeJobDescription}
        handleJobDescriptionChange={handleJobDescriptionChange}
      />;
      default: return null;
    }
  };

  if (currentStep === 5 && loading) {
    return <LoadingScreen streamingStatus={streamingStatus} currentStreamingSection={currentStreamingSection} useStreaming={useStreaming} streamingData={streamingData} availablePersonas={availablePersonas} />;
  }

  if (analysis && !loading) {
    return <AnalysisResults analysis={analysis} profile={profile} activePersona={activePersona} setActivePersona={setActivePersona} availablePersonas={availablePersonas} expandedSections={expandedSections} setExpandedSections={setExpandedSections} copyToClipboard={copyToClipboard} copiedStates={copiedStates} startNewAnalysis={startNewAnalysis} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-secondary to-brand-primary">
      <div className="bg-gradient-to-br from-white via-brand-primary/10 to-white border-b border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 animate-spotlight-move" 
            style={{
              background: 'radial-gradient(circle at 50% 50%, var(--color-brand-primary) 0%, transparent 60%)'
            }}
        />
        
        <div className="max-w-6xl mx-auto px-6 py-6 text-center relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl hover:shadow-2xl transition-shadow">
            <Briefcase size={24} className="text-black" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 drop-shadow-sm">
            LinkedIn Profile Analyzer
          </h1>
          <p className="font-body text-sm font-bold text-gray-600 mt-2">
            AI-powered insights to elevate your professional presence
          </p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep === step.number ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg scale-110' : currentStep > step.number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {currentStep > step.number ? <Check size={24} /> : step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`font-body text-sm font-semibold ${currentStep === step.number ? 'text-brand-primary' : 'text-gray-600'}`}>{step.title}</div>
                    <div className="font-body text-xs text-black font-bold hidden sm:block">{step.description}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">{steps.find(s => s.number === currentStep)?.title}</h2>
            <p className="font-body text-base text-gray-600">{steps.find(s => s.number === currentStep)?.description}</p>
          </div>
          {renderStepContent()}
          {validationError && (
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5"><span className="font-body text-white text-xs font-bold">!</span></div>
                <p className="font-body text-amber-800 font-medium">{validationError}</p>
              </div>
            </div>
          )}
          {error && <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"><p className="font-body text-red-800 font-medium">{error}</p></div>}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && <button onClick={handlePreviousStep} className="btn btn-lg btn-secondary"><ArrowLeft size={20} />Previous</button>}
            {currentStep < 4 ? (
              <button onClick={handleNextStep} className="btn btn-lg btn-primary-gradient">Next<ArrowRight size={20} /></button>
            ) : (
              <button onClick={analyzeProfile} disabled={loading} className="btn btn-lg btn-success-gradient"><Target size={20} />Analyze Profile</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInProfileAnalyzer;