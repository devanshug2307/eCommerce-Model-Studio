import React from 'react';
import { ModelOptions } from '../types';

interface OptionsPanelProps {
  options: ModelOptions;
  setOptions: React.Dispatch<React.SetStateAction<ModelOptions>>;
  isDisabled: boolean;
}

const OptionButton = ({ label, isSelected, onClick, disabled }: { label: string, isSelected: boolean, onClick: () => void, disabled: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
  >
    {label}
  </button>
);

const BackgroundOption = ({ label, style, isSelected, onClick, disabled }: { label: string, style: React.CSSProperties, isSelected: boolean, onClick: () => void, disabled: boolean }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center space-y-2 group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        <div className={`w-full h-16 rounded-md transition-all duration-200 flex items-center justify-center ${isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500' : 'ring-1 ring-gray-600 group-hover:ring-blue-500'}`} style={style}>
        </div>
        <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</span>
    </button>
);


const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions, isDisabled }) => {
  const handleOptionChange = <K extends keyof ModelOptions>(
    key: K,
    value: ModelOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };
  
  const genderOptions: ModelOptions['gender'][] = ['Woman', 'Man', 'Girl', 'Boy'];
  const ethnicityOptions: ModelOptions['ethnicity'][] = ['Asian', 'Black', 'Caucasian', 'Hispanic', 'Indian', 'Middle Eastern'];
  const ageOptions: ModelOptions['age'][] = ['Young Adult (18-25)', 'Adult (25-40)', 'Teenager (13-17)', 'Child (3-7)'];
  const backgroundOptions: ModelOptions['background'][] = ['Studio White', 'Studio Gray', 'Outdoor Urban', 'Outdoor Nature'];
  const imageCountOptions: number[] = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold leading-6 text-gray-100 mb-1">
        2. Customize Model
      </h3>
      <p className="text-sm text-gray-400 mb-6">Select the attributes for the model.</p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Images to Generate</label>
          <div className="flex flex-wrap gap-2">
            {imageCountOptions.map(c => (
              <span key={c}>
                <OptionButton label={`${c}`} isSelected={(options.imagesCount || 3) === c} onClick={() => handleOptionChange('imagesCount', c as any)} disabled={isDisabled} />
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Each image costs 10 credits. Choose fewer images to save credits.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map(gender => (
              <span key={gender}>
                <OptionButton label={gender} isSelected={options.gender === gender} onClick={() => handleOptionChange('gender', gender)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ethnicity</label>
          <div className="flex flex-wrap gap-2">
            {ethnicityOptions.map(ethnicity => (
              <span key={ethnicity}>
                <OptionButton label={ethnicity} isSelected={options.ethnicity === ethnicity} onClick={() => handleOptionChange('ethnicity', ethnicity)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
          <div className="flex flex-wrap gap-2">
            {ageOptions.map(age => (
              <span key={age}>
                <OptionButton label={age} isSelected={options.age === age} onClick={() => handleOptionChange('age', age)} disabled={isDisabled} />
              </span>
            ))}
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Background</label>
            <div className="grid grid-cols-2 gap-4">
                <BackgroundOption label="Studio White" style={{backgroundColor: '#f5f5f5'}} isSelected={options.background === 'Studio White'} onClick={() => handleOptionChange('background', 'Studio White')} disabled={isDisabled} />
                <BackgroundOption label="Studio Gray" style={{backgroundColor: '#a3a3a3'}} isSelected={options.background === 'Studio Gray'} onClick={() => handleOptionChange('background', 'Studio Gray')} disabled={isDisabled} />
                <BackgroundOption label="Urban" style={{backgroundImage: 'linear-gradient(to bottom right, #6b7280, #374151)', color: 'white'}} isSelected={options.background === 'Outdoor Urban'} onClick={() => handleOptionChange('background', 'Outdoor Urban')} disabled={isDisabled} />
                <BackgroundOption label="Nature" style={{backgroundImage: 'linear-gradient(to bottom right, #16a34a, #15803d)', color: 'white'}} isSelected={options.background === 'Outdoor Nature'} onClick={() => handleOptionChange('background', 'Outdoor Nature')} disabled={isDisabled} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel;