import React from 'react';
import Select from 'react-select';
import './Navbar.css';

const Navbar = ({ userLang, setUserLang, userTheme,
    setUserTheme, fontSize, setFontSize, toggleTheme }) => {
    const languages = [
        { value: "c", label: "C" },
        { value: "c++", label: "Cpp" },
        { value: "python", label: "Python" },
        { value: "javascript", label: "JavaScript" },
    ];
    const themes = [
        { value: "vs-dark", label: "Dark" },
        { value: "light", label: "Light" },
    ]
    return (
        <div className="navbar">
            <h1>Hoping Minds</h1>
            <Select options={languages} value={languages.find(lang => lang.value === userLang)}
                onChange={(e) => setUserLang(e.value)}
                placeholder={userLang} />
            <Select options={themes} value={themes.find(theme => theme.value === userTheme)}
                onChange={(e) => {
                    setUserTheme(e.value);
                    toggleTheme();
                }}
                placeholder={userTheme} />
            <label>Font Size</label>
            <input type="range" min="18" max="30"
                value={fontSize} step="2"
                onChange={(e) => { setFontSize(e.target.value) }} />
            <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
    )
}

export default Navbar;