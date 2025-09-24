import React, { useState, useEffect } from 'react';
import './App.css';
import QuestionGenerator from './components/QuestionGenerator';
import { CompetencyLevel } from './types';
import { apiService } from './services/api';

function App() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [competencyLevels, setCompetencyLevels] = useState<CompetencyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [subjectsData, levelsData] = await Promise.all([
          apiService.getSubjects(),
          apiService.getCompetencyLevels()
        ]);
        
        setSubjects(subjectsData.subjects);
        setCompetencyLevels(levelsData.levels);
      } catch (err) {
        setError('Failed to load initial data. Please check if the backend is running.');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading EdTech Application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 Encore EdTech</h1>
        <p>AI-Powered Question Generation Platform</p>
      </header>
      
      <main className="App-main">
        <QuestionGenerator 
          subjects={subjects}
          competencyLevels={competencyLevels}
        />
      </main>
      
      <footer className="App-footer">
        <p>&copy; 2024 Encore EdTech - Powered by AI</p>
      </footer>
    </div>
  );
}

export default App;
