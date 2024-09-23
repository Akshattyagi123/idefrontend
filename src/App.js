import React, { useState, useEffect } from 'react';
import './App.css';
import Editor from "@monaco-editor/react";
import Navbar from './Components/Navbar';
import Axios from 'axios';
import spinner from './spinner.svg';

function App() {
  const [userCode, setUserCode] = useState(``);
  const [userLang, setUserLang] = useState("python");
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(20);
  const [userInput, setUserInput] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dsaQuestions, setDsaQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isDsaMode, setIsDsaMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const options = { fontSize };

  // Fetch DSA questions from backend
  useEffect(() => {
    setDebugInfo('Fetching questions...');
    Axios.get('http://localhost:8000/questions')
      .then((res) => {
        setDsaQuestions(res.data);
        setDebugInfo(`Fetched ${res.data.length} questions successfully`);
      })
      .catch((err) => {
        console.error('Error fetching DSA questions:', err);
        setDebugInfo(`Error fetching questions: ${err.message}`);
      });
  }, []);



  // Handle language change and update editor with corresponding template
  useEffect(() => {
    if (selectedQuestion) {
      const template = selectedQuestion.templates[userLang];
      setUserCode(template);
    }
  }, [userLang, selectedQuestion]);

  function compile() {
    setLoading(true);
    if (userCode === ``) {
      setLoading(false);
      return;
    }

    const postData = {
      code: userCode,
      language: userLang,
      input: userInput,
    };

    if (isDsaMode && selectedQuestion) {
      postData.testCases = selectedQuestion.testCases;
    }

    Axios.post(`http://localhost:8000/compile`, postData)
      .then((res) => {
        if (isDsaMode && res.data.testResults) {
          const results = res.data.testResults.map((test, idx) =>
            `Test Case ${test.testCase}: ${test.passed ? 'Passed' : 'Failed'}\nInput: ${test.input}\nExpected Output: ${test.expectedOutput}\nActual Output: ${test.actualOutput}\n\n`
          );
          setUserOutput(results.join(''));
        } else {
          setUserOutput(res.data.stdout || res.data.error || res.data.stderr);
        }
      })
      .catch((err) => {
        console.error(err);
        setUserOutput("Error: " + (err.response ? err.response.data.error : err.message));
      })
      .finally(() => setLoading(false));
  }

  function clearOutput() {
    setUserOutput("");
  }

  function toggleMode() {
    setIsDsaMode(!isDsaMode);
  }

  function toggleTheme() {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      setUserTheme(newMode ? "vs-dark" : "light");
      setDebugInfo(`Theme switched to ${newMode ? 'dark' : 'light'} mode`);
      return newMode;
    });
  }

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar
        userLang={userLang} setUserLang={setUserLang}
        userTheme={userTheme} setUserTheme={setUserTheme}
        fontSize={fontSize} setFontSize={setFontSize}
        toggleTheme={toggleTheme}
      />
      <div className="main">
        <div className="left-container">
          {isDsaMode && (
            <div className="dsa-section">
              <h2>DSA Questions</h2>
              <p>Debug Info: {debugInfo}</p>
              {dsaQuestions.length === 0 ? (
                <p>No questions loaded. {debugInfo}</p>
              ) : (
                <ul>
                  {dsaQuestions.map((question, idx) => (
                    <li key={idx} onClick={() => setSelectedQuestion(question)}>
                      {question.title}
                    </li>
                  ))}
                </ul>
              )}
              {selectedQuestion && (
                <div>
                  <h3>{selectedQuestion.title}</h3>
                  <p>{selectedQuestion.description}</p>
                  <p>Test Cases: {JSON.stringify(selectedQuestion.testCases)}</p>
                </div>
              )}
            </div>
          )}
          <Editor
            options={options}
            height="calc(100vh - 50px)"
            width="100%"
            theme={userTheme}
            language={userLang}
            value={userCode} // Set editor value to userCode
            onChange={(value) => setUserCode(value)}
          />
          <button className="run-btn" onClick={compile}>Run</button>
        </div>
        <div className="right-container">
          <h4>Input:</h4>
          <div className="input-box">
            <textarea
              id="code-inp"
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
            />
          </div>
          <h4>Output:</h4>
          {loading ? (
            <div className="spinner-box">
              <img src={spinner} alt="Loading..." />
            </div>
          ) : (
            <div className="output-box">
              <pre>{userOutput}</pre>
              <button onClick={clearOutput} className="clear-btn">Clear</button>
            </div>
          )}
        </div>
      </div>
      <button className="toggle-btn" onClick={toggleMode}>
        {isDsaMode ? "Switch to Custom Code" : "Switch to DSA Mode"}
      </button>
      <p>Current Mode: {isDsaMode ? 'DSA' : 'Custom Code'}, Theme: {isDarkMode ? 'Dark' : 'Light'}</p>
    </div>
  );
}

export default App;








