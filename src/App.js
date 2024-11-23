import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

const TARGET_WEIGHT = 50;
const TOLERANCE = 0.5;
const MIN_WEIGHT = TARGET_WEIGHT - TOLERANCE;
const MAX_WEIGHT = TARGET_WEIGHT + TOLERANCE;
const INITIAL_SPOUT_DATA = {
  samples: ['', '', ''],
  average: 0,
  stdDev: 0,
  comments: '',
  action: ''
};

const INITIAL_FORM_STATE = {
  operatorName: '',
  shift: '',
  date: '',
  time: '',
  spoutData: Array(8).fill().map(() => ({ ...INITIAL_SPOUT_DATA })),
  generalComments: ''
};

const WeightInputForm = () => {
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
    return isWeightInRange(weight) ? 'bg-green-200' : 'bg-red-200';
  }, [isWeightInRange]);

  const getOutOfSpecSummary = useCallback(() => {
    const issues = formData.spoutData.reduce((acc, spout, index) => {
      if (spout.samples.some(weight => weight !== '' && !isWeightInRange(weight))) {
        acc.push(index + 1);
      }
      return acc;
    }, []);
    
    return issues.length > 0 ? (
      <Alert variant="warning" className="mb-4 p-4 rounded-lg bg-yellow-100">
        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
        <AlertDescription>
          Out of spec measurements found in Spout(s): {issues.join(', ')}
        </AlertDescription>
      </Alert>
    ) : null;
  }, [formData.spoutData, isWeightInRange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Submitted data:', formData);
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-xl p-6 bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-800">Bag Weight Check</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 p-4 bg-blue-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
          <AlertDescription>
            Target weight: {TARGET_WEIGHT.toFixed(1)} kg (±{TOLERANCE} kg). 
            Acceptable range: {MIN_WEIGHT} - {MAX_WEIGHT} kg
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Operator Name</label>
              <Input
                type="text"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleChange}
                required
                className="border-gray-300 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Shift</label>
              <Select 
                value={formData.shift} 
                onValueChange={(value) => handleChange({ target: { name: 'shift', value } })}
                className="rounded-lg border-gray-300"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="border-gray-300 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time</label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {getOutOfSpecSummary()}

          <div className="space-y-6">
            {formData.spoutData.map((spout, spoutIndex) => (
              <div key={spoutIndex} className="border p-6 rounded-lg bg-gray-50 shadow-md">
                <div className="space-y-6">
                  <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-2">
                      <span className="font-medium text-gray-800">Spout {spoutIndex + 1}</span>
                    </div>

                    <div className="col-span-6 grid grid-cols-3 gap-3">
                      {spout.samples.map((weight, sampleIndex) => (
                        <Input
                          key={sampleIndex}
                          type="number"
                          value={weight}
                          onChange={(e) => handleWeightChange(spoutIndex, sampleIndex, e.target.value)}
                          step="0.1"
                          min="0"
                          required
                          className={`rounded-lg ${getWeightColor(weight)} border-gray-300`}
                          placeholder={`Sample ${sampleIndex + 1}`}
                        />
                      ))}
                    </div>

                    <div className="col-span-2">
                      <Textarea
                        value={spout.comments}
                        onChange={(e) => handleSpoutDataChange(spoutIndex, 'comments', e.target.value)}
                        placeholder="Comments"
                        rows={3}
                        className="border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <span className="font-semibold">Avg: {spout.average} kg</span>
                    <span className="text-sm text-gray-500">SD: {spout.stdDev}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">General Comments</label>
            <Textarea
              name="generalComments"
              value={formData.generalComments}
              onChange={handleChange}
              rows={4}
              className="border-gray-300 rounded-lg"
              placeholder="Add any general comments or observations here"
            />
          </div>

          <div className="flex justify-center">
            <Button type="submit" disabled={loading} className="w-full max-w-xs">
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : 'Submit'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeightInputForm;
