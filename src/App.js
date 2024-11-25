import React from 'react';
import { useState, useCallback } from 'react';
import { Scale, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

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
    // Logic to calculate average and standard deviation remains the same
  }, []);

  const isWeightInRange = useCallback((weight) => {
    // Logic to check if weight is in range remains the same
  }, []);

  const getWeightColor = useCallback((weight) => {
    // Logic to get weight color remains the same
  }, [isWeightInRange]);

  const handleWeightChange = useCallback((spoutIndex, sampleIndex, value) => {
    // Logic to handle weight change remains the same
  }, [calculateStats]);

  const handleSpoutDataChange = useCallback((spoutIndex, field, value) => {
    // Logic to handle spout data change remains the same
  }, []);

  const handleChange = useCallback((e) => {
    // Logic to handle form field changes remains the same
  }, []);

  const formatDataForSheet = (data) => {
    // Logic to format data for Google Sheet remains the same
  };

  const handleSubmit = async (e) => {
    // Logic to handle form submission remains the same
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Card className="mx-auto max-w-6xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/api/placeholder/100/50"
              alt="Company Logo" 
              className="h-12 w-auto"
            />
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-blue-600">Weight Check</CardTitle>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm">Quality Control System</p>
        </CardHeader>

        <CardContent className="p-6">
          {submitStatus.message && (
            <div 
              className={`mb-4 p-4 rounded-lg ${
                submitStatus.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <div className="flex items-center p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <p className="ml-3 text-sm text-blue-700">
              Target weight: <span className="font-semibold">{TARGET_WEIGHT.toFixed(1)} kg</span>
              <span className="mx-2">|</span>
              Acceptable range: <span className="font-semibold">{MIN_WEIGHT} - {MAX_WEIGHT} kg</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Operator Name</label>
                <input
                  type="text"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select Shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-6">
              {formData.spoutData.map((spout, spoutIndex) => (
                <div key={spoutIndex} className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Spout {spoutIndex + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {spout.samples.map((sample, sampleIndex) => (
                      <div key={sampleIndex}>
                        <label className="block text-sm font-medium text-gray-700">
                          Sample {sampleIndex + 1}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={sample}
                          onChange={(e) => handleWeightChange(spoutIndex, sampleIndex, e.target.value)}
                          className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 ${getWeightColor(sample)}`}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comments</label>
                      <textarea
                        value={spout.comments}
                        onChange={(e) => handleSpoutDataChange(spoutIndex, 'comments', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Average: {spout.average} | Standard Deviation: {spout.stdDev}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">General Comments</label>
              <textarea
                name="generalComments"
                value={formData.generalComments}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;