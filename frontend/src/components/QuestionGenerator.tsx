import React, { useState } from 'react';
import { CompetencyLevel, Question, QuestionGenerationRequest } from '../types';
import { apiService } from '../services/api';
import QuestionList from './QuestionList';
import './QuestionGenerator.css';

interface QuestionGeneratorProps {
  subjects: string[];
  competencyLevels: CompetencyLevel[];
}

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({ subjects, competencyLevels }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const handleGenerateQuestions = async () => {
    if (!selectedSubject || !selectedLevel) {
      setError('Please select both subject and competency level');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: QuestionGenerationRequest = {
        subject: selectedSubject,
        competency_level: selectedLevel,
        num_questions: numQuestions
      };

      const response = await apiService.generateQuestions(request);
      setQuestions(response.questions);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
      console.error('Error generating questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setError(null);
    setHasGenerated(false);
  };

  const selectedLevelInfo = competencyLevels.find(level => level.value === selectedLevel);

  return (
    <div className="question-generator">
      <div className="generator-form">
        <h2>Generate Educational Questions</h2>
        
        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a subject...</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="competency-level">Competency Level:</label>
          <select
            id="competency-level"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            disabled={loading}
          >
            <option value="">Select competency level...</option>
            {competencyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {selectedLevelInfo && (
            <div className="level-description">
              <small>{selectedLevelInfo.description}</small>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="num-questions">Number of Questions:</label>
          <select
            id="num-questions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            disabled={loading}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <button
            onClick={handleGenerateQuestions}
            disabled={loading || !selectedSubject || !selectedLevel}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
          
          {hasGenerated && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="reset-btn"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating questions using AI...</p>
        </div>
      )}

      {questions.length > 0 && (
        <QuestionList 
          questions={questions}
          subject={selectedSubject}
          competencyLevel={selectedLevel}
        />
      )}
    </div>
  );
};

export default QuestionGenerator;