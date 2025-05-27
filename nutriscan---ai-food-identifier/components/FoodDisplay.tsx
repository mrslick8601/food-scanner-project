import React from 'react';
import type { FoodInfo, NutrientInfo } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { WarningIcon } from './icons/WarningIcon';

interface FoodDisplayProps {
  foodInfo: FoodInfo;
  capturedImage?: string | null; // Made optional
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; cardClassName?: string }> = ({ title, children, icon, cardClassName = "bg-slate-50" }) => (
  <div className={`${cardClassName} p-5 rounded-lg shadow-md border border-slate-200`}>
    <div className="flex items-center mb-3">
      {icon && <span className="mr-2">{icon}</span>}
      <h3 className="text-xl font-semibold text-emerald-700" style={{fontFamily: "'Poppins', sans-serif"}}>{title}</h3>
    </div>
    {children}
  </div>
);

const NutrientItem: React.FC<{ nutrient: NutrientInfo }> = ({ nutrient }) => (
  <li className="flex justify-between py-2 border-b border-slate-200 last:border-b-0">
    <span className="text-slate-700 font-medium">{nutrient.name}</span>
    <span className="text-slate-600">{nutrient.value}</span>
  </li>
);

export const FoodDisplay: React.FC<FoodDisplayProps> = ({ foodInfo, capturedImage }) => {
  if (!foodInfo.identified) {
    return (
      <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
        <WarningIcon className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-amber-700 mb-2">Information Not Available</h2>
        <p className="text-amber-600">{foodInfo.reason || "The AI could not find information for the specified item."}</p>
        {capturedImage && (
          <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Unidentified item" className="mt-4 rounded-lg shadow-md max-h-60 w-auto mx-auto" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="text-center">
        {capturedImage && (
          <img src={`data:image/jpeg;base64,${capturedImage}`} alt={foodInfo.name || "Captured food"} className="mx-auto mb-4 rounded-lg shadow-xl max-h-72 w-auto border-4 border-white" />
        )}
        <h2 className="text-3xl font-bold text-emerald-600" style={{fontFamily: "'Poppins', sans-serif"}}>{foodInfo.name || "Identified Food"}</h2>
        {foodInfo.calories && <p className="text-lg text-slate-600 mt-1">{foodInfo.calories}</p>}
      </header>

      {foodInfo.nutrients && foodInfo.nutrients.length > 0 && (
        <InfoCard title="Key Nutrients" icon={<LeafIcon className="w-6 h-6 text-emerald-500" />}>
          <ul className="divide-y divide-slate-200">
            {foodInfo.nutrients.map((nutrient, index) => (
              <NutrientItem key={`${nutrient.name}-${index}`} nutrient={nutrient} />
            ))}
          </ul>
        </InfoCard>
      )}

      {foodInfo.benefits && foodInfo.benefits.length > 0 && (
        <InfoCard title="Health Benefits" icon={<span className="text-2xl">👍</span>}>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {foodInfo.benefits.map((benefit, index) => (
              <li key={`benefit-${index}`}>{benefit}</li>
            ))}
          </ul>
        </InfoCard>
      )}

      {foodInfo.hazards && foodInfo.hazards.length > 0 && (
        <InfoCard title="Potential Hazards / Considerations" icon={<WarningIcon className="w-6 h-6 text-red-500" />} cardClassName="bg-red-50">
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {foodInfo.hazards.map((hazard, index) => (
              <li key={`hazard-${index}`}>{hazard}</li>
            ))}
          </ul>
        </InfoCard>
      )}
    </div>
  );
};
