
import React from 'react';
import type { TabOption } from '../types';
import { CameraIcon } from './icons/CameraIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { LeafIcon } from './icons/LeafIcon';

interface HomePageProps {
  setActiveTab: (tab: TabOption) => void;
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  // Fix: Refined icon type to explicitly allow className prop for React.cloneElement
  icon: React.ReactElement<{ className?: string }>;
  onClick: () => void;
  buttonText: string;
  colorClass: string;
}> = ({ title, description, icon, onClick, buttonText, colorClass }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center`}>
    <div className={`p-3 rounded-full ${colorClass} mb-4`}>
      {React.cloneElement(icon, { className: "w-8 h-8 text-white" })}
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2" style={{fontFamily: "'Poppins', sans-serif"}}>{title}</h3>
    <p className="text-slate-600 mb-4 text-sm flex-grow">{description}</p>
    <button
      onClick={onClick}
      aria-label={`Go to ${title}`}
      className={`mt-auto w-full ${colorClass} text-white font-medium py-2.5 px-4 rounded-lg shadow hover:opacity-90 transition-opacity duration-200`}
    >
      {buttonText}
    </button>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-10 py-4">
      <section className="text-center px-4">
        <LeafIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-600" style={{fontFamily: "'Poppins', sans-serif"}}>
          Welcome to NutriScan AI!
        </h2>
        <p className="mt-3 text-lg text-slate-700 max-w-2xl mx-auto">
          Your intelligent partner for exploring food nutrition, identifying items from images, and getting AI-powered insights on your well-being.
        </p>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-slate-700 mb-6 text-center" style={{fontFamily: "'Poppins', sans-serif"}}>
          Discover Our Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Scan Food Items"
            description="Use your camera to instantly identify food items and get detailed nutritional information, benefits, and potential hazards."
            icon={<CameraIcon />}
            onClick={() => setActiveTab('scan')}
            buttonText="Start Scanning"
            colorClass="bg-emerald-500 hover:bg-emerald-600"
          />
          <FeatureCard
            title="Explore Food Library"
            description="Search for any food, fruit, or vegetable to learn about its properties without needing an image."
            icon={<MagnifyingGlassIcon />}
            onClick={() => setActiveTab('explore')}
            buttonText="Explore Foods"
            colorClass="bg-sky-500 hover:bg-sky-600"
          />
          <FeatureCard
            title="AI Diagnose"
            description="Describe your symptoms to get AI-generated informational insights. (Not a medical diagnosis)."
            icon={<StethoscopeIcon />}
            onClick={() => setActiveTab('symptoms')}
            buttonText="Diagnose Symptoms"
            colorClass="bg-purple-500 hover:bg-purple-600"
          />
        </div>
      </section>

      <section className="text-center mt-12 p-6 bg-slate-50 rounded-xl shadow-inner border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-700 mb-2" style={{fontFamily: "'Poppins', sans-serif"}}>Disclaimer</h3>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          NutriScan AI provides information for educational and informational purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any medical conditions or health objectives.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
