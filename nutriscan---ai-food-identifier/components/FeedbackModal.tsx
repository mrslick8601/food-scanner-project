
import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { Spinner } from './Spinner'; 

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, userEmail?: string) => void; // Added userEmail
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>(''); // New state for user's email
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setFeedbackText('');
      setUserEmail(''); // Reset user email
      setIsSubmitting(false);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 700)); 
    onSubmit(feedbackText, userEmail.trim()); // Pass userEmail
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      aria-labelledby="feedback-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} 
    >
      <div 
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 animate-modalAppear"
        onClick={e => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="feedback-modal-title" className="text-2xl font-semibold text-slate-800" style={{fontFamily: "'Poppins', sans-serif"}}>
            {isSubmitted ? "Thank You!" : "Share Your Feedback"}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close feedback form"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center">
            <p className="text-slate-700 text-lg mb-6">Your feedback has been noted. We appreciate you taking the time to help us improve!</p>
            <button
              onClick={onClose}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-slate-600 text-sm">
              We'd love to hear your thoughts! What do you like? What could be better? Any features you'd like to see?
            </p>
            <div>
              <label htmlFor="feedback-user-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Email (Optional, for follow-up):
              </label>
              <input
                id="feedback-user-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full p-3 text-slate-700 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-60 focus:outline-none transition-colors duration-150"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="feedback-textarea" className="block text-sm font-medium text-slate-700 mb-1.5">Your Feedback:</label>
              <textarea
                id="feedback-textarea"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Type your feedback here..."
                rows={5}
                className="w-full p-3 text-slate-700 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 hover:border-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-60 focus:outline-none transition-all duration-150 ease-in-out"
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !feedbackText.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner /> 
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Feedback</span>
              )}
            </button>
          </form>
        )}
      </div>
       <style>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modalAppear {
          animation: modalAppear 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
