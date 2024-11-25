import React from 'react';
import { useState, useCallback } from 'react';
import { Scale, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Environmental variables
const GOOGLE_SHEET_URL = process.env.REACT_APP_GOOGLE_SHEET_URL || "https://script.google.com/macros/s/AKfycby7OHQbsWP1bHC7iWrWFvs8umUq3TpMee-Yk9v3iddvrQ03gehFtjwl635ntA-ufEdj/exec";
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

  const formatDataForSheet = (data) => {
    const formattedData = [];
    data.spoutData.forEach((spout, index) => {
      formattedData.push([
        new Date().toISOString(),
        data.operatorName,
        data.shift,
        data.date,
        data.time,
        index + 1,
        spout.samples[0],
        spout.samples[1],
        spout.samples[2],
        spout.average,
        spout.stdDev,
        spout.comments,
        data.generalComments
      ]);
    });
    return formattedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus({ success: false, message: '' });

    try {
      const formattedData = formatDataForSheet(formData);
      
      // Create a hidden form for submission
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SHEET_URL;
      form.target = '_blank'; // This will open response in new tab
      
      // Add the data as a hidden input
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify(formattedData);
      form.appendChild(input);
      
      // Add form to body, submit it, and remove it
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setSubmitStatus({
        success: true,
        message: 'Data submitted successfully!'
      });
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmitStatus({
        success: false,
        message: 'Error submitting data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same...
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
            {/* Form fields remain the same... */}
            {/* The rest of your form JSX remains unchanged */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;