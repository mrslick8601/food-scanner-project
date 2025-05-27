
import React, { useState, useCallback, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { FoodDisplay } from './components/FoodDisplay';
import { Spinner } from './components/Spinner';
import { FoodExplorer } from './components/FoodExplorer';
import { SymptomChecker } from './components/SymptomChecker';
import HomePage from './components/HomePage';
import { identifyFoodAndGetInfo } from './services/geminiService';
import type { FoodInfo, TabOption } from './types';

import { LeafIcon } from './components/icons/LeafIcon';
import { MenuIcon } from './components/icons/MenuIcon'; 
import { CloseIcon } from './components/icons/CloseIcon'; 
import { HomeIcon } from './components/icons/HomeIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { MagnifyingGlassIcon } from './components/icons/MagnifyingGlassIcon';
import { StethoscopeIcon } from './components/icons/StethoscopeIcon';
import { ChatHeadIcon } from './components/icons/ChatHeadIcon'; 
import { FeedbackModal } from './components/FeedbackModal'; 


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabOption>('home');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false); 
  
  // States for Scan Food Tab
  const [isScanLoading, setIsScanLoading] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanFoodInfo, setScanFoodInfo] = useState<FoodInfo | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(true);

  // State for Feedback Modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  const handleCapture = useCallback(async (imageBase64: string) => {
    setShowCamera(false); 
    setIsScanLoading(true);
    setScanError(null); 
    setScanFoodInfo(null);
    setCapturedImage(imageBase64);

    try {
      const info = await identifyFoodAndGetInfo(imageBase64);
      setScanFoodInfo(info);
      if (!info.identified && info.reason) {
        setScanError(info.reason); 
      }
    } catch (err) {
      console.error("Error identifying food:", err);
      let errorMessage = "Failed to identify food. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setScanError(errorMessage);
    } finally {
      setIsScanLoading(false);
    }
  }, []);

  const handleScanAgain = () => {
    setScanFoodInfo(null);
    setCapturedImage(null);
    setScanError(null);
    setIsScanLoading(false);
    setShowCamera(true); 
  };
  
  const handleSetActiveTab = (tab: TabOption) => {
    setActiveTab(tab);
    setIsNavOpen(false); 
    if (tab !== 'scan' && activeTab === 'scan') {
       handleScanAgain(); 
    } else if (tab === 'scan' && activeTab !== 'scan') {
       handleScanAgain(); 
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFeedbackModalOpen) {
          setIsFeedbackModalOpen(false);
        } else if (isNavOpen) {
          setIsNavOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNavOpen, isFeedbackModalOpen]);

  const handleSubmitFeedback = (feedback: string, userEmail?: string) => {
    console.log("Feedback submitted by user (attempting mailto):", feedback, "User Email:", userEmail);
    
    const recipientEmail = "slick8601@gmail.com";
    const subject = `NutriScan AI Feedback ${userEmail ? `from ${userEmail}` : '(User did not provide email)'}`;
    
    let body = `Feedback from NutriScan AI user:\n\n${feedback}`;
    if (userEmail) {
      body += `\n\nUser's Email (for follow-up): ${userEmail}`;
    } else {
      body += `\n\n(User did not provide an email address for follow-up.)`;
    }
    
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
        const mailWindow = window.open(mailtoLink, '_blank');
        if (!mailWindow) { 
            window.location.href = mailtoLink;
        }
    } catch (e) {
        console.error("Could not open mailto link directly, falling back to window.location.href", e);
        window.location.href = mailtoLink; 
    }
  };

  const renderScanFoodTab = () => (
    <>
      {scanError && !isScanLoading && !showCamera && ( 
        <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 mb-6 rounded-md shadow" role="alert">
          <p className="font-bold text-lg">Scan Result Error</p>
          <p>{scanError}</p>
        </div>
      )}

      {isScanLoading && (
        <div className="flex flex-col items-center justify-center my-10 p-6 bg-slate-50 rounded-lg shadow-inner">
          <Spinner />
          <p className="mt-4 text-lg text-slate-700 font-medium">Analyzing your food...</p>
          {capturedImage && <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured food for analysis" className="mt-5 rounded-lg shadow-lg max-h-60 w-auto border-2 border-slate-200" />}
        </div>
      )}

      {!isScanLoading && showCamera && (
        <CameraCapture onCapture={handleCapture} onError={(err) => {setScanError(err); setScanFoodInfo(null); setShowCamera(true); /* Keep camera view on error */ }} />
      )}
      
       {scanError && showCamera && !isScanLoading && ( 
          <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 my-4 rounded-md shadow" role="alert">
            <p className="font-bold text-lg">Operation Error</p>
            <p>{scanError}</p>
            <button onClick={() => { setScanError(null); }} className="mt-2 text-sm text-red-700 hover:underline">Dismiss</button>
          </div>
       )}

      {!isScanLoading && !showCamera && scanFoodInfo && (
        <>
          <FoodDisplay foodInfo={scanFoodInfo} capturedImage={capturedImage} />
          <button
            onClick={handleScanAgain}
            aria-label="Scan another item"
            className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-opacity-75"
          >
            Scan Another Item
          </button>
        </>
      )}
      
      {!isScanLoading && !showCamera && !scanFoodInfo && !scanError && (
         <div className="text-center py-10 px-4">
          <p className="text-slate-600 text-lg mb-6">No food information was returned from the scan, or an issue occurred.</p>
           <button
            onClick={handleScanAgain}
            aria-label="Try scanning again"
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-opacity-75"
          >
            Try Scan Again
          </button>
         </div>
      )}
    </>
  );

  interface TabButtonProps {
    tab: TabOption;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    currentTab: TabOption;
    onClick: (tab: TabOption) => void;
  }

  const TabButton: React.FC<TabButtonProps> = ({ tab, label, icon, currentTab, onClick }) => (
    <button
      onClick={() => onClick(tab)}
      aria-current={tab === currentTab ? 'page' : undefined}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-medium rounded-md transition-colors duration-150
                  ${tab === currentTab
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-100 hover:bg-slate-600 hover:text-white'
                  }`}
    >
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-600 to-blue-700 flex flex-col items-center p-2 sm:p-4 selection:bg-emerald-300 selection:text-emerald-900">
      
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 shadow-xl p-4 space-y-2 z-50 transform transition-transform duration-300 ease-in-out
                    ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Main navigation"
        id="main-nav"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-white">
            <LeafIcon className="w-8 h-8 text-emerald-400 mr-2" />
            <span className="font-bold text-xl">NutriScan</span>
          </div>
          <button 
            onClick={() => setIsNavOpen(false)} 
            className="text-slate-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close navigation menu"
            aria-controls="main-nav"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <TabButton tab="home" label="Home" icon={<HomeIcon />} currentTab={activeTab} onClick={handleSetActiveTab} />
        <TabButton tab="scan" label="Scan Food" icon={<CameraIcon />} currentTab={activeTab} onClick={handleSetActiveTab} />
        <TabButton tab="explore" label="Explore Foods" icon={<MagnifyingGlassIcon />} currentTab={activeTab} onClick={handleSetActiveTab} />
        <TabButton tab="symptoms" label="Diagnose" icon={<StethoscopeIcon />} currentTab={activeTab} onClick={handleSetActiveTab} />
      </div>
      
      <div className={`w-full max-w-5xl flex flex-col flex-1 transition-transform duration-300 ease-in-out ${isNavOpen && false ? 'md:translate-x-64' : ''}`}>
        <header className="text-center py-6 md:py-8 px-6 bg-white/90 backdrop-blur-sm rounded-t-xl shadow-lg border-b border-slate-200 relative">
          <button 
            onClick={() => setIsNavOpen(true)} 
            className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-md text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Open navigation menu"
            aria-controls="main-nav"
            aria-expanded={isNavOpen}
          >
            <MenuIcon className="w-7 h-7" />
          </button>
          <div className="flex items-center justify-center mb-2">
            <LeafIcon className="w-12 h-12 md:w-14 md:h-14 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-600 ml-3" style={{fontFamily: "'Poppins', sans-serif"}}>NutriScan AI</h1>
          </div>
          <p className="text-slate-600 text-md md:text-lg">Your intelligent guide to food and wellness.</p>
        </header>
        
        <main 
          className={`flex-1 p-4 sm:p-6 md:p-8 bg-white shadow-lg rounded-b-xl overflow-y-auto border-x border-b border-white/30 
                      ${isNavOpen ? 'opacity-70 md:opacity-100' : 'opacity-100'}`}
          role="main" 
          aria-live="polite" 
          aria-atomic="true" 
          id={`tabpanel-${activeTab}`}
          onClick={() => { if (isNavOpen && window.innerWidth < 768) setIsNavOpen(false); }} 
        >
            {activeTab === 'home' && <HomePage setActiveTab={handleSetActiveTab} />}
            {activeTab === 'scan' && renderScanFoodTab()}
            {activeTab === 'explore' && <FoodExplorer />}
            {activeTab === 'symptoms' && <SymptomChecker />}
        </main>
      </div>

      <footer className="text-center py-6 text-white text-opacity-90 text-sm mt-4">
        <p>&copy; {new Date().getFullYear()} NutriScan AI. Created by Emmanuel Kumah. Powered by Gemini.</p>
        <p className="mt-1">For informational and educational purposes only. Not a substitute for professional medical advice.</p>
      </footer>

      {/* Feedback Chat Head */}
      <button
        onClick={() => setIsFeedbackModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-75 z-30"
        aria-label="Open feedback form"
      >
        <ChatHeadIcon className="w-8 h-8" />
      </button>

      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleSubmitFeedback} 
      />
    </div>
  );
};

export default App;
