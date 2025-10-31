import React from 'react';
import { ModelOptions } from '../types';

interface OptionsPanelProps {
  options: ModelOptions;
  setOptions: React.Dispatch<React.SetStateAction<ModelOptions>>;
  isDisabled: boolean;
  hideModelAttributes?: boolean; // hides gender/age/ethnicity when true
}

const OptionButton = ({ label, isSelected, onClick, disabled }: { label: string, isSelected: boolean, onClick: () => void, disabled: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-50 ${
      isSelected
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
        : 'bg-gray-800/60 hover:bg-gray-700 text-gray-300 border border-gray-700/50'
    }`}
  >
    {label}
  </button>
);

const BackgroundOption = ({ label, style, isSelected, onClick, disabled }: { label: string, style: React.CSSProperties, isSelected: boolean, onClick: () => void, disabled: boolean }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center space-y-3 group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        <div className={`relative w-full h-20 rounded-lg transition-all duration-200 flex items-center justify-center overflow-hidden ${
          isSelected
            ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500 shadow-lg shadow-blue-500/20'
            : 'ring-1 ring-gray-700 group-hover:ring-blue-500 group-hover:shadow-md'
        }`} style={style}>
          {isSelected && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-blue-400 font-semibold' : 'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
    </button>
);


const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions, isDisabled, hideModelAttributes }) => {
  const handleOptionChange = <K extends keyof ModelOptions>(
    key: K,
    value: ModelOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const genderOptions: ModelOptions['gender'][] = ['Female', 'Male'];
  const ethnicityOptions: ModelOptions['ethnicity'][] = ['Asian', 'Black', 'Caucasian', 'Hispanic', 'Indian', 'Middle Eastern'];
  const ageOptions: ModelOptions['age'][] = ['Young Adult (18-25)', 'Adult (25-40)', 'Teenager (13-17)', 'Child (3-7)'];
  const backgroundOptions: ModelOptions['background'][] = ['Studio White', 'Studio Gray', 'Outdoor Urban', 'Outdoor Nature'];
  const imageCountOptions: number[] = [1, 2, 3, 4, 5, 6];
  const poseOptions: NonNullable<ModelOptions['pose']>[] = ['Standing', 'Walking', 'Seated', 'Half-body', 'Close-up'];

  const randomizeOnce = () => {
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setOptions(prev => ({
      ...prev,
      gender: pick(['Female','Male'] as const),
      age: pick(['Young Adult (18-25)','Adult (25-40)','Teenager (13-17)','Child (3-7)'] as const),
      ethnicity: pick(['Asian','Black','Caucasian','Hispanic','Indian','Middle Eastern'] as const),
      background: pick(['Studio White','Studio Gray','Outdoor Urban','Outdoor Nature'] as const),
      pose: pick(poseOptions as readonly typeof poseOptions[number][]),
    }));
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v1a1 1 0 01-1 1H7a1 1 0 100 2h1a1 1 0 011 1v1a1 1 0 102 0v-1a1 1 0 011-1h1a1 1 0 100-2h-1a1 1 0 01-1-1V7z" clipRule="evenodd" />
            </svg>
            Surprise Me (random per image)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => handleOptionChange('surpriseMe', !options.surpriseMe)}
              className={`px-3 py-2 text-sm rounded-lg border ${options.surpriseMe ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800/60 text-gray-300 border-gray-700/50'}`}
            >
              {options.surpriseMe ? 'Enabled' : 'Disabled'}
            </button>
            <button
              type="button"
              disabled={isDisabled}
              onClick={randomizeOnce}
              className="px-3 py-2 text-sm rounded-lg bg-gray-800/60 text-gray-300 border border-gray-700/50 hover:bg-gray-700"
            >
              🎲 Randomize once
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Enabled: each image will use random gender, age, ethnicity, background, and pose.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Number of Images
          </label>
          <div className="flex flex-wrap gap-2">
            {imageCountOptions.map(c => (
              <span key={c}>
                <OptionButton label={`${c}`} isSelected={(options.imagesCount || 3) === c} onClick={() => handleOptionChange('imagesCount', c as any)} disabled={isDisabled} />
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Each image costs 10 credits
          </p>
        </div>
        {!hideModelAttributes && !options.surpriseMe && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Gender
          </label>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map(gender => (
              <span key={gender}>
                <OptionButton label={gender} isSelected={options.gender === gender} onClick={() => handleOptionChange('gender', gender)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        )}
        {!hideModelAttributes && !options.surpriseMe && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Ethnicity
          </label>
          <div className="flex flex-wrap gap-2">
            {ethnicityOptions.map(ethnicity => (
              <span key={ethnicity}>
                <OptionButton label={ethnicity} isSelected={options.ethnicity === ethnicity} onClick={() => handleOptionChange('ethnicity', ethnicity)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        )}
        {!hideModelAttributes && !options.surpriseMe && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Age Group
          </label>
          <div className="flex flex-wrap gap-2">
            {ageOptions.map(age => (
              <span key={age}>
                <OptionButton label={age} isSelected={options.age === age} onClick={() => handleOptionChange('age', age)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        )}
        {!hideModelAttributes && !options.surpriseMe && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Pose</label>
          <div className="flex flex-wrap gap-2">
            {poseOptions.map(p => (
              <span key={p}>
                <OptionButton label={p} isSelected={options.pose === p} onClick={() => handleOptionChange('pose', p as any)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        )}
        {!options.surpriseMe && (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Background Setting
            </label>
            <div className="grid grid-cols-2 gap-4">
                <BackgroundOption label="Studio White" style={{backgroundColor: '#f5f5f5'}} isSelected={options.background === 'Studio White'} onClick={() => handleOptionChange('background', 'Studio White')} disabled={isDisabled} />
                <BackgroundOption label="Studio Gray" style={{backgroundColor: '#a3a3a3'}} isSelected={options.background === 'Studio Gray'} onClick={() => handleOptionChange('background', 'Studio Gray')} disabled={isDisabled} />
                <BackgroundOption label="Urban" style={{backgroundImage: 'linear-gradient(to bottom right, #6b7280, #374151)', color: 'white'}} isSelected={options.background === 'Outdoor Urban'} onClick={() => handleOptionChange('background', 'Outdoor Urban')} disabled={isDisabled} />
                <BackgroundOption label="Nature" style={{backgroundImage: 'linear-gradient(to bottom right, #16a34a, #15803d)', color: 'white'}} isSelected={options.background === 'Outdoor Nature'} onClick={() => handleOptionChange('background', 'Outdoor Nature')} disabled={isDisabled} />
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default OptionsPanel;
