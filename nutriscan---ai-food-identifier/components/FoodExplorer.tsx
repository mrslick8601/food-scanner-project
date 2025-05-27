
import React, { useState } from 'react';
import { getFoodInfoByName } from '../services/geminiService';
import type { FoodInfo } from '../types';
import { FoodDisplay } from './FoodDisplay';
import { Spinner } from './Spinner';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

export const FoodExplorer: React.FC = () => {
  const [foodName, setFoodName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [foodInfo, setFoodInfo] = useState<FoodInfo | null>(null);

  const commonFoods = ["Apple", "Banana", "Orange", "Broccoli", "Chicken Breast", "Salmon", "Rice", "Oats", "Almonds", "Spinach"];

  const handleFetchFoodInfo = async (nameToFetch: string) => {
    if (!nameToFetch.trim()) {
      setError("Please enter a food name.");
      setFoodInfo(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setFoodInfo(null);
    try {
      const info = await getFoodInfoByName(nameToFetch);
      setFoodInfo(info);
      if (!info.identified) {
        setError(info.reason || "Could not find information for this food.");
      }
    } catch (err) {
      console.error("Error fetching food info:", err);
      let errorMessage = "Failed to fetch food information. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchFoodInfo(foodName);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800 text-center" style={{fontFamily: "'Poppins', sans-serif"}}>Explore Food Details</h2>
      <p className="text-center text-slate-600 mb-6">
        Enter the name of a food, fruit, or vegetable to learn about its nutritional value, benefits, and potential hazards.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
        <input
          type="text"
          value={foodName}
          onChange={(e) => {
            setFoodName(e.target.value);
            if (error) setError(null); // Clear error on new input
            if (foodInfo) setFoodInfo(null); // Clear previous results on new input
          }}
          placeholder="E.g., Apple, Banana, Spinach"
          aria-label="Enter food name"
          className="flex-grow p-3.5 text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-60 focus:ring-offset-1 focus:outline-none transition-all duration-150 ease-in-out"
        />
        <button
          type="submit"
          disabled={isLoading || !foodName.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span>{isLoading ? 'Searching...' : 'Get Info'}</span>
        </button>
      </form>

      <div className="mb-6">
        <p className="text-sm text-slate-600 text-center mb-2">Or try one of these common foods:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {commonFoods.map(food => (
            <button
              key={food}
              onClick={() => {
                setFoodName(food);
                handleFetchFoodInfo(food);
              }}
              disabled={isLoading}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-md text-sm transition duration-150 disabled:opacity-50"
            >
              {food}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center my-10">
          <Spinner />
          <p className="mt-4 text-lg text-slate-700">Fetching information for {foodName}...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {foodInfo && !isLoading && (
        <div className="mt-6">
          <FoodDisplay foodInfo={foodInfo} />
        </div>
      )}
    </div>
  );
};
