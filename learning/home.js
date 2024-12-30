// DOM Elements
const elements = {
    mainMenu: document.getElementById('main-menu'),
    createSetForm: document.getElementById('create-set-form'),
    setsList: document.getElementById('sets-list'),
    createSetButton: document.getElementById('create-set'),
    viewSetsButton: document.getElementById('view-sets'),
    saveSetButton: document.getElementById('save-set'),
    backToMenuButton: document.getElementById('back-to-menu'),
    backFromSetsButton: document.getElementById('back-from-sets'),
    setNameInput: document.getElementById('set-name'),
    termsInput: document.getElementById('terms-input'),
    setsContainer: document.getElementById('sets-container'),
    errorMessage: document.getElementById('error-message'),
    homeButton: document.getElementById('home-button')
};

// Event Listeners
elements.createSetButton.addEventListener('click', showCreateSetForm);
elements.viewSetsButton.addEventListener('click', showSetsList);
document.getElementById('save-set').addEventListener('click', function(e) {
    e.preventDefault();
    saveSetFromForm();
});
elements.backToMenuButton.addEventListener('click', () => {
    elements.mainMenu.classList.remove('hidden');
    elements.createSetForm.classList.add('hidden');
    elements.setsList.classList.add('hidden');
});
elements.backFromSetsButton.addEventListener('click', () => {
    showMainMenu();
});
elements.homeButton.addEventListener('click', () => {
    if (elements.createSetForm.classList.contains('hidden') === false) {
        document.getElementById('leave-page-popup').classList.remove('hidden');
    } else {
        window.location.href = 'index.html';
    }
});

// Add these event handlers
document.getElementById('confirm-leave').addEventListener('click', function() {
    window.location.href = 'index.html';
});

document.getElementById('cancel-leave').addEventListener('click', function() {
    document.getElementById('leave-page-popup').classList.add('hidden');
});

// Close popup when clicking outside
document.addEventListener('click', function(e) {
    const popup = document.getElementById('leave-page-popup');
    if (e.target === popup) {
        popup.classList.add('hidden');
    }
});

// Navigation Functions
function showMainMenu() {
    // Hide other sections
    elements.createSetForm.classList.add('hidden');
    elements.setsList.classList.add('hidden');
    
    // Show main menu and ensure buttons are visible
    elements.mainMenu.classList.remove('hidden');
    
    // Make sure the menu buttons are visible
    const createSetButton = document.getElementById('create-set');
    const viewSetsButton = document.getElementById('view-sets');
    
    if (createSetButton) {
        createSetButton.style.display = 'block';
    }
    
    if (viewSetsButton) {
        viewSetsButton.style.display = 'block';
    }
}

function showCreateSetForm() {
    if (!elements.createSetForm.classList.contains('hidden')) return;
    
    const currentView = document.querySelector('.container > div:not(.hidden)');
    pageTransition(currentView, elements.createSetForm);
    
    // Clear any existing content
    document.getElementById('terms-container').innerHTML = '';
    elements.setNameInput.value = '';
    
    // Add first term pair with animation
    setTimeout(() => {
        addTermPair(1);
    }, 300);
    
    // Initialize all event listeners
    initializeCreateSetForm();
}

function showSetsList() {
    if (!elements.setsList.classList.contains('hidden')) return;
    
    const currentView = document.querySelector('.container > div:not(.hidden)');
    pageTransition(currentView, elements.setsList);
    loadSets();
}

// Set Management Functions
function saveSetFromForm() {
    const name = elements.setNameInput.value.trim();
    const termPairs = document.querySelectorAll('.term-pair');
    const terms = [];
    const errors = [];

    if (!name) {
        errors.push('Please enter a title for your set');
        showError(errors.join('<br>'));
        return;
    }

    termPairs.forEach(pair => {
        const term = pair.querySelector('.term-input').value.trim();
        const definition = pair.querySelector('.definition-input').value.trim();

        if (term && definition) {
            terms.push({ term, definition });
        }
    });

    if (terms.length < 4) {
        errors.push(`Please enter at least 4 terms & definitions (currently: ${terms.length})`);
        showError(errors.join('<br>'));
        return;
    }

    // Create the set object
    const set = {
        id: Date.now(),
        name: name,
        terms: terms,
        created: new Date().toISOString()
    };

    try {
        // Save to localStorage
        const sets = JSON.parse(localStorage.getItem('learningSets') || '[]');
        console.log('Existing sets:', sets);
        sets.push(set);
        console.log('Sets after adding new one:', sets);
        localStorage.setItem('learningSets', JSON.stringify(sets));

        // Show success message and redirect
        showSuccess('Set saved successfully!');
        
        // Redirect to sets list view
        elements.createSetForm.classList.add('hidden');
        elements.mainMenu.classList.add('hidden');
        elements.setsList.classList.remove('hidden');
        loadSets();
    } catch (error) {
        console.error('Error saving set:', error);
        showError('Failed to save set. Please try again.');
    }
}

function parseTerms(input) {
    return input.split(',')
        .map(pair => pair.trim())
        .filter(pair => pair.includes('-'))
        .map(pair => {
            const [term, definition] = pair.split('-').map(item => item.trim());
            return { term, definition };
        });
}

function loadSets() {
    console.log('Loading sets...');
    // Clear the container first
    elements.setsContainer.innerHTML = '';
    
    const sets = JSON.parse(localStorage.getItem('learningSets') || '[]');
    console.log('Retrieved sets:', sets);

    if (sets.length === 0) {
        elements.setsContainer.innerHTML = '<p class="no-sets">No learning sets found. Create one!</p>';
        return;
    }

    // Sort sets by creation date, newest first
    const sortedSets = [...sets].sort((a, b) => new Date(b.created) - new Date(a.created));
    console.log('Sorted sets:', sortedSets);
    
    sortedSets.forEach((set, index) => {
        const setElement = document.createElement('div');
        setElement.className = 'set-card';
        setElement.innerHTML = `
            <h3>${set.name}</h3>
            <p>${set.terms.length} terms</p>
            <p class="set-date">Created: ${new Date(set.created).toLocaleDateString()}</p>
            <div class="set-menu">⋮</div>
            <div class="set-menu-dropdown">
                <div class="set-menu-item info">
                    <span>ℹ️ Set Info</span>
                </div>
                <div class="set-menu-item delete">
                    <span>🗑️ Delete</span>
                </div>
            </div>
        `;

        // Add the set element directly to the container
        elements.setsContainer.appendChild(setElement);
        console.log('Added set to wrapper:', set.name);

        // Add click handlers for the menu and its items
        const menu = setElement.querySelector('.set-menu');
        const dropdown = setElement.querySelector('.set-menu-dropdown');
        const deleteBtn = setElement.querySelector('.set-menu-item.delete');
        const infoBtn = setElement.querySelector('.set-menu-item.info');

        // Direct click handler for the entire card
        setElement.addEventListener('click', (e) => {
            // Only start quiz if not clicking menu items
            if (!e.target.closest('.set-menu') && !e.target.closest('.set-menu-dropdown')) {
                startQuiz(set.id);
            }
        });

        // Menu toggle
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Delete handler
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const popup = document.getElementById('stop-quiz-popup');
            const popupContent = popup.querySelector('.popup-content');
            const popupTitle = popup.querySelector('h3');
            const popupText = popup.querySelector('p');
            const confirmBtn = document.getElementById('confirm-stop');
            const cancelBtn = document.getElementById('cancel-stop');

            popupTitle.textContent = 'Delete Set';
            popupText.textContent = `Are you sure you want to delete "${set.name}"?`;
            confirmBtn.textContent = 'Delete';
            cancelBtn.textContent = 'Cancel';

            confirmBtn.onclick = () => {
                try {
                    const sets = JSON.parse(localStorage.getItem('learningSets') || '[]');
                    const updatedSets = sets.filter(s => s.id !== set.id);
                    localStorage.setItem('learningSets', JSON.stringify(updatedSets));
                    popup.classList.add('hidden');
                    // Remove the set element from the DOM
                    setElement.remove();
                    // If no sets left, show the "no sets" message
                    if (updatedSets.length === 0) {
                        elements.setsContainer.innerHTML = '<p class="no-sets">No learning sets found. Create one!</p>';
                    }
                } catch (error) {
                    console.error('Error deleting set:', error);
                    showError('Failed to delete set. Please try again.');
                }
            };

            cancelBtn.onclick = () => {
                popup.classList.add('hidden');
            };

            popup.classList.remove('hidden');
            dropdown.classList.remove('show');
        });

        // Info handler
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const popup = document.getElementById('stop-quiz-popup');
            const popupContent = popup.querySelector('.popup-content');
            const popupTitle = popup.querySelector('h3');
            const popupText = popup.querySelector('p');
            const confirmBtn = document.getElementById('confirm-stop');
            const cancelBtn = document.getElementById('cancel-stop');

            popupContent.classList.add('info-view');
            
            const createdDate = new Date(set.created);
            popupTitle.textContent = `Set Information: ${set.name}`;
            popupText.innerHTML = `
                <div class="set-info">
                    <div class="info-item">
                        <strong>Created:</strong> ${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}
                    </div>
                    <div class="info-item">
                        <strong>Terms & Definitions:</strong> ${set.terms.length} pairs
                    </div>
                    <div class="info-item">
                        <strong>Total Characters:</strong> ${set.terms.reduce((acc, term) => 
                            acc + term.term.length + term.definition.length, 0)}
                    </div>
                    <div class="info-item">
                        <strong>Average Term Length:</strong> ${(set.terms.reduce((acc, term) => 
                            acc + term.term.length, 0) / set.terms.length).toFixed(1)} characters
                    </div>
                    <div class="info-item">
                        <strong>Average Definition Length:</strong> ${(set.terms.reduce((acc, term) => 
                            acc + term.definition.length, 0) / set.terms.length).toFixed(1)} characters
                    </div>
                </div>
            `;

            // Hide the confirm button and update cancel button
            confirmBtn.style.display = 'none';
            cancelBtn.textContent = 'Close';

            cancelBtn.onclick = () => {
                popup.classList.add('hidden');
                popupContent.classList.remove('info-view');
                confirmBtn.style.display = 'block'; // Restore confirm button display
            };

            popup.classList.remove('hidden');
            dropdown.classList.remove('show');
        });

        window.FramerAnimations.animateSetCard(setElement, index);
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.set-menu-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });

    // Force a reflow to ensure all sets are visible
    elements.setsContainer.style.display = 'none';
    elements.setsContainer.offsetHeight; // Force reflow
    elements.setsContainer.style.display = 'block';
}

function startQuiz(setId) {
    const sets = JSON.parse(localStorage.getItem('learningSets') || '[]');
    const set = sets.find(s => s.id === setId);
    if (set) {
        localStorage.setItem('currentQuizSet', JSON.stringify(set));
        window.location.href = 'learning.html';
    } else {
        showError('Could not find the selected set');
    }
}

function deleteSet(setId) {
    // Show the popup instead of confirm
    document.getElementById('stop-quiz-popup').classList.remove('hidden');
    
    // Store the setId for later use
    const confirmStop = document.getElementById('confirm-stop');
    confirmStop.onclick = function() {
        const sets = JSON.parse(localStorage.getItem('learningSets') || '[]');
        const updatedSets = sets.filter(s => s.id !== setId);
        localStorage.setItem('learningSets', JSON.stringify(updatedSets));
        loadSets();
        document.getElementById('stop-quiz-popup').classList.add('hidden');
    };

    // Update cancel button
    const cancelStop = document.getElementById('cancel-stop');
    cancelStop.onclick = function() {
        document.getElementById('stop-quiz-popup').classList.add('hidden');
    };
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.innerHTML = message; // Changed from textContent to innerHTML to support <br>
    errorElement.classList.remove('hidden');
    
    // Scroll to error message
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add this new function for success messages
function showSuccess(message) {
    const successMessage = document.createElement('div');
    successMessage.textContent = message;
    successMessage.className = 'success-message';
    elements.mainMenu.prepend(successMessage);
    
    // Remove the success message after 2 seconds
    setTimeout(() => {
        successMessage.remove();
    }, 2000);
}

// Add the showSetInfo function
function showSetInfo(set) {
    const createdDate = new Date(set.created);
    const formattedDate = createdDate.toLocaleDateString();
    const formattedTime = createdDate.toLocaleTimeString();
    
    // Calculate additional statistics
    const totalCharacters = set.terms.reduce((acc, term) => 
        acc + term.term.length + term.definition.length, 0);
    const avgTermLength = (set.terms.reduce((acc, term) => 
        acc + term.term.length, 0) / set.terms.length).toFixed(1);
    const avgDefinitionLength = (set.terms.reduce((acc, term) => 
        acc + term.definition.length, 0) / set.terms.length).toFixed(1);

    const popup = document.getElementById('stop-quiz-popup');
    const popupContent = popup.querySelector('.popup-content');
    const popupTitle = popup.querySelector('h3');
    const popupText = popup.querySelector('p');
    const confirmBtn = document.getElementById('confirm-stop');
    const cancelBtn = document.getElementById('cancel-stop');
    
    // Add info-view class to the popup content
    popupContent.classList.add('info-view');
    
    popupTitle.textContent = `Set Information: ${set.name}`;
    popupText.innerHTML = `
        <div class="set-info">
            <div class="info-item">
                <strong>Created:</strong> ${formattedDate} at ${formattedTime}
            </div>
            <div class="info-item">
                <strong>Terms & Definitions:</strong> ${set.terms.length} pairs
            </div>
            <div class="info-item">
                <strong>Total Characters:</strong> ${totalCharacters}
            </div>
            <div class="info-item">
                <strong>Average Term Length:</strong> ${avgTermLength} characters
            </div>
            <div class="info-item">
                <strong>Average Definition Length:</strong> ${avgDefinitionLength} characters
            </div>
            <div class="info-item">
                <strong>Last Modified:</strong> ${formattedDate}
            </div>
        </div>
    `;
    
    confirmBtn.textContent = 'Start Quiz';
    cancelBtn.textContent = 'Close';
    
    // Update button handlers
    confirmBtn.onclick = () => {
        popup.classList.add('hidden');
        popupContent.classList.remove('info-view');
        startQuiz(set.id);
    };
    
    cancelBtn.onclick = () => {
        popup.classList.add('hidden');
        popupContent.classList.remove('info-view');
    };
    
    // Show the popup
    popup.classList.remove('hidden');
}

// Add these functions to handle the new create set interface
function initializeCreateSetForm() {
    // Plus icon functionality
    const addTermBtn = document.querySelector('.add-term-icon');
    addTermBtn.addEventListener('click', () => {
        const termsContainer = document.getElementById('terms-container');
        const termCount = termsContainer.children.length + 1;
        addTermPair(termCount);
        setTimeout(() => {
            const newTerm = termsContainer.lastElementChild;
            newTerm.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    });

    // Import functionality
    const importBtn = document.getElementById('import-terms-btn');
    const importModal = document.getElementById('import-modal');
    const confirmImport = document.getElementById('confirm-import');
    const cancelImport = document.getElementById('cancel-import');

    importBtn.addEventListener('click', () => {
        importModal.classList.remove('hidden');
    });

    confirmImport.addEventListener('click', () => {
        const importInput = document.getElementById('import-terms-input');
        const terms = parseImportedTerms(importInput.value);
        
        if (terms.length === 0) {
            showError('Please enter valid terms and definitions');
            return;
        }

        const termsContainer = document.getElementById('terms-container');
        termsContainer.innerHTML = '';
        
        // Add each term pair with proper animation timing
        terms.forEach((term, index) => {
            setTimeout(() => {
                addTermPair(index + 1, term.term, term.definition);
            }, index * 300); // Stagger the animations
        });

        importModal.classList.add('hidden');
        importInput.value = '';
    });

    cancelImport.addEventListener('click', () => {
        importModal.classList.add('hidden');
        document.getElementById('import-terms-input').value = '';
    });

    // Save functionality
    const saveBtn = document.getElementById('save-set');
    saveBtn.addEventListener('click', saveSetFromForm);
}

function addTermPair(number, term = '', definition = '') {
    const termPair = document.createElement('div');
    termPair.className = 'term-pair';
    termPair.innerHTML = `
        <div class="term-number">${number}</div>
        <div class="term-inputs">
            <input type="text" class="term-input" placeholder="Enter term" value="${term}">
            <input type="text" class="definition-input" placeholder="Enter definition" value="${definition}">
            <button class="remove-term">×</button>
        </div>
    `;

    // Add remove button functionality
    termPair.querySelector('.remove-term').addEventListener('click', () => {
        termPair.remove();
        updateTermNumbers();
    });

    document.getElementById('terms-container').appendChild(termPair);
    window.FramerAnimations.animateTermPair(termPair);
}

function updateTermNumbers() {
    const termPairs = document.querySelectorAll('.term-pair');
    termPairs.forEach((pair, index) => {
        pair.querySelector('.term-number').textContent = index + 1;
    });
}

// Call this when showing the create set form
document.getElementById('create-set').addEventListener('click', () => {
    showCreateSetForm();
});

// Add this new function to parse imported terms
function parseImportedTerms(input) {
    return input.split(',')
        .map(pair => pair.trim())
        .filter(pair => pair.includes('-'))
        .map(pair => {
            const [term, definition] = pair.split('-').map(item => item.trim());
            if (term && definition) {
                return { term, definition };
            }
            return null;
        })
        .filter(item => item !== null);
}

// Add this function to handle page transitions
function pageTransition(fromElement, toElement) {
    // Fade out current element
    fromElement.style.animation = 'fadeOut 0.3s ease forwards';
    
    setTimeout(() => {
        fromElement.classList.add('hidden');
        toElement.classList.remove('hidden');
        // Fade in new element
        toElement.style.animation = 'fadeIn 0.3s ease forwards';
    }, 300);
}

// Update popup show/hide
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('hidden');
    window.FramerAnimations.animatePopup(popup.querySelector('.popup-content'));
}

function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    const content = popup.querySelector('.popup-content');
    window.FramerAnimations.animatePopup(content, false);
}

// Add this to your initialization code
function initializeButtonAnimations() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            window.FramerAnimations.animateButtonHover(button, true);
        });
        button.addEventListener('mouseleave', () => {
            window.FramerAnimations.animateButtonHover(button, false);
        });
    });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', initializeButtonAnimations);

// Add this CSS for the highlight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0% { background: rgba(var(--main-color-rgb), 0.3); }
        100% { background: rgba(var(--sub-color), 0.3); }
    }
`;
document.head.appendChild(style);

// Add styles for the scrollable container
const scrollStyles = document.createElement('style');
scrollStyles.textContent = `
    .sets-wrapper {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 10px;
        margin-right: -10px;
    }
    
    .sets-wrapper::-webkit-scrollbar {
        width: 8px;
    }
    
    .sets-wrapper::-webkit-scrollbar-track {
        background: rgba(var(--sub-color), 0.1);
        border-radius: 4px;
    }
    
    .sets-wrapper::-webkit-scrollbar-thumb {
        background: var(--main-color);
        border-radius: 4px;
    }
    
    .sets-wrapper::-webkit-scrollbar-thumb:hover {
        background: var(--sub-color);
    }
`;
document.head.appendChild(scrollStyles); 