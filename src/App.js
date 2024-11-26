import React, { useState, useCallback, useMemo } from 'react';
import { Scale, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Configuration constants
const CONFIG = {
  TARGET_WEIGHT: 50,
  WEIGHT_TOLERANCE: 0.5,
  NUM_SPOUTS: 8,
  NUM_SAMPLES_PER_SPOUT: 3,
  COMPANY_LOGO: '/company_logo.png' // Updated to use relative path from public folder
};

const INITIAL_SPOUT_DATA = {
  samples: Array(CONFIG.NUM_SAMPLES_PER_SPOUT).fill(''),
  average: 0,
  stdDev: 0,
  comments: ''
};

const INITIAL_FORM_STATE = {
  operatorName: '',
  shift: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  spoutData: Array(CONFIG.NUM_SPOUTS).fill().map(() => ({ ...INITIAL_SPOUT_DATA })),
  generalComments: ''
};

function WeightCheckForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitStatus, setSubmitStatus] = useState({ 
    success: null, 
    message: '' 
  });

  // Memoized calculations
  const calculateStats = useCallback((samples) => {
    const filteredSamples = samples
      .filter(sample => sample !== '')
      .map(Number);

    if (filteredSamples.length === 0) {
      return { average: '0.0', stdDev: '0.0' };
    }

    const average = filteredSamples.reduce((a, b) => a + b, 0) / filteredSamples.length;
    const variance = filteredSamples.reduce((a, b) => a + Math.pow(b - average, 2), 0) / filteredSamples.length;
    
    return { 
      average: average.toFixed(1), 
      stdDev: Math.sqrt(variance).toFixed(1) 
    };
  }, []);

  // Weight validation helpers
  const weightValidationHelpers = useMemo(() => {
    const minWeight = CONFIG.TARGET_WEIGHT - CONFIG.WEIGHT_TOLERANCE;
    const maxWeight = CONFIG.TARGET_WEIGHT + CONFIG.WEIGHT_TOLERANCE;

    return {
      isWeightInRange: (weight) => {
        return weight !== '' && 
               !isNaN(parseFloat(weight)) && 
               parseFloat(weight) >= minWeight && 
               parseFloat(weight) <= maxWeight;
      },
      getWeightColor: (weight) => {
        if (weight === '') return '';
        return weightValidationHelpers.isWeightInRange(weight)
          ? 'border-green-500 text-green-700'
          : 'border-red-500 text-red-700';
      },
      minWeight,
      maxWeight
    };
  }, []);

  // Event Handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleWeightChange = useCallback((spoutIndex, sampleIndex, value) => {
    setFormData(prev => {
      const newSpoutData = [...prev.spoutData];
      newSpoutData[spoutIndex] = {
        ...newSpoutData[spoutIndex],
        samples: newSpoutData[spoutIndex].samples.map((sample, index) =>
          index === sampleIndex ? value : sample
        )
      };

      const { average, stdDev } = calculateStats(newSpoutData[spoutIndex].samples);
      newSpoutData[spoutIndex].average = average;
      newSpoutData[spoutIndex].stdDev = stdDev;

      return {
        ...prev,
        spoutData: newSpoutData
      };
    });
  }, [calculateStats]);

  const handleSpoutCommentChange = useCallback((spoutIndex, value) => {
    setFormData(prev => {
      const newSpoutData = [...prev.spoutData];
      newSpoutData[spoutIndex].comments = value;
      return {
        ...prev,
        spoutData: newSpoutData
      };
    });
  }, []);

  // Submission Logic
  const formatDataForSubmission = useCallback((data) => ({
    metadata: {
      operatorName: data.operatorName,
      shift: data.shift,
      date: data.date,
      time: data.time,
      generalComments: data.generalComments
    },
    spouts: data.spoutData.map((spout, index) => ({
      spoutNumber: index + 1,
      samples: spout.samples,
      average: spout.average,
      stdDev: spout.stdDev,
      comments: spout.comments
    }))
  }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus({ success: null, message: '' });

    try {
      // Basic validation
      if (!formData.operatorName.trim()) {
        throw new Error('Operator name is required');
      }

      const formattedData = formatDataForSubmission(formData);
      
      // Simulated submission - replace with actual Google Sheet URL
      const response = await fetch(process.env.REACT_APP_GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();

      setSubmitStatus({
        success: true,
        message: 'Data submitted successfully!'
      });
      
      // Reset form
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        success: false,
        message: error.message || 'Submission failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl p-6">
        {/* Company Logo Section */}
        <div className="flex justify-center mb-6">
          {CONFIG.COMPANY_LOGO ? (
            <img 
              src={CONFIG.COMPANY_LOGO} 
              alt="Company Logo" 
              className="max-h-20 object-contain mb-4"
            />
          ) : (
            <div className="text-center mb-4">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No logo configured</p>
            </div>
          )}
        </div>

        {/* Rest of the component remains the same as in the original code */}
        <header className="text-center mb-6">
          <div className="flex justify-center items-center mb-4">
            <Scale className="h-8 w-8 text-blue-500 mr-2" />
            <h1 className="text-2xl font-bold text-blue-600">
              Weight Control System
            </h1>
          </div>
          <p className="text-gray-500">
            Target Weight: {CONFIG.TARGET_WEIGHT} kg 
            | Acceptable Range: {weightValidationHelpers.minWeight} - {weightValidationHelpers.maxWeight} kg
          </p>
        </header>

        {/* Status Message */}
        {submitStatus.message && (
          <div 
            className={`
              flex items-center p-4 rounded-lg mb-4 
              ${submitStatus.success === true 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : submitStatus.success === false 
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }
            `}
          >
            {submitStatus.success === true 
              ? <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> 
              : submitStatus.success === false 
                ? <XCircle className="mr-2 h-5 w-5 text-red-500" />
                : null
            }
            {submitStatus.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operator and Shift Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-1">
                Operator Name
              </label>
              <input
                type="text"
                id="operatorName"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                Shift
              </label>
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Spout Sections */}
          <div className="space-y-4">
            {formData.spoutData.map((spout, spoutIndex) => (
              <div 
                key={spoutIndex} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Spout {spoutIndex + 1}
                </h2>

                {/* Weight Samples */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {spout.samples.map((sample, sampleIndex) => (
                    <div key={sampleIndex} className="flex flex-col">
                      <label className="text-xs text-gray-600 mb-1">
                        Sample {sampleIndex + 1}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={sample}
                        onChange={(e) => handleWeightChange(spoutIndex, sampleIndex, e.target.value)}
                        className={`
                          w-full text-center rounded-md border 
                          ${weightValidationHelpers.getWeightColor(sample)}
                          focus:outline-none focus:ring-2 focus:ring-opacity-50
                        `}
                        placeholder="Weight"
                      />
                    </div>
                  ))}
                </div>

                {/* Spout Statistics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-600">Average:</span>
                    <div className="font-semibold text-blue-600">{spout.average}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Std Dev:</span>
                    <div className="font-semibold text-blue-600">{spout.stdDev}</div>
                  </div>
                </div>

                {/* Spout Comments */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Spout Comments
                  </label>
                  <input
                    type="text"
                    value={spout.comments}
                    onChange={(e) => handleSpoutCommentChange(spoutIndex, e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional comments for this spout"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* General Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              General Comments
            </label>
            <textarea
              name="generalComments"
              value={formData.generalComments}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any general observations..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="
                flex items-center justify-center 
                px-4 py-2 bg-blue-600 text-white 
                rounded-md hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WeightCheckForm;