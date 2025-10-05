import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

const LoadingScreen = ({ streamingStatus, currentStreamingSection, useStreaming, streamingData, availablePersonas }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-secondary to-brand-primary flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-6">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"><Loader2 className="animate-spin text-black" size={40} /></div>
          <h2 className="font-heading font-bold text-2xl text-black mb-3">Analyzing Your Profile...</h2>
          {streamingStatus && <p className="font-body text-lg text-black font-medium mb-6">{streamingStatus}</p>}
          {currentStreamingSection && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary rounded-full">
                <Loader2 size={16} className="animate-spin text-black" />
                <span className="font-body text-sm font-medium text-black">Analyzing {currentStreamingSection}...</span>
              </div>
            </div>
          )}
          {useStreaming && Object.keys(streamingData).length > 0 && (
            <div className="space-y-2 mb-6 text-left">
              {Object.entries(streamingData).map(([persona, data]) => (
                <div key={persona} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-body text-sm font-semibold text-gray-700 mb-2">{availablePersonas.find(p => p.id === persona)?.label || persona}</div>
                  <div className="space-y-1">
                    {Object.entries(data).map(([section, content]) => content && (
                      <div key={section} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span className="font-body text-gray-600">{section.replace('_feedback', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3 mb-6">{[1, 2, 3, 4].map((i) => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>)}</div>
          <p className="font-body text-sm text-black">This may take a minute. We're using AI to provide deep insights...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;