
import React, { useState } from 'react';
import { analyzeSymptoms } from '../services/geminiService';
import type { SymptomAnalysis } from '../types';
import { Spinner } from './Spinner';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { WarningIcon } from './icons/WarningIcon';

export const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      setAnalysis(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeSymptoms(symptoms);
      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      console.error("Error analyzing symptoms:", err);
      let errorMessage = "Failed to analyze symptoms. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800 text-center" style={{fontFamily: "'Poppins', sans-serif"}}>AI Diagnose</h2>
      
      <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md" role="alert">
        <div className="flex items-center">
          <WarningIcon className="w-6 h-6 mr-3 text-amber-600" />
          <div>
            <p className="font-bold">Important Disclaimer:</p>
            <p className="text-sm">This tool provides AI-generated information for general knowledge only. It is <strong className="underline">NOT a substitute for professional medical advice, diagnosis, or treatment</strong>. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read from this tool.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symptoms-input" className="block text-sm font-semibold text-slate-600 mb-1.5 tracking-wide">
            Describe your symptoms:
          </label>
          <textarea
            id="symptoms-input"
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value)
              if (error) setError(null);
              if (analysis) setAnalysis(null);
            }}
            placeholder="E.g., I have a sore throat, headache, and feel tired."
            rows={4}
            className="w-full p-3.5 text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-60 focus:ring-offset-1 focus:outline-none transition-all duration-150 ease-in-out"
            aria-label="Describe your symptoms"
            aria-describedby="symptom-disclaimer"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !symptoms.trim()}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <StethoscopeIcon className="w-5 h-5" />
          <span>{isLoading ? 'Analyzing...' : 'Analyze Symptoms'}</span>
        </button>
      </form>
      <p id="symptom-disclaimer" className="sr-only">This symptom checker is for informational purposes only and not a medical diagnosis.</p>


      {isLoading && (
        <div className="flex flex-col items-center justify-center my-10">
          <Spinner />
          <p className="mt-4 text-lg text-slate-700">Analyzing symptoms...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {analysis && !isLoading && !analysis.error && (
        <div className="mt-6 p-5 bg-slate-50 rounded-lg shadow-md border border-slate-200 space-y-4">
          <h3 className="text-xl font-semibold text-sky-700" style={{fontFamily: "'Poppins', sans-serif"}}>AI Analysis Results:</h3>
          
          {analysis.possibleConditions && analysis.possibleConditions.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800">Potential Considerations:</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1 mt-1">
                {analysis.possibleConditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.advice && (
            <div>
              <h4 className="font-semibold text-slate-800">Advice:</h4>
              <p className="text-slate-700 mt-1 whitespace-pre-wrap">{analysis.advice}</p>
            </div>
          )}
          
          {analysis.disclaimer && (
             <div className="mt-4 bg-amber-100 border border-amber-300 text-amber-800 p-3 rounded-md">
                <p className="font-bold text-sm">Reminder:</p>
                <p className="text-sm whitespace-pre-wrap">{analysis.disclaimer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
