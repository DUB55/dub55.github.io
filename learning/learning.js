// DOM Elements
const elements = {
    settingsMenu: document.querySelector('.settings-menu'),
    settingsHeader: document.querySelector('.settings-header'),
    closeButton: document.querySelector('.close-button'),
    toggleMode: document.querySelector('#toggle-mode'),
    writeAnswerSection: document.querySelector('#write-answer-section'),
    options: document.querySelector('.options-grid'),
    question: document.querySelector('#question'),
    toggleTimer: document.querySelector('#toggle-timer'),
    toggleModeSettings: document.querySelector('#toggle-mode-settings'),
    shuffleButton: document.querySelector('#shuffle-button'),
    answerInput: document.querySelector('#answer-input'),
    submitAnswer: document.querySelector('#submit-answer'),
    startQuiz: document.querySelector('#start-quiz'),
    termsInput: document.querySelector('#terms-input'),
    inputSection: document.querySelector('#input-section'),
    quizSection: document.querySelector('#quiz-section'),
    errorMessage: document.querySelector('#error-message'),
    writeAnswer: document.querySelector('#write-answer'),
    settingsIcon: document.querySelector('.settings-icon'),
    settingsMenu: document.querySelector('#settings-menu'),
    timerDisplay: document.querySelector('#timer'),
    resultSection: document.querySelector('#result-section'),
    score: document.querySelector('#score'),
    incorrectAnswers: document.querySelector('#incorrect-answers'),
    resetQuiz: document.querySelector('#reset-quiz'),
    toggleCapitalization: document.querySelector('#toggle-capitalization'),
    togglePunctuation: document.querySelector('#toggle-punctuation'),
    toggleGrammar: document.querySelector('#toggle-grammar'),
    validationSettings: document.querySelector('#validation-settings'),
    switchTermsDefinitions: document.querySelector('#switch-terms-definitions')
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
    checkGrammar: false
};

// Function to update both mode toggle buttons
function updateModeButtons() {
    elements.toggleMode.textContent = state.isMultipleChoice ? "Write" : "Multiple Choice";
    elements.toggleQuizMode.textContent = state.isMultipleChoice ? "Write Mode" : "Multiple Choice Mode";
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
    // Timer toggle
    elements.toggleTimer.addEventListener('click', function() {
        state.isTimerVisible = !state.isTimerVisible;
        elements.timerDisplay.classList.toggle('hidden', !state.isTimerVisible);
        this.textContent = state.isTimerVisible ? 'Hide Timer' : 'Show Timer';
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
    initializeSettingsButtons();
    displayQuestion();
}

// Call init when the page loads
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
    
    if (!input) {
        elements.errorMessage.textContent = 'Please enter some terms and definitions';
        elements.errorMessage.classList.remove('hidden');
        return;
    }

    state.terms = parseTerms(input);
    
    if (state.terms.length === 0) {
        elements.errorMessage.textContent = 'Please enter terms in the correct format: term-definition, term-definition';
        elements.errorMessage.classList.remove('hidden');
        return;
    }

    // Add check for minimum number of terms
    if (state.terms.length < 4) {
        elements.errorMessage.textContent = 'Please enter at least 4 terms and definitions';
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
