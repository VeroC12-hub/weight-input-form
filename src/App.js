import React from 'react';
import { useState, useCallback } from 'react';
import { Scale, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

export default function App() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const calculateStats = useCallback((samples) => {
    const validSamples = samples.filter(s => s !== '').map(Number);
    if (validSamples.length === 0) return { average: 0, stdDev: 0 };

    const average = validSamples.reduce((acc, curr) => acc + curr, 0) / validSamples.length;
    const variance = validSamples.reduce((acc, curr) => acc + Math.pow(curr - average, 2), 0) / validSamples.length;
    
    return {
      average: Number(average.toFixed(2)),
      stdDev: Number(Math.sqrt(variance).toFixed(3))
    };
  }, []);

  const isWeightInRange = useCallback((weight) => {
    const numWeight = Number(weight);
    return !isNaN(numWeight) && numWeight >= MIN_WEIGHT && numWeight <= MAX_WEIGHT;
  }, []);

  const getWeightColor = useCallback((weight) => {
    if (weight === '') return '';
    return isWeightInRange(weight) ? 'bg-green-50' : 'bg-red-50';
  }, [isWeightInRange]);

  const handleWeightChange = useCallback((spoutIndex, sampleIndex, value) => {
    setFormData(prev => {
      const newSpoutData = [...prev.spoutData];
      const newSamples = [...newSpoutData[spoutIndex].samples];
      newSamples[sampleIndex] = value;
      
      const stats = calculateStats(newSamples);
      newSpoutData[spoutIndex] = {
        ...newSpoutData[spoutIndex],
        samples: newSamples,
        ...stats
      };
      
      return { ...prev, spoutData: newSpoutData };
    });
  }, [calculateStats]);

  const handleSpoutDataChange = useCallback((spoutIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      spoutData: prev.spoutData.map((spout, index) =>
        index === spoutIndex ? { ...spout, [field]: value } : spout
      )
    }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formattedData = {
        timestamp: new Date().toISOString(),
        ...formData,
        spoutData: formData.spoutData.map((spout, index) => ({
          spoutNumber: index + 1,
          sample1: spout.samples[0],
          sample2: spout.samples[1],
          sample3: spout.samples[2],
          average: spout.average,
          stdDev: spout.stdDev,
          comments: spout.comments
        }))
      };

      const response = await fetch('YOUR_GOOGLE_SCRIPT_URL_HERE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        alert('Data submitted successfully!');
        setFormData(INITIAL_FORM_STATE);
      } else {
        throw new Error(result.message || 'Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert(`Failed to submit data: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold text-blue-600">Weight Check</h1>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm">Quality Control System</p>
        </CardHeader>

        <CardContent className="p-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator Name
                </label>
                <input
                  type="text"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <select 
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Shift</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {formData.spoutData.map((spout, spoutIndex) => (
                <Card key={spoutIndex} className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-12 md:col-span-2">
                        <div className="bg-blue-50 p-2 rounded-lg inline-block">
                          <span className="font-medium text-blue-700">Spout {spoutIndex + 1}</span>
                        </div>
                      </div>

                      <div className="col-span-12 md:col-span-6 grid grid-cols-3 gap-4">
                        {spout.samples.map((weight, sampleIndex) => (
                          <div key={sampleIndex}>
                            <label className="block text-xs text-gray-500 mb-1">
                              Sample {sampleIndex + 1}
                            </label>
                            <input
                              type="number"
                              value={weight}
                              onChange={(e) => handleWeightChange(spoutIndex, sampleIndex, e.target.value)}
                              step="0.1"
                              min="0"
                              required
                              className={`w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${getWeightColor(weight)}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="col-span-12 md:col-span-4">
                        <textarea
                          value={spout.comments}
                          onChange={(e) => handleSpoutDataChange(spoutIndex, 'comments', e.target.value)}
                          placeholder="Add comments for this spout..."
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-6 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Average:</span>
                        <span className="font-medium text-blue-600">{spout.average} kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Std Dev:</span>
                        <span className="font-medium text-purple-600">{spout.stdDev}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                General Comments
              </label>
              <textarea
                name="generalComments"
                value={formData.generalComments}
                onChange={handleChange}
                placeholder="Add any general comments or observations here..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32"
              />
            </div>

            <div className="flex justify-center pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full max-w-xs rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Submit Form'
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}