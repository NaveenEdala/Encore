import React, { useState } from 'react';
import { Question } from '../types';
import './QuestionList.css';

interface QuestionListProps {
  questions: Question[];
  subject: string;
  competencyLevel: string;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, subject, competencyLevel }) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleShowAnswer = (index: number) => {
    const newShowAnswers = new Set(showAnswers);
    if (newShowAnswers.has(index)) {
      newShowAnswers.delete(index);
    } else {
      newShowAnswers.add(index);
    }
    setShowAnswers(newShowAnswers);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '🔘';
      case 'short_answer':
        return '✏️';
      case 'essay':
        return '📝';
      default:
        return '❓';
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'short_answer':
        return 'Short Answer';
      case 'essay':
        return 'Essay';
      default:
        return 'Question';
    }
  };

  return (
    <div className="question-list">
      <div className="list-header">
        <h3>Generated Questions</h3>
        <div className="list-meta">
          <span className="subject-tag">{subject}</span>
          <span className="level-tag">{competencyLevel}</span>
          <span className="count-tag">{questions.length} questions</span>
        </div>
      </div>

      <div className="questions-container">
        {questions.map((question, index) => (
          <div key={index} className="question-card">
            <div className="question-header">
              <div className="question-meta">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-type">
                  {getQuestionTypeIcon(question.type)} {getQuestionTypeLabel(question.type)}
                </span>
              </div>
              <button
                className="expand-btn"
                onClick={() => toggleExpanded(index)}
                aria-label={expandedQuestions.has(index) ? 'Collapse' : 'Expand'}
              >
                {expandedQuestions.has(index) ? '▼' : '▶'}
              </button>
            </div>

            <div className="question-content">
              <p className="question-text">{question.question}</p>

              {question.type === 'multiple_choice' && question.options && (
                <div className="multiple-choice-options">
                  <ul>
                    {question.options.map((option, optionIndex) => (
                      <li key={optionIndex} className="option">
                        <span className="option-letter">
                          {String.fromCharCode(97 + optionIndex).toUpperCase()})
                        </span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {expandedQuestions.has(index) && (
                <div className="question-details">
                  <div className="answer-section">
                    <button
                      className="show-answer-btn"
                      onClick={() => toggleShowAnswer(index)}
                    >
                      {showAnswers.has(index) ? 'Hide Answer' : 'Show Answer'}
                    </button>

                    {showAnswers.has(index) && (
                      <div className="answer-content">
                        <div className="correct-answer">
                          <strong>Answer:</strong> {question.correct_answer}
                        </div>
                        {question.explanation && (
                          <div className="explanation">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="list-actions">
        <button
          className="export-btn"
          onClick={() => {
            const questionsText = questions.map((q, i) => 
              `Question ${i + 1}: ${q.question}\nAnswer: ${q.correct_answer}\n\n`
            ).join('');
            
            const blob = new Blob([questionsText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${subject}_${competencyLevel}_questions.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          📄 Export Questions
        </button>
      </div>
    </div>
  );
};

export default QuestionList;