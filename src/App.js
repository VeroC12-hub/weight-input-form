import React, { useState, useCallback } from 'react';
import { Scale, AlertCircle, Loader2 } from 'lucide-react';

const GOOGLE_SHEET_URL = process.env.REACT_APP_GOOGLE_SHEET_URL;
if (!GOOGLE_SHEET_URL) {
  console.warn('Google Sheet URL not found in environment variables');
}

const TARGET_WEIGHT = 50;
const TOLERANCE = 0.5;
const MIN_WEIGHT = TARGET_WEIGHT - TOLERANCE;
const MAX_WEIGHT = TARGET_WEIGHT + TOLERANCE;

const INITIAL_SPOUT_DATA = {
  samples: ['', '', ''],
  average: 0,
  stdDev: 0,
  comments: ''
};

const INITIAL_FORM_STATE = {
  operatorName: '',
  shift: '',
  date: '',
  time: '',
  spoutData: Array(8).fill().map(() => ({ ...INITIAL_SPOUT_DATA })),
  generalComments: ''
};

function App() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

  const calculateStats = useCallback((samples) => {
    const filteredSamples = samples.filter(sample => sample !== '').map(Number);
    if (filteredSamples.length === 0) return { average: 0, stdDev: 0 };

    const average = filteredSamples.reduce((a, b) => a + b, 0) / filteredSamples.length;
    const variance = filteredSamples.reduce((a, b) => a + Math.pow(b - average, 2), 0) / filteredSamples.length;
    const stdDev = Math.sqrt(variance);

    return { average: average.toFixed(1), stdDev: stdDev.toFixed(1) };
  }, []);

  const isWeightInRange = useCallback((weight) => {
    return weight !== '' && weight >= MIN_WEIGHT && weight <= MAX_WEIGHT;
  }, []);

  const getWeightColor = useCallback((weight) => {
    if (weight === '') return '';
    return isWeightInRange(weight)
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
      : 'border-red-500 focus:border-red-500 focus:ring-red-500';
  }, [isWeightInRange]);

  const handleWeightChange = useCallback((spoutIndex, sampleIndex, value) => {
    setFormData(prevData => {
      const newSpoutData = [...prevData.spoutData];
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
        ...prevData,
        spoutData: newSpoutData
      };
    });
  }, [calculateStats]);

  const handleSpoutDataChange = useCallback((spoutIndex, field, value) => {
    setFormData(prevData => {
      const newSpoutData = [...prevData.spoutData];
      newSpoutData[spoutIndex] = {
        ...newSpoutData[spoutIndex],
        [field]: value
      };

      return {
        ...prevData,
        spoutData: newSpoutData
      };
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  const formatDataForSheet = (data) => {
    const formattedData = {
      operatorName: data.operatorName,
      shift: data.shift,
      date: data.date,
      time: data.time,
      generalComments: data.generalComments,
      spouts: data.spoutData.map((spout, index) => ({
        spoutNumber: index + 1,
        samples: spout.samples,
        average: spout.average,
        stdDev: spout.stdDev,
        comments: spout.comments
      }))
    };
    return formattedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus({ success: false, message: '' });

    try {
      const formattedData = formatDataForSheet(formData);
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setSubmitStatus({
        success: true,
        message: 'Data submitted successfully!'
      });
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        success: false,
        message: 'Submission failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl p-4 md:p-8">
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* Company Logo Placeholder - Replace with your actual logo path */}
          <img
            src="/path/to/your/logo.png"  // Replace with your actual logo path
            alt="Company Logo"
            className="h-16 w-auto mb-4"
          />
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold text-blue-600">Weight Check</h1>
          </div>
          <p className="text-center text-gray-500 text-sm mt-2">Quality Control System</p>
        </div>

        {/* Target Weight Info */}
        <div className="flex items-center p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <p className="ml-3 text-sm text-blue-700">
            Target weight: <span className="font-semibold">{TARGET_WEIGHT.toFixed(1)} kg</span>
            <span className="mx-2">|</span>
            Acceptable range: <span className="font-semibold">{MIN_WEIGHT} - {MAX_WEIGHT} kg</span>
          </p>
        </div>

        {/* Submit Status Message */}
        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operator and Shift Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700">
                Operator Name
              </label>
              <input
                type="text"
                id="operatorName"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                Shift
              </label>
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>

          {/* Spout Sections */}
          <div className="space-y-6">
            {formData.spoutData.map((spout, spoutIndex) => (
              <div key={spoutIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-blue-600 mb-4">
                  Spout {spoutIndex + 1}
                </h2>

                <div className="grid grid-cols-3 gap-2 mb-2">
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
                        className={`w-full text-center rounded-md border ${getWeightColor(sample)}
                          shadow-sm focus:outline-none focus:ring-1`}
                        placeholder="Weight"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col mb-2">
                  <label className="text-xs text-gray-600 mb-1">
                    Comments
                  </label>
                  <input
                    type="text"
                    value={spout.comments}
                    onChange={(e) => handleSpoutDataChange(spoutIndex, 'comments', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="Spout comments"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Average: </span>
                    {spout.average}
                  </div>
                  <div>
                    <span className="font-medium">Std Dev: </span>
                    {spout.stdDev}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* General Comments (at the bottom) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Comments
            </label>
            <textarea
              name="generalComments"
              value={formData.generalComments}
              onChange={handleChange}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Enter any general observations..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;