'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronLeft, ChevronRight, User, Heart, Activity, Dna, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import withAuth from '@/components/with-auth';
import { useAuth } from '@/hooks/use-auth';
import { saveOrderToFirestore } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { TrackOrderNav } from '@/components/track-order-nav';

interface FormData {
  // Segment 1: Contact & Scheduling
  fullName: string;
  mobileNumber: string;
  completeAddress: string;
  preferredTestDate: string;
  preferredTestTime: string;
  
  // Segment 2: Test Motivation
  motivations: string[];
  otherMotivation: string;
  
  // Segment 3: Personal & Lifestyle Data
  age: string;
  gender: string;
  sampleType: string;
  height: string;
  weight: string;
  bloodGroup: string;
  ethnicity: string;
  smoking: string;
  alcohol: string;
  exercise: string;
  medications: string;
  takingMedications: string;
  allergies: string;
  hasAllergies: string;
  sleepQuality: string;
  dietaryPreferences: string;
  stressLevel: string;
  consent: boolean;
}

const segmentTitles = [
  { title: 'Contact & Scheduling', icon: User },
  { title: 'Test Motivation', icon: Heart },
  { title: 'Personal & Lifestyle', icon: Activity },
];

function OrderPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [currentSegment, setCurrentSegment] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Segment 1
    fullName: '',
    mobileNumber: '',
    completeAddress: '',
    preferredTestDate: '',
    preferredTestTime: '',
    
    // Segment 2
    motivations: [],
    otherMotivation: '',
    
    // Segment 3
    age: '',
    gender: '',
    sampleType: '',
    height: '',
    weight: '',
    bloodGroup: '',
    ethnicity: '',
    smoking: '',
    alcohol: '',
    exercise: '',
    medications: '',
    takingMedications: '',
    allergies: '',
    hasAllergies: '',
    sleepQuality: '',
    dietaryPreferences: '',
    stressLevel: '',
    consent: false,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMotivationChange = (motivation: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      motivations: checked 
        ? [...prev.motivations, motivation]
        : prev.motivations.filter(m => m !== motivation)
    }));
  };

  const validateSegment = (segment: number): boolean => {
    switch (segment) {
      case 1:
        return !!(formData.fullName && formData.mobileNumber && formData.completeAddress && formData.preferredTestDate && formData.preferredTestTime);
      case 2:
        return formData.motivations.length > 0;
      case 3:
        return !!(formData.age && formData.gender && formData.sampleType && formData.consent);
      default:
        return false;
    }
  };

  const nextSegment = () => {
    if (validateSegment(currentSegment) && currentSegment < 3) {
      setCurrentSegment(currentSegment + 1);
    }
  };

  const prevSegment = () => {
    if (currentSegment > 1) {
      setCurrentSegment(currentSegment - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSegment(3)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'Please sign in to submit an order.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save order to Firebase Firestore
      const result = await saveOrderToFirestore(
        user.uid,
        user.email || '',
        user.displayName || user.email || 'User',
        formData
      );

      if (result.success) {
        // Store order ID in localStorage for confirmation page
        localStorage.setItem('lastOrderId', result.orderId || '');
        localStorage.setItem('orderData', JSON.stringify(formData));

        toast({
          title: 'Success!',
          description: 'Your order has been submitted successfully.',
          variant: 'default',
        });

        // Redirect to confirmation page with order ID
        router.push(`/order/confirmation?orderId=${result.orderId}`);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to submit order. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentSegment - 1) / (segmentTitles.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dna className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800 tracking-tight">LifeCare.ai</span>
            </div>
            <div className="flex items-center gap-4">
              <TrackOrderNav />
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50/80 font-semibold py-1 px-3 rounded-full">
                Order LifeSync Kit
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Tracker */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {segmentTitles.map((segment, index) => {
                const segmentNumber = index + 1;
                const isActive = segmentNumber === currentSegment;
                const isCompleted = segmentNumber < currentSegment;
                return (
                  <div key={segment.title} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                          isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? <Check size={20} /> : segmentNumber}
                      </div>
                      <p className={`mt-3 text-xs font-semibold text-center transition-colors duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                        {segment.title}
                      </p>
                    </div>
                    {segmentNumber < segmentTitles.length && (
                      <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: isCompleted ? '100%' : (isActive ? '50%' : '0%') }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progressPercentage} className="h-1 mt-4" />
          </div>

          <form onSubmit={handleSubmit}>
            <motion.div
              key={currentSegment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {/* Segment 1: Contact & Scheduling */}
              {currentSegment === 1 && (
                <Card className="overflow-hidden shadow-sm border-gray-200/80">
                  <CardHeader className="bg-gray-50/80 border-b border-gray-200/80">
                    <CardTitle className="flex items-center space-x-3 text-xl font-bold text-gray-800">
                      <User className="h-6 w-6 text-blue-600" />
                      <span>Contact & Scheduling</span>
                    </CardTitle>
                    <p className="text-gray-500 pt-1">Provide your contact details and preferred schedule.</p>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        placeholder="e.g., John Doe"
                        required
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-2">As it appears on your official documents.</p>
                    </div>

                    <div>
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(e) => updateFormData('mobileNumber', e.target.value)}
                        placeholder="+1 234 567 8900"
                        required
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-2">We'll send updates to this number (please include country code).</p>
                    </div>

                    <div>
                      <Label htmlFor="completeAddress">Complete Address</Label>
                      <Textarea
                        id="completeAddress"
                        value={formData.completeAddress}
                        onChange={(e) => updateFormData('completeAddress', e.target.value)}
                        placeholder="123 Health St, Wellness City, State 12345"
                        rows={3}
                        required
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-2">Your address for kit delivery and sample collection.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <Label htmlFor="preferredTestDate">Preferred Test Date</Label>
                        <Input
                          id="preferredTestDate"
                          type="date"
                          value={formData.preferredTestDate}
                          onChange={(e) => updateFormData('preferredTestDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredTestTime">Preferred Time Slot</Label>
                        <Select value={formData.preferredTestTime} onValueChange={(value) => updateFormData('preferredTestTime', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9am-11am">9:00 AM - 11:00 AM</SelectItem>
                            <SelectItem value="11am-1pm">11:00 AM - 1:00 PM</SelectItem>
                            <SelectItem value="2pm-4pm">2:00 PM - 4:00 PM</SelectItem>
                            <SelectItem value="4pm-6pm">4:00 PM - 6:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-6">
                      <Button 
                        type="button" 
                        onClick={nextSegment}
                        disabled={!validateSegment(1)}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        Continue
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Segment 2: Test Motivation */}
              {currentSegment === 2 && (
                <Card className="overflow-hidden shadow-sm border-gray-200/80">
                  <CardHeader className="bg-gray-50/80 border-b border-gray-200/80">
                    <CardTitle className="flex items-center space-x-3 text-xl font-bold text-gray-800">
                      <Heart className="h-6 w-6 text-blue-600" />
                      <span>Test Motivation</span>
                    </CardTitle>
                    <p className="text-gray-500 pt-1">Help us understand your reasons for this test.</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <Label className="text-base font-semibold text-gray-800">Why are you considering a genetic test today?</Label>
                      <p className="text-sm text-gray-500 -mt-4">Select all that apply.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'Family history of inherited diseases',
                          'Unexplained or unresolved health conditions',
                          'Planning for pregnancy or family',
                          'Personal interest in health & longevity',
                          'Doctor\'s recommendation',
                          'Disease risk and prevention options',
                          'Ancestry or lineage discovery',
                          'Other'
                        ].map((motivation) => (
                          <div key={motivation} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200/80 hover:border-blue-400 transition-colors duration-200">
                            <Checkbox
                              id={motivation}
                              checked={formData.motivations.includes(motivation)}
                              onCheckedChange={(checked) => handleMotivationChange(motivation, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={motivation} className="text-sm font-medium text-gray-700 cursor-pointer">
                                {motivation}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                      {formData.motivations.includes('Other') && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                          <Label htmlFor="otherMotivation">Please specify your reason</Label>
                          <Input
                            id="otherMotivation"
                            className="mt-2"
                            placeholder="Your reason..."
                            value={formData.otherMotivation}
                            onChange={(e) => updateFormData('otherMotivation', e.target.value)}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-10">
                      <Button type="button" variant="outline" onClick={prevSegment} size="lg">
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={nextSegment}
                        disabled={!validateSegment(2)}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        Continue
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Segment 3: Personal & Lifestyle Data */}
              {currentSegment === 3 && (
                <Card className="overflow-hidden shadow-sm border-gray-200/80">
                  <CardHeader className="bg-gray-50/80 border-b border-gray-200/80">
                    <CardTitle className="flex items-center space-x-3 text-xl font-bold text-gray-800">
                      <Activity className="h-6 w-6 text-blue-600" />
                      <span>Personal & Lifestyle Data</span>
                    </CardTitle>
                    <p className="text-gray-500 pt-1">This information helps us personalize your genetic analysis.</p>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    {/* Section Wrapper */}
                    <div className="space-y-6 p-6 bg-gray-50/80 rounded-lg border border-gray-200/80">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">Basic Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="age">Your Age</Label>
                          <Input
                            id="age"
                            type="number"
                            value={formData.age}
                            onChange={(e) => updateFormData('age', e.target.value)}
                            placeholder="e.g., 35"
                            min="1"
                            max="120"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Gender</Label>
                          <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6 p-6 bg-gray-50/80 rounded-lg border border-gray-200/80">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">Physical & Medical Details</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Sample Type</Label>
                          <Select value={formData.sampleType} onValueChange={(value) => updateFormData('sampleType', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Who is this test for?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="myself">Myself</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="other-family">Other family member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData('bloodGroup', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a+">A+</SelectItem>
                              <SelectItem value="a-">A-</SelectItem>
                              <SelectItem value="b+">B+</SelectItem>
                              <SelectItem value="b-">B-</SelectItem>
                              <SelectItem value="ab+">AB+</SelectItem>
                              <SelectItem value="ab-">AB-</SelectItem>
                              <SelectItem value="o+">O+</SelectItem>
                              <SelectItem value="o-">O-</SelectItem>
                              <SelectItem value="unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            value={formData.height}
                            onChange={(e) => updateFormData('height', e.target.value)}
                            placeholder={"e.g., 175 cm or 5'9\""}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight</Label>
                          <Input
                            id="weight"
                            value={formData.weight}
                            onChange={(e) => updateFormData('weight', e.target.value)}
                            placeholder="e.g., 70 kg or 154 lbs"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ethnicity">Ethnicity</Label>
                        <Input
                          id="ethnicity"
                          value={formData.ethnicity}
                          onChange={(e) => updateFormData('ethnicity', e.target.value)}
                          placeholder="e.g., Asian, Caucasian, African, Hispanic, etc."
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-2">Optional, but helps personalize analysis.</p>
                      </div>
                    </div>

                    <div className="space-y-6 p-6 bg-gray-50/80 rounded-lg border border-gray-200/80">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">Lifestyle Habits</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label>Do you smoke regularly?</Label>
                          <RadioGroup value={formData.smoking} onValueChange={(value) => updateFormData('smoking', value)} className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="smoke-yes" />
                              <Label htmlFor="smoke-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="smoke-no" />
                              <Label htmlFor="smoke-no">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label>How often do you consume alcohol?</Label>
                          <Select value={formData.alcohol} onValueChange={(value) => updateFormData('alcohol', value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never">Never</SelectItem>
                              <SelectItem value="occasionally">Occasionally</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Label>How many days per week do you exercise?</Label>
                        <Select value={formData.exercise} onValueChange={(value) => updateFormData('exercise', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select exercise frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 days</SelectItem>
                            <SelectItem value="2-3">2-3 days</SelectItem>
                            <SelectItem value="4-5">4-5 days</SelectItem>
                            <SelectItem value="6+">6+ days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6 p-6 bg-gray-50/80 rounded-lg border border-gray-200/80">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">Medical History</h3>
                      <div className="space-y-6">
                        <div>
                          <Label>Are you currently taking any regular medications?</Label>
                          <RadioGroup 
                            value={formData.takingMedications} 
                            onValueChange={(value) => updateFormData('takingMedications', value)}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="meds-yes" />
                              <Label htmlFor="meds-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="meds-no" />
                              <Label htmlFor="meds-no">No</Label>
                            </div>
                          </RadioGroup>
                          {formData.takingMedications === 'yes' && (
                            <Textarea
                              className="mt-2"
                              placeholder="Please list your medications"
                              value={formData.medications}
                              onChange={(e) => updateFormData('medications', e.target.value)}
                            />
                          )}
                        </div>
                        <div>
                          <Label>Do you have any known allergies?</Label>
                          <RadioGroup 
                            value={formData.hasAllergies} 
                            onValueChange={(value) => updateFormData('hasAllergies', value)}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="allergy-yes" />
                              <Label htmlFor="allergy-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="allergy-no" />
                              <Label htmlFor="allergy-no">No</Label>
                            </div>
                          </RadioGroup>
                          {formData.hasAllergies === 'yes' && (
                            <Textarea
                              className="mt-2"
                              placeholder="Please describe your allergies"
                              value={formData.allergies}
                              onChange={(e) => updateFormData('allergies', e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-8">
                      <div className="flex items-start space-x-4 p-4 bg-blue-50/80 border border-blue-200/80 rounded-lg">
                        <Checkbox
                          id="consent"
                          checked={formData.consent}
                          onCheckedChange={(checked) => updateFormData('consent', checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="consent" className="text-base font-medium text-gray-800 cursor-pointer">
                            I consent to my data being used for test analysis and agree to the privacy policy.
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">Your data is protected and will only be used for your genetic report.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6">
                      <Button type="button" variant="outline" onClick={prevSegment} size="lg">
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={!validateSegment(3) || isSubmitting}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="h-5 w-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Order
                            <Check className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default withAuth(OrderPage);
