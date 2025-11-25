
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Multi-step survey questions
const surveyQuestions = [
{
  id: 1,
  title: "What's your age range?",
  subtitle: "Choose one option",
  type: "single",
  options: ["18-24", "25-34", "35-44", "45+"]
},
{
  id: 2,
  title: "What's your typical budget for events?",
  subtitle: "Choose one option",
  type: "single",
  options: ["Free events only", "Under $25", "$25-75", "$75+"]
},
{
  id: 3,
  title: "What type of events do you usually enjoy?",
  subtitle: "Select all that apply",
  type: "multiple",
  options: [
  "Live Music & Concerts",
  "Art Galleries & Exhibitions",
  "Food & Drink Experiences",
  "Wellness & Fitness",
  "Parties & Nightlife",
  "Networking & Professional",
  "Tech & Innovation",
  "Outdoor Activities"]

},
{
  id: 4,
  title: "What's your ideal event atmosphere?",
  subtitle: "Choose one option",
  type: "single",
  options: [
  "Small & Intimate (under 50 people)",
  "Social & Interactive (50-200 people)",
  "Big Crowds & Energy (200+ people)",
  "Exclusive & Premium"]

},
{
  id: 5,
  title: "When do you prefer to attend events?",
  subtitle: "Select all that apply",
  type: "multiple",
  options: [
  "Morning (6AM - 12PM)",
  "Afternoon (12PM - 6PM)",
  "Evening (6PM - 10PM)",
  "Late Night (10PM+)"]

},
{
  id: 6,
  title: "What draws you to an event?",
  subtitle: "Select all that apply",
  type: "multiple",
  options: [
  "Learning Something New",
  "Meeting New People",
  "Relaxation & Escape",
  "Adventure & Excitement",
  "Creative Expression",
  "Exclusive Access"]

},
{
  id: 7,
  title: "How do you like to discover events?",
  subtitle: "Choose one option",
  type: "single",
  options: [
  "Through Friends & Word of Mouth",
  "Curated Recommendations",
  "What's Popular & Trending",
  "Hidden Gems & Unique Finds"]

}];


export default function VibeSurvey() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
        navigate(createPageUrl("Profile"));
      }
    };
    loadUser();
  }, [navigate]);

  const handleAnswer = (questionId, answer) => {
    const question = surveyQuestions[currentStep];

    if (question.type === 'multiple') {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(answer) ?
      currentAnswers.filter((a) => a !== answer) :
      [...currentAnswers, answer];

      setAnswers((prev) => ({
        ...prev,
        [questionId]: newAnswers
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < surveyQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert survey answers to vibe tags
      const allAnswers = Object.values(answers).flat();
      const vibeTags = allAnswers.map((answer) =>
      answer.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
      ).filter((tag) => tag.length > 0);

      await User.updateMyUserData({
        vibe_tags: vibeTags.slice(0, 20), // Limit to 20 tags
        has_taken_vibe_survey: true,
        ai_recommendations_enabled: true
      });

      navigate(createPageUrl('SettingsRecommendations'));
    } catch (error) {
      console.error("Error saving survey results:", error);
      alert("Failed to save your preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  const currentQuestion = surveyQuestions[currentStep];
  const currentAnswers = answers[currentQuestion.id] || (currentQuestion.type === 'multiple' ? [] : null);
  const canProceed = currentQuestion.type === 'multiple' ?
  currentAnswers.length > 0 :
  currentAnswers !== null;

  const progressPercentage = Math.round((currentStep + 1) / surveyQuestions.length * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-gray-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="p-8">
          <div className="flex items-start">
            <Link to={createPageUrl("SettingsRecommendations")} className="p-1 rounded-full hover:bg-gray-100 mt-1 mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Initial Survey</h1>
              </div>
              <p className="text-gray-500 mt-1 ml-2">Help us understand your event preferences</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Question {currentStep + 1} of {surveyQuestions.length}</span>
            <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }} />

          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentQuestion.title}</h2>
            <p className="text-gray-500 mb-6">{currentQuestion.subtitle}</p>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.type === 'multiple' ?
                currentAnswers.includes(option) :
                currentAnswers === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    isSelected ?
                    'border-blue-600 bg-blue-50 text-blue-900' :
                    'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`
                    }>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                    </div>
                  </button>);

              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="p-6 bg-gray-50 flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline" className="bg-background pt-2 pr-2 pb-2 pl-2 text-sm font-medium justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10 flex items-center gap-2">


            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || loading} className="bg-gradient-to-r text-white ml-10 px-3 py-2 text-sm font-medium justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 from-cyan-500 to-blue-600 flex items-center gap-2">


            {loading ?
            <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </> :
            currentStep === surveyQuestions.length - 1 ?
            <>
                Complete Survey
                <Sparkles className="w-4 h-4" />
              </> :

            <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            }
          </Button>
        </div>
      </motion.div>
    </div>);

}