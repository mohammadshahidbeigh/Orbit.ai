import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface AssessmentData {
  gmat_score?: number;
  gpa?: number;
  work_experience_years?: number;
  program_type: string;
  field_of_interest: string;
  preferred_locations: string[];
  max_budget?: number;
  deadline_flexibility: string;
  weights: {
    weight_gmat: number;
    weight_gpa: number;
    weight_program: number;
    weight_work: number;
    weight_rank: number;
    weight_acceptance: number;
    weight_cost: number;
    weight_scholarship: number;
    weight_location: number;
  };
  strong_essays: boolean;
  research_experience: boolean;
}

const PROGRAM_TYPES = [
  { value: 'MBA', label: 'MBA' },
  { value: 'Graduate', label: 'Graduate (MS/MA)' },
  { value: 'Undergrad', label: 'Undergraduate' }
];

const FIELDS_OF_INTEREST = [
  { value: 'Business', label: 'Business' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Law', label: 'Law' },
  { value: 'Arts', label: 'Arts & Humanities' },
  { value: 'Sciences', label: 'Natural Sciences' },
  { value: 'Social Sciences', label: 'Social Sciences' },
  { value: 'General', label: 'General/Undecided' }
];

const LOCATIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Switzerland', 'Sweden', 'Singapore', 'China'
];

const DEADLINE_FLEXIBILITY = [
  { value: 'tight', label: 'Tight (1-2 months)' },
  { value: 'moderate', label: 'Moderate (3-6 months)' },
  { value: 'flexible', label: 'Flexible (6+ months)' }
];

interface AssessmentProps {
  onClose?: () => void;
  selectedUniversity?: any;
  onComplete?: (assessmentData: AssessmentData) => void;
}

export function Assessment({ onClose, selectedUniversity, onComplete }: AssessmentProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AssessmentData>({
    program_type: selectedUniversity?.program_type || 'MBA',
    field_of_interest: selectedUniversity?.field_of_study || 'Business',
    preferred_locations: selectedUniversity?.country ? [selectedUniversity.country] : ['United States'],
    deadline_flexibility: 'moderate',
    weights: {
      weight_gmat: 0.25,
      weight_gpa: 0.20,
      weight_program: 0.15,
      weight_work: 0.10,
      weight_rank: 0.10,
      weight_acceptance: 0.05,
      weight_cost: 0.05,
      weight_scholarship: 0.05,
      weight_location: 0.05
    },
    strong_essays: false,
    research_experience: false
  });

  const assessmentMutation = useMutation({
    mutationFn: async (data: AssessmentData) => {
      if (selectedUniversity && onComplete) {
        // Single university mode - just return the assessment data
        return { assessmentData: data, selectedUniversity };
      } else {
        // Full assessment mode - call the API
        const response = await api.post('api/assessments/assess', data);
        return response.data;
      }
    },
    onSuccess: (responseData) => {
      if (selectedUniversity && onComplete) {
        // Single university mode
        onComplete(responseData.assessmentData);
      } else {
        // Full assessment mode
        if (onClose) {
          onClose();
        }
        navigate('/recommendations', { 
          state: { 
            recommendations: responseData.recommendations || responseData,
            assessmentId: responseData.assessment_id || responseData.assessmentId 
          } 
        });
      }
    },
    onError: (error) => {
      console.error('Assessment error:', error);
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeightChange = (weightKey: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [weightKey]: value
      }
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location]
    }));
  };

  const handleSubmit = () => {
    assessmentMutation.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Academic Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GMAT Score (optional)
            </label>
            <input
              type="number"
              min="200"
              max="800"
              value={formData.gmat_score || ''}
              onChange={(e) => handleInputChange('gmat_score', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 720"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPA (optional)
            </label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.1"
              value={formData.gpa || ''}
              onChange={(e) => handleInputChange('gpa', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3.6"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Experience (years)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={formData.work_experience_years || ''}
              onChange={(e) => handleInputChange('work_experience_years', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Budget (USD/year)
            </label>
            <input
              type="number"
              min="0"
              value={formData.max_budget || ''}
              onChange={(e) => handleInputChange('max_budget', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50000"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Program Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {PROGRAM_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleInputChange('program_type', type.value)}
                  className={`px-4 py-2 rounded-md border ${
                    formData.program_type === type.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Interest
            </label>
            <select
              value={formData.field_of_interest}
              onChange={(e) => handleInputChange('field_of_interest', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FIELDS_OF_INTEREST.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline Flexibility
            </label>
            <div className="space-y-2">
              {DEADLINE_FLEXIBILITY.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="deadline_flexibility"
                    value={option.value}
                    checked={formData.deadline_flexibility === option.value}
                    onChange={(e) => handleInputChange('deadline_flexibility', e.target.value)}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Location Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {LOCATIONS.map(location => (
            <button
              key={location}
              onClick={() => handleLocationToggle(location)}
              className={`px-3 py-2 rounded-md border text-sm ${
                formData.preferred_locations.includes(location)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {location}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Select all countries/regions you're interested in studying in.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Strengths</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.strong_essays}
              onChange={(e) => handleInputChange('strong_essays', e.target.checked)}
              className="mr-2"
            />
            Strong essay writing skills
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.research_experience}
              onChange={(e) => handleInputChange('research_experience', e.target.checked)}
              className="mr-2"
            />
            Research experience
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Priority Weights</h3>
        <p className="text-sm text-gray-600 mb-4">
          Adjust the importance of different factors in your university matching. 
          The weights should add up to 100%.
        </p>
        <div className="space-y-4">
          {[
            { key: 'weight_gmat', label: 'GMAT Score Match', description: 'How well your GMAT aligns with university averages' },
            { key: 'weight_gpa', label: 'GPA Compatibility', description: 'How well your GPA matches university expectations' },
            { key: 'weight_program', label: 'Program & Field Match', description: 'Alignment with your chosen program and field' },
            { key: 'weight_work', label: 'Work Experience Fit', description: 'How your experience matches university preferences' },
            { key: 'weight_rank', label: 'University Ranking', description: 'Importance of university prestige and ranking' },
            { key: 'weight_acceptance', label: 'Acceptance Probability', description: 'Likelihood of getting accepted' },
            { key: 'weight_cost', label: 'Cost Fit', description: 'How well tuition fits your budget' },
            { key: 'weight_scholarship', label: 'Scholarship Opportunities', description: 'Availability of financial aid' },
            { key: 'weight_location', label: 'Location Preference', description: 'Match with your preferred locations' }
          ].map(item => (
            <div key={item.key}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  {item.label}
                </label>
                <span className="text-sm text-gray-500">
                  {Math.round(formData.weights[item.key as keyof typeof formData.weights] * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={formData.weights[item.key as keyof typeof formData.weights]}
                onChange={(e) => handleWeightChange(item.key, parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Total Weight: {Math.round(Object.values(formData.weights).reduce((sum, weight) => sum + weight, 0) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { title: 'Academic Profile', component: renderStep1 },
    { title: 'Program Preferences', component: renderStep2 },
    { title: 'Location & Strengths', component: renderStep3 },
    { title: 'Priority Weights', component: renderStep4 }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card text-card-foreground border rounded-lg shadow-lg p-8 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:opacity-80"
              aria-label="Close assessment"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {selectedUniversity ? 'University Assessment' : 'University Assessment'}
            </h1>
            <p className="text-muted-foreground">
              {selectedUniversity 
                ? `Complete your profile to assess your fit with ${selectedUniversity.name}`
                : 'Tell us about your academic profile and preferences to get personalized university recommendations.'
              }
            </p>
            {selectedUniversity && (
              <div className="mt-4 p-4 bg-muted rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {selectedUniversity.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedUniversity.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUniversity.country} • {selectedUniversity.program_type}
                      {selectedUniversity.world_ranking && ` • Rank #${selectedUniversity.world_ranking}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    index + 1 <= currentStep ? 'text-blue-600' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      index + 1 < currentStep ? 'bg-blue-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {steps[currentStep - 1].component()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md ${
                currentStep === 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={assessmentMutation.isPending}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {assessmentMutation.isPending 
                  ? (selectedUniversity ? 'Adding to List...' : 'Finding Matches...') 
                  : (selectedUniversity ? 'Add to My List' : 'Get Recommendations')
                }
              </button>
            )}
          </div>

          {assessmentMutation.isError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-500">
                Error submitting assessment. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
