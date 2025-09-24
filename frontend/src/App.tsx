import React, { useState, useEffect } from 'react';
import './App.css';
import QuestionGenerator from './components/QuestionGenerator';
import AuthPage from './components/AuthPage';
import { CompetencyLevel } from './types';
import { apiService } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [competencyLevels, setCompetencyLevels] = useState<CompetencyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [subjectsData, levelsData] = await Promise.all([
        apiService.getSubjects(),
        apiService.getCompetencyLevels()
      ]);
      
      setSubjects(subjectsData.subjects);
      setCompetencyLevels(levelsData.levels);
      setError(null);
    } catch (err) {
      setError('Failed to load initial data. Please check if the backend is running.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading EdTech Application...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Show loading state while fetching initial data
  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading application data...</p>
        </div>
      </div>
    );
  }

  // Show error state if data loading failed
  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => loadInitialData()}>Retry</button>
        </div>
      </div>
    );
  }

  // Main authenticated application
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>🎓 Encore EdTech</h1>
          <p>AI-Powered Question Generation Platform</p>
        </div>
        <div className="user-info">
          <span className="user-welcome">Welcome, {user?.name}!</span>
          <button 
            className="logout-button" 
            onClick={logout}
            title="Sign out"
          >
            Sign Out
          </button>
        </div>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
