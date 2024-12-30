// DOM Elements
const elements = {
    settingsMenu: document.getElementById('settings-menu'),
    settingsHeader: document.querySelector('.settings-header'),
    closeButton: document.querySelector('.close-button'),
    toggleMode: document.getElementById('toggle-mode'),
    writeAnswerSection: document.getElementById('write-answer-section'),
    options: document.getElementById('options'),
    question: document.getElementById('question'),
    toggleTimer: document.getElementById('toggle-timer'),
    shuffleButton: document.getElementById('shuffle-button'),
    submitAnswer: document.getElementById('submit-answer'),
    startQuiz: document.getElementById('start-quiz'),
    termsInput: document.getElementById('terms-input'),
    inputSection: document.getElementById('input-section'),
    quizSection: document.getElementById('quiz-section'),
    errorMessage: document.getElementById('error-message'),
    writeAnswer: document.getElementById('write-answer'),
    settingsIcon: document.querySelector('.settings-icon'),
    timerDisplay: document.getElementById('timer'),
    resultSection: document.getElementById('result-section'),
    score: document.getElementById('score'),
    incorrectAnswers: document.getElementById('incorrect-answers'),
    resetQuiz: document.getElementById('reset-quiz'),
    toggleCapitalization: document.getElementById('toggle-capitalization'),
    togglePunctuation: document.getElementById('toggle-punctuation'),
    toggleGrammar: document.getElementById('toggle-grammar'),
    validationSettings: document.getElementById('validation-settings'),
    switchTermsDefinitions: document.getElementById('switch-terms-definitions'),
    nextQuestion: document.getElementById('next-question'),
    languageToggle: document.getElementById('language-toggle'),
    stopQuiz: document.getElementById('stop-quiz')
};

// State management
const state = {
    isMultipleChoice: true,
    currentIndex: 0,
    terms: [], // Your terms array here
    termsAsQuestion: true,
    timer: 0,
    timerInterval: null,
    correctAnswers: 0,
    incorrectAnswers: [],
    totalQuestions: 0,
    isTimerVisible: true,
    checkCapitalization: false,
    checkPunctuation: false,
    checkGrammar: false,
    currentLanguage: 'dutch'
};

// Add this at the top of your script with other state management
const translations = {
    english: {
        title: "DUB5's Learning Platform",
        enterTerms: 'Enter terms and definitions:',
        startQuiz: 'Start Quiz',
        settings: 'Settings',
        timer: 'Timer',
        hideTimer: 'Hide Timer',
        showTimer: 'Show Timer',
        questions: 'Questions',
        shuffleQuestions: 'Shuffle Questions',
        switchTerms: 'Switch Terms & Definitions',
        validation: 'Validation',
        checkCapitalization: 'Check Capitalization',
        checkPunctuation: 'Check Punctuation',
        checkGrammar: 'Check Grammar',
        write: 'Write',
        multipleChoice: 'Multiple Choice',
        typeAnswer: 'Type your answer here',
        submitAnswer: 'Submit Answer',
        nextQuestion: 'Next Question',
        quizResults: 'Quiz Results',
        score: 'Score',
        incorrectAnswers: 'Incorrect Answers:',
        perfectScore: 'Perfect Score! 🎉',
        retakeQuiz: 'Retake Quiz',
        question: 'Question',
        yourAnswer: 'Your answer',
        correctAnswer: 'Correct answer',
        time: 'Time',
        grade: 'Grade',
        errorEmpty: 'Please enter some terms and definitions',
        errorFormat: 'Please enter terms in the correct format: term-definition, term-definition',
        errorMinTerms: 'Please enter at least 4 terms and definitions',
        placeholder: 'e.g., this-that, here-there, hat-tah'
    },
    dutch: {
        title: "DUB5's Leerplatform",
        enterTerms: 'Voer termen en definities in:',
        startQuiz: 'Start Quiz',
        settings: 'Instellingen',
        timer: 'Timer',
        hideTimer: 'Verberg Timer',
        showTimer: 'Toon Timer',
        questions: 'Vragen',
        shuffleQuestions: 'Vragen Shufflen',
        switchTerms: 'Termen en Definities omwisselen',
        validation: 'Validatie',
        checkCapitalization: 'Hoofdletters controleren',
        checkPunctuation: 'Leestekens controleren',
        checkGrammar: 'Grammatica controleren',
        write: 'Schrijven',
        multipleChoice: 'Meerkeuze',
        typeAnswer: 'Type je antwoord hier',
        submitAnswer: 'Verstuur Antwoord',
        nextQuestion: 'Volgende Vraag',
        quizResults: 'Quiz Resultaten',
        score: 'Score',
        incorrectAnswers: 'Foute Antwoorden:',
        perfectScore: 'Perfecte Score! 🎉',
        retakeQuiz: 'Opnieuw Proberen',
        question: 'Vraag',
        yourAnswer: 'Jouw antwoord',
        correctAnswer: 'Juiste antwoord',
        time: 'Tijd',
        grade: 'Cijfer',
        errorEmpty: 'Voer alstublieft termen en definities in',
        errorFormat: 'Voer termen in het juiste formaat in: term-definitie, term-definitie',
        errorMinTerms: 'Voer minimaal 4 termen en definities in',
        placeholder: 'bijv., dit-dat, hier-daar, hoed-deoh'
    }
};

// Function to update both mode toggle buttons
function updateModeButtons() {
    const lang = translations[state.currentLanguage];
    elements.toggleMode.textContent = state.isMultipleChoice ? lang.write : lang.multipleChoice;
}

// Event listener for outside toggle button
elements.toggleMode.addEventListener('click', function() {
    state.isMultipleChoice = !state.isMultipleChoice;
    
    if (state.isMultipleChoice) {
        elements.writeAnswerSection.classList.add('hidden');
        elements.options.classList.remove('hidden');
        elements.validationSettings.classList.add('hidden');
    } else {
        elements.writeAnswerSection.classList.remove('hidden');
        elements.options.classList.add('hidden');
        elements.validationSettings.classList.remove('hidden');
    }
    
    updateModeButtons();
    displayQuestion();
});


// Fix 2: Draggable settings menu
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

elements.settingsHeader.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
    // Allow dragging from both the header div and any of its children (h3 and button)
    const isHeaderOrChild = e.target === elements.settingsHeader || 
                          elements.settingsHeader.contains(e.target);
    
    // Don't initiate drag if clicking the close button
    const isCloseButton = e.target === elements.closeButton;
    
    if (isHeaderOrChild && !isCloseButton) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }
}
function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        setTranslate(currentX, currentY, elements.settingsMenu);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

function dragEnd() {
    isDragging = false;
}

// Fix 3: Close settings menu
elements.closeButton.addEventListener('click', () => {
    elements.settingsMenu.classList.add('hidden');
});

// Fix 4: Multiple choice answer handling
function displayMultipleChoice() {
    let answers = state.terms.map(t => 
        state.termsAsQuestion ? t.definition : t.term
    );

    const correctAnswer = state.termsAsQuestion
        ? state.terms[state.currentIndex].definition
        : state.terms[state.currentIndex].term;

    // If we have less than 4 terms, duplicate some answers
    while (answers.length < 4) {
        answers = [...answers, ...answers];
    }

    // Shuffle and slice to get 4 answers
    answers = answers.sort(() => Math.random() - 0.5).slice(0, 4);

    // Make sure correct answer is included
    if (!answers.includes(correctAnswer)) {
        answers[Math.floor(Math.random() * 4)] = correctAnswer;
    }

    elements.options.innerHTML = '';
    answers.forEach((answer) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.className = 'option-button';
        button.addEventListener('click', () => checkAnswer(answer));
        elements.options.appendChild(button);
    });

    elements.options.classList.remove('hidden');
    elements.writeAnswerSection.classList.add('hidden');
}

function checkAnswer(answer) {
    const correctAnswer = state.termsAsQuestion
        ? state.terms[state.currentIndex].definition
        : state.terms[state.currentIndex].term;
    
    const isCorrect = answer === correctAnswer;
    if (isCorrect) {
        state.correctAnswers++;
    } else {
        state.incorrectAnswers.push({
            question: state.terms[state.currentIndex].term,
            correctAnswer: correctAnswer,
            userAnswer: answer
        });
    }
    
    showFeedback(isCorrect);
    
    setTimeout(() => {
        if (state.currentIndex === state.terms.length - 1) {
            showResults();
        } else {
            state.currentIndex++;
            displayQuestion();
        }
    }, 1000);
}

// Fix 5: Settings menu buttons
function initializeSettingsButtons() {
    // Get current language translations
    const lang = translations[state.currentLanguage];
    
    // Set initial text for all buttons in correct language
    elements.toggleTimer.textContent = state.isTimerVisible ? lang.hideTimer : lang.showTimer;
    elements.shuffleButton.textContent = lang.shuffleQuestions;
    elements.switchTermsDefinitions.textContent = lang.switchTerms;
    
    // Timer toggle event listener
    elements.toggleTimer.addEventListener('click', function() {
        state.isTimerVisible = !state.isTimerVisible;
        elements.timerDisplay.classList.toggle('hidden', !state.isTimerVisible);
        const lang = translations[state.currentLanguage];
        this.textContent = state.isTimerVisible ? lang.hideTimer : lang.showTimer;
    });

    // Switch Terms & Definitions button
    elements.switchTermsDefinitions.addEventListener('click', function() {
        state.termsAsQuestion = !state.termsAsQuestion;
        this.classList.toggle('toggle-on');
        displayQuestion();
    });

    // Shuffle button
    elements.shuffleButton.addEventListener('click', function() {
        shuffleQuestions();
        displayQuestion(); // Add this to update the display after shuffling
    });

    // Validation toggles
    elements.toggleCapitalization.addEventListener('click', function() {
        state.checkCapitalization = !state.checkCapitalization;
        this.classList.toggle('toggle-on', state.checkCapitalization);
    });

    elements.togglePunctuation.addEventListener('click', function() {
        state.checkPunctuation = !state.checkPunctuation;
        this.classList.toggle('toggle-on', state.checkPunctuation);
    });

    elements.toggleGrammar.addEventListener('click', function() {
        state.checkGrammar = !state.checkGrammar;
        this.classList.toggle('toggle-on', state.checkGrammar);
    });
}

// Helper function to show feedback
function showFeedback(isCorrect) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = isCorrect ? '✓' : '✗';
    feedback.style.color = isCorrect ? '#00ff00' : '#ff0000';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// Initialize everything
function init() {
    // Set initial flag
    updateFlag();
    
    initializeSettingsButtons();
    updateLanguage();
    updateModeButtons();
    
    // Add language toggle event listener
    elements.languageToggle.addEventListener('click', () => {
        state.currentLanguage = state.currentLanguage === 'english' ? 'dutch' : 'english';
        updateLanguage();
        updateModeButtons();
        updateFlag();
    });

    // Load saved set if it exists
    loadSavedSet();

    // Add stop quiz functionality
    elements.stopQuiz.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('stop-quiz-popup').classList.remove('hidden');
    });

    // Update the confirm stop handler
    document.getElementById('confirm-stop').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentQuizSet');
        window.location.href = 'index.html';
    });

    // Update the cancel stop handler
    document.getElementById('cancel-stop').addEventListener('click', function() {
        document.getElementById('stop-quiz-popup').classList.add('hidden');
    });

    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        const popup = document.getElementById('stop-quiz-popup');
        if (e.target === popup) {
            popup.classList.add('hidden');
        }
    });

    // Update the home button click handler
    document.getElementById('home-button').addEventListener('click', function() {
        if (!document.getElementById('create-set-form').classList.contains('hidden')) {
            document.getElementById('stop-quiz-popup').classList.remove('hidden');
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Make sure to call init when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Display question function
function displayQuestion() {
    if (!state.terms.length) return;
    
    const currentTerm = state.terms[state.currentIndex];
    elements.question.textContent = state.termsAsQuestion 
        ? currentTerm.term 
        : currentTerm.definition;
    
    if (state.isMultipleChoice) {
        displayMultipleChoice();
    } else {
        elements.writeAnswerSection.classList.remove('hidden');
        elements.options.classList.add('hidden');
    }
}

// Add this function to parse the input terms
function parseTerms(input) {
    return input.split(',')
        .map(pair => pair.trim())
        .filter(pair => pair.includes('-'))
        .map(pair => {
            const [term, definition] = pair.split('-').map(item => item.trim());
            return { term, definition };
        });
}

// Add event listener for the start quiz button
elements.startQuiz.addEventListener('click', () => {
    const input = elements.termsInput.value.trim();
    const lang = translations[state.currentLanguage];  // Get current language translations
    
    if (!input) {
        elements.errorMessage.textContent = lang.errorEmpty;
        elements.errorMessage.classList.remove('hidden');
        return;
    }

    state.terms = parseTerms(input);
    
    if (state.terms.length === 0) {
        elements.errorMessage.textContent = lang.errorFormat;
        elements.errorMessage.classList.remove('hidden');
        return;
    }

    // Add check for minimum number of terms
    if (state.terms.length < 4) {
        elements.errorMessage.textContent = lang.errorMinTerms;
        elements.errorMessage.classList.remove('hidden');
        return;
    }

    // Hide input section and show quiz section
    elements.inputSection.classList.add('hidden');
    elements.quizSection.classList.remove('hidden');
    elements.errorMessage.classList.add('hidden');
    elements.resultSection.classList.add('hidden');

    // Reset quiz state
    state.correctAnswers = 0;
    state.incorrectAnswers = [];
    state.currentIndex = 0;
    state.isMultipleChoice = true;
    
    // Add this line to hide validation settings initially
    elements.validationSettings.classList.add('hidden');
    
    startTimer();
    displayQuestion();
});

// Handle Enter key in write mode
elements.writeAnswer.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        elements.submitAnswer.click(); // Simulate click on submit button
    }
});

// Add submit answer functionality if it's not already there
elements.submitAnswer.addEventListener('click', function() {
    const userAnswer = elements.writeAnswer.value.trim();
    const correctAnswer = state.termsAsQuestion
        ? state.terms[state.currentIndex].definition
        : state.terms[state.currentIndex].term;
    
    const isCorrect = checkWrittenAnswer(userAnswer, correctAnswer);
    if (isCorrect) {
        state.correctAnswers++;
    } else {
        state.incorrectAnswers.push({
            question: state.terms[state.currentIndex].term,
            correctAnswer: correctAnswer,
            userAnswer: userAnswer
        });
    }
    
    showFeedback(isCorrect);
    elements.writeAnswer.value = '';
    
    setTimeout(() => {
        if (state.currentIndex === state.terms.length - 1) {
            showResults();
        } else {
            state.currentIndex++;
            displayQuestion();
        }
    }, 1000);
});

// Add settings icon click handler
elements.settingsIcon.addEventListener('click', () => {
    elements.settingsMenu.classList.remove('hidden');
});

// Timer functions
function startTimer() {
    state.timer = 0;
    state.timerInterval = setInterval(() => {
        state.timer++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timer / 60);
    const seconds = state.timer % 60;
    elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Add results display function
function showResults() {
    stopTimer();
    elements.quizSection.classList.add('hidden');
    elements.resultSection.classList.remove('hidden');
    
    const totalQuestions = state.terms.length;
    // Calculate Dutch grade (1-10) with one decimal
    const grade = Math.max(1, Math.round((state.correctAnswers / totalQuestions * 9 + 1) * 10) / 10);
    const minutes = Math.floor(state.timer / 60);
    const seconds = state.timer % 60;
    
    elements.score.textContent = 
        `Score: ${state.correctAnswers}/${totalQuestions} (Grade: ${grade})\n` +
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (state.incorrectAnswers.length > 0) {
        elements.incorrectAnswers.innerHTML = '<h3>Incorrect Answers:</h3>' +
            state.incorrectAnswers.map(item => 
                `<p>
                    <span class="answer-item">Question: ${item.question}</span>
                    <span class="answer-item">Your answer: ${item.userAnswer}</span>
                    <span class="answer-item">Correct answer: ${item.correctAnswer}</span>
                </p>`
            ).join('');
    } else {
        elements.incorrectAnswers.innerHTML = '<h3>Perfect Score! 🎉</h3>';
    }
}

// Add this function to restart the quiz with existing terms
function retakeQuiz() {
    // Reset quiz state
    state.correctAnswers = 0;
    state.incorrectAnswers = [];
    state.currentIndex = 0;
    state.isMultipleChoice = true;
    
    // Hide results and show quiz section
    elements.resultSection.classList.add('hidden');
    elements.quizSection.classList.remove('hidden');
    
    // Shuffle the terms for a new order
    state.terms = state.terms.sort(() => Math.random() - 0.5);
    
    // Start timer and display first question
    startTimer();
    displayQuestion();
}

// Add event listener for the retake quiz button
elements.resetQuiz.addEventListener('click', retakeQuiz);

// Quiz mode toggle
elements.toggleQuizMode.addEventListener('click', function() {
    // Toggle the mode
    state.isMultipleChoice = !state.isMultipleChoice;
    
    // Update both button texts
    this.textContent = state.isMultipleChoice ? "Write Mode" : "Multiple Choice Mode";
    elements.toggleMode.textContent = state.isMultipleChoice ? "Write" : "Multiple Choice";
    
    // Switch the UI mode
    if (state.isMultipleChoice) {
        elements.writeAnswerSection.classList.add('hidden');
        elements.options.classList.remove('hidden');
        elements.validationSettings.classList.add('hidden');
    } else {
        elements.writeAnswerSection.classList.remove('hidden');
        elements.options.classList.add('hidden');
        elements.validationSettings.classList.remove('hidden');
    }
});

// Add this function to check written answers with validation settings
function checkWrittenAnswer(userAnswer, correctAnswer) {
    if (!state.checkCapitalization) {
        userAnswer = userAnswer.toLowerCase();
        correctAnswer = correctAnswer.toLowerCase();
    }
    
    if (!state.checkPunctuation) {
        userAnswer = userAnswer.replace(/[.,!?:"""''()\-_]/g, '');
        correctAnswer = correctAnswer.replace(/[.,!?:"""''()\-_]/g, '');
    }
    
    if (!state.checkGrammar) {
        // Remove diacritics and special characters
        userAnswer = userAnswer.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        correctAnswer = correctAnswer.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    return userAnswer.trim() === correctAnswer.trim();
}

// Add event listener for switching terms and definitions
elements.switchTermsDefinitions.addEventListener('click', function() {
    // Toggle the state
    state.termsAsQuestion = !state.termsAsQuestion;
    
    // Toggle the button appearance
    this.classList.toggle('toggle-on');
    
    // Update the current question
    displayQuestion();
});

// Add shuffle function
function shuffleQuestions() {
    // Create a copy of the terms array and shuffle it
    state.terms = state.terms.sort(() => Math.random() - 0.5);
    
    // Reset to the first question
    state.currentIndex = 0;
    
    // Update display
    displayQuestion();
}

// Add event listener for shuffle button
elements.shuffleButton.addEventListener('click', function() {
    shuffleQuestions();
    
    // Visual feedback that shuffle happened
    this.classList.add('toggle-on');
    setTimeout(() => {
        this.classList.remove('toggle-on');
    }, 500);
});

// Add this function to handle language switching
function updateLanguage() {
    console.log('updateLanguage called');
    console.log('Current language:', state.currentLanguage);
    
    const lang = translations[state.currentLanguage];
    console.log('Translations:', lang);
    
    try {
        // Update all text elements
        document.querySelector('h1').textContent = lang.title;
        document.querySelector('label[for="terms-input"]').textContent = lang.enterTerms;
        elements.termsInput.placeholder = lang.placeholder;
        elements.startQuiz.textContent = lang.startQuiz;
        
        // Update settings text and headers
        document.querySelector('.settings-header h3').textContent = lang.settings;
        document.querySelector('.settings-group h4:nth-of-type(1)').textContent = lang.timer;
        document.querySelector('.settings-group h4:nth-of-type(2)').textContent = lang.questions;
        document.querySelector('#validation-settings h4').textContent = lang.validation;
        
        // Update timer button text based on current state
        elements.toggleTimer.textContent = state.isTimerVisible ? lang.hideTimer : lang.showTimer;
        elements.shuffleButton.textContent = lang.shuffleQuestions;
        elements.switchTermsDefinitions.textContent = lang.switchTerms;
        elements.toggleCapitalization.textContent = lang.checkCapitalization;
        elements.togglePunctuation.textContent = lang.checkPunctuation;
        elements.toggleGrammar.textContent = lang.checkGrammar;
        
        // Update quiz interface - Fixed the Write/Schrijven button translation
        elements.toggleMode.textContent = state.isMultipleChoice ? lang.write : lang.multipleChoice;
        elements.writeAnswer.placeholder = lang.typeAnswer;
        elements.submitAnswer.textContent = lang.submitAnswer;
        
        // Update the flag
        updateFlag();
        
        console.log('Language update completed successfully');
    } catch (error) {
        console.error('Error updating language:', error);
    }
}

// Add this function to update results text
function updateResults() {
    const lang = translations[state.currentLanguage];
    const totalQuestions = state.terms.length;
    const grade = Math.max(1, Math.round((state.correctAnswers / totalQuestions * 9 + 1) * 10) / 10);
    const minutes = Math.floor(state.timer / 60);
    const seconds = state.timer % 60;
    
    elements.score.textContent = 
        `${lang.score}: ${state.correctAnswers}/${totalQuestions} (${lang.grade}: ${grade})\n` +
        `${lang.time}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (state.incorrectAnswers.length > 0) {
        elements.incorrectAnswers.innerHTML = `<h3>${lang.incorrectAnswers}</h3>` +
            state.incorrectAnswers.map(item => 
                `<p>
                    <span class="answer-item">${lang.question}: ${item.question}</span>
                    <span class="answer-item">${lang.yourAnswer}: ${item.userAnswer}</span>
                    <span class="answer-item">${lang.correctAnswer}: ${item.correctAnswer}</span>
                </p>`
            ).join('');
    } else {
        elements.incorrectAnswers.innerHTML = `<h3>${lang.perfectScore}</h3>`;
    }
}

function updateFlag() {
    const flagContainer = document.querySelector('.flag-stripes');
    if (state.currentLanguage === 'english') {
        // Show Dutch flag when in English mode (to switch to Dutch)
        flagContainer.innerHTML = `
            <div class="red-stripe"></div>
            <div class="white-stripe"></div>
            <div class="blue-stripe"></div>
        `;
    } else {
        // Show English (UK) flag when in Dutch mode (to switch to English)
        flagContainer.innerHTML = `<div class="uk-flag"></div>`;
    }
}

// Load saved set
function loadSavedSet() {
    const savedSet = JSON.parse(localStorage.getItem('currentQuizSet'));
    if (savedSet) {
        // Convert the saved terms into the format expected by the quiz
        state.terms = savedSet.terms;
        state.totalQuestions = savedSet.terms.length;
        
        // Hide input section and show quiz section
        elements.inputSection.classList.add('hidden');
        elements.quizSection.classList.remove('hidden');
        elements.errorMessage.classList.add('hidden');
        elements.resultSection.classList.add('hidden');

        // Reset quiz state
        state.correctAnswers = 0;
        state.incorrectAnswers = [];
        state.currentIndex = 0;
        state.isMultipleChoice = true;
        
        // Start the quiz
        startTimer();
        displayQuestion();
    }
}

// Add a back button to return to homepage
const backToHome = document.createElement('button');
backToHome.textContent = '← Back to Sets';
backToHome.className = 'back-to-home';
backToHome.addEventListener('click', () => {
    // Clear the current quiz set when going back
    localStorage.removeItem('currentQuizSet');
    window.location.href = 'index.html';
});
document.querySelector('.container').prepend(backToHome);