var Version = '1.0.25'

var questions = [];
var info = {
    numQuestions: 0,
    questionNum: -1,
    lastAnsweredQuestion: -1,
    defaultIL:true,
    ILSetQuestion:-1,
};
var PPT = 950;
var Answered_PPT = 950;
var autoAnswer = false;
var showAnswers = false;
var inputLag = 100;

function FindByAttributeValue(attribute, value, element_type)    {
  element_type = element_type || "*";
  var All = document.getElementsByTagName(element_type);
  for (var i = 0; i < All.length; i++)       {
    if (All[i].getAttribute(attribute) == value) { return All[i]; }
  }
}

// Create stars background
const starsContainer = document.createElement('div');
starsContainer.className = 'stars';
starsContainer.id = 'stars';
document.body.appendChild(starsContainer);

// Create UI Element with new styling
const uiElement = document.createElement('div');
uiElement.className = 'floating-ui';
uiElement.style.position = 'absolute';
uiElement.style.top = '5%';
uiElement.style.left = '5%';
uiElement.style.width = '25vw';
uiElement.style.height = 'auto';
uiElement.style.background = 'rgba(255, 255, 255, 0.05)';
uiElement.style.backdropFilter = 'blur(8.6px)';
uiElement.style.webkitBackdropFilter = 'blur(8.6px)';
uiElement.style.borderRadius = '1.5rem';
uiElement.style.boxShadow = '0px 0px 10px 0px rgba(0, 0, 0, 0.5)';
uiElement.style.zIndex = '9999';
uiElement.style.cursor = 'move'; // Make entire UI show move cursor

const handle = document.createElement('div');
handle.className = 'handle';
handle.style.fontFamily = '"DM Serif Display", serif';
handle.style.fontSize = '1.5vw';
handle.textContent = 'DUB5';
handle.style.color = 'white';
handle.style.width = '100%';
handle.style.height = '2.5vw';
handle.style.background = 'rgba(255, 255, 255, 0.08)'; // Slightly darker than main UI but same color scheme
handle.style.borderRadius = '1.5rem 1.5rem 0 0';
handle.style.cursor = 'move';
handle.style.textAlign = 'center';
handle.style.lineHeight = '2.5vw';
handle.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
handle.style.position = 'relative';
handle.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)'; // Clean border between header and content

handle.style.boxShadow = 'inset 0 -2px 5px rgba(255, 255, 255, 0.1)';
handle.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
handle.style.position = 'relative';

// Removed shine effect and animation

uiElement.appendChild(handle);

const closeButton = document.createElement('div');
closeButton.className = 'close-button';
closeButton.textContent = '✕'; // Changed to literal ✕ character
closeButton.style.position = 'absolute';
closeButton.style.top = '0';
closeButton.style.right = '0';
closeButton.style.width = '12.5%';
closeButton.style.height = '2.5vw';
closeButton.style.backgroundColor = 'transparent';
closeButton.style.color = 'white';
closeButton.style.borderRadius = '0 1.5rem 0 0';
closeButton.style.display = 'flex';
closeButton.style.justifyContent = 'center';
closeButton.style.alignItems = 'center';
closeButton.style.cursor = 'pointer';
closeButton.style.fontSize = '1.2vw'; // Added font size for better visibility
handle.appendChild(closeButton);

const minimizeButton = document.createElement('div');
minimizeButton.className = 'minimize-button';
minimizeButton.textContent = '─'; // Start with minus sign
minimizeButton.style.color = 'white';
minimizeButton.style.position = 'absolute';
minimizeButton.style.top = '0';
minimizeButton.style.right = '12.5%';
minimizeButton.style.width = '12.5%';
minimizeButton.style.height = '2.5vw';
minimizeButton.style.backgroundColor = 'transparent';
minimizeButton.style.borderRadius = '0 0 0 0';
minimizeButton.style.display = 'flex';
minimizeButton.style.justifyContent = 'center';
minimizeButton.style.alignItems = 'center';
minimizeButton.style.cursor = 'pointer';
minimizeButton.style.fontSize = '1.2vw'; // Base font size
minimizeButton.style.fontWeight = 'bold'; // Make both symbols bolder
handle.appendChild(minimizeButton);

const header = document.createElement('h2');
header.textContent = 'Quiz ID';
header.style.display = 'block';
header.style.margin = '0.8vw'; // Reduced from 1vw to 0.8vw
header.style.textAlign = 'center';
header.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
header.style.fontSize = '1.5vw'; // Reduced from 2vw to 1.5vw
header.style.color = 'rgb(224, 242, 254)';
header.style.fontWeight = '600';

uiElement.appendChild(header);

const inputContainer = document.createElement('div');
inputContainer.style.display = 'flex';
inputContainer.style.justifyContent = 'center';

const inputBox = document.createElement('input');
inputBox.type = 'text';
inputBox.style.color = 'white';
inputBox.style.background = 'rgba(255, 255, 255, 0.1)';
inputBox.placeholder = 'Vul Quiz ID hier in...';
inputBox.style.width = '20vw'; // Reduced from 27.8vw to 20vw
inputBox.style.height = '1.8vw'; // Reduced from 2vw to 1.8vw
inputBox.style.margin = '0vw';
inputBox.style.padding = '0.5vw';
inputBox.style.border = '1px solid rgba(255, 255, 255, 0.2)';
inputBox.style.borderRadius = '1rem'; // Increased from 0.5rem to 1rem
inputBox.style.outline = 'none';
inputBox.style.textAlign = 'center';
inputBox.style.fontSize = '1vw'; // Reduced from 1.15vw to 1vw

inputContainer.appendChild(inputBox);
uiElement.appendChild(inputContainer);

// Add a spacer div between QUIZ ID and POINTS PER QUESTION sections
const spacerDiv = document.createElement('div');
spacerDiv.style.width = '100%';
spacerDiv.style.height = '1.5vw'; // Adjust this value to increase/decrease spacing
uiElement.appendChild(spacerDiv);

const header2 = document.createElement('h2');
header2.textContent = 'Punten per vraag';
header2.style.display = 'block';
header2.style.margin = '0.8vw'; // Reduced from 1vw to 0.8vw
header2.style.textAlign = 'center';
header2.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
header2.style.fontSize = '1.5vw'; // Reduced from 2vw to 1.5vw
header2.style.color = 'rgb(224, 242, 254)';
header2.style.fontWeight = '600';

uiElement.appendChild(header2);

const sliderContainer = document.createElement('div');
sliderContainer.style.width = '80%';
sliderContainer.style.margin = '0.8vw auto'; // Reduced from 1vw to 0.8vw
sliderContainer.style.display = 'flex';
sliderContainer.style.alignItems = 'center';
sliderContainer.style.justifyContent = 'center';

const pointsLabel = document.createElement('span');
pointsLabel.textContent = 'Punten per vraag: 950';
pointsLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
pointsLabel.style.fontSize = '1.2vw'; // Reduced from 1.5vw to 1.2vw
pointsLabel.style.margin = '0.8vw'; // Reduced from 1vw to 0.8vw
pointsLabel.style.marginLeft = '0.8vw'; // Reduced from 1vw to 0.8vw
pointsLabel.style.marginRight = '0.8vw'; // Reduced from 1vw to 0.8vw
pointsLabel.style.color = 'white';
sliderContainer.appendChild(pointsLabel);

const pointsSlider = document.createElement('input');
pointsSlider.type = 'range';
pointsSlider.min = '500';
pointsSlider.max = '1000';
pointsSlider.value = '950';
pointsSlider.style.width = '70%';
pointsSlider.style.marginLeft = '1vw';
pointsSlider.style.marginRight = '1vw';
pointsSlider.style.border = 'none';
pointsSlider.style.outline = 'none';
pointsSlider.style.cursor = 'ew-resize';
pointsSlider.className = 'custom-slider';

sliderContainer.appendChild(pointsSlider);
uiElement.appendChild(sliderContainer);

pointsSlider.addEventListener('input', () => {
    const points = +pointsSlider.value;
    PPT = points;
    pointsLabel.textContent = 'Punten per vraag: ' + points;
});

const header3 = document.createElement('h2');
header3.textContent = 'Antwoorden';
header3.style.display = 'block';
header3.style.margin = '0.8vw'; // Reduced from 1vw to 0.8vw
header3.style.textAlign = 'center';
header3.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
header3.style.fontSize = '1.5vw'; // Reduced from 2vw to 1.5vw
header3.style.color = 'rgb(224, 242, 254)';
header3.style.fontWeight = '600';

uiElement.appendChild(header3);

const autoAnswerSwitchContainer = document.createElement('div');
autoAnswerSwitchContainer.className = 'switch-container';
autoAnswerSwitchContainer.style.display = 'flex';
autoAnswerSwitchContainer.style.alignItems = 'center';
autoAnswerSwitchContainer.style.justifyContent = 'space-between'; // Changed to space-between
autoAnswerSwitchContainer.style.width = '80%'; // Fixed width
autoAnswerSwitchContainer.style.margin = '0 auto'; // Center the container
autoAnswerSwitchContainer.style.padding = '0.5vw 1vw'; // Add padding
uiElement.appendChild(autoAnswerSwitchContainer);

const autoAnswerLabel = document.createElement('span');
autoAnswerLabel.textContent = 'Automatisch Antwoorden';
autoAnswerLabel.className = 'switch-label';
autoAnswerLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
autoAnswerLabel.style.fontSize = '1.2vw';
autoAnswerLabel.style.color = 'white';
autoAnswerLabel.style.margin = '0'; // Remove margin
autoAnswerLabel.style.flex = '1'; // Take available space
autoAnswerSwitchContainer.appendChild(autoAnswerLabel);

const autoAnswerSwitch = document.createElement('label');
autoAnswerSwitch.className = 'switch';
autoAnswerSwitch.style.margin = '0 0 0 1vw'; // Only add margin on left side
autoAnswerSwitchContainer.appendChild(autoAnswerSwitch);

const autoAnswerInput = document.createElement('input');
autoAnswerInput.type = 'checkbox';
autoAnswerInput.addEventListener('change', function() {
    autoAnswer = this.checked;
    info.ILSetQuestion = info.questionNum
});
autoAnswerSwitch.appendChild(autoAnswerInput);

const autoAnswerSlider = document.createElement('span');
autoAnswerSlider.className = 'slider';
autoAnswerSwitch.appendChild(autoAnswerSlider);

const showAnswersSwitchContainer = document.createElement('div');
showAnswersSwitchContainer.className = 'switch-container';
showAnswersSwitchContainer.style.display = 'flex';
showAnswersSwitchContainer.style.alignItems = 'center';
showAnswersSwitchContainer.style.justifyContent = 'space-between'; // Changed to space-between
showAnswersSwitchContainer.style.width = '80%'; // Same width
showAnswersSwitchContainer.style.margin = '0 auto'; // Center the container
showAnswersSwitchContainer.style.padding = '0.5vw 1vw'; // Add padding
uiElement.appendChild(showAnswersSwitchContainer);

const showAnswersLabel = document.createElement('span');
showAnswersLabel.textContent = 'Antwoorden Laten Zien';
showAnswersLabel.className = 'switch-label';
showAnswersLabel.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
showAnswersLabel.style.fontSize = '1.2vw';
showAnswersLabel.style.color = 'white';
showAnswersLabel.style.margin = '0'; // Remove margin
showAnswersLabel.style.flex = '1'; // Take available space
showAnswersSwitchContainer.appendChild(showAnswersLabel);

const showAnswersSwitch = document.createElement('label');
showAnswersSwitch.className = 'switch';
showAnswersSwitch.style.margin = '0 0 0 1vw'; // Only add margin on left side
showAnswersSwitchContainer.appendChild(showAnswersSwitch);

const showAnswersInput = document.createElement('input');
showAnswersInput.type = 'checkbox';
showAnswersInput.addEventListener('change', function() {
    showAnswers = this.checked;
});
showAnswersSwitch.appendChild(showAnswersInput);

const showAnswersSlider = document.createElement('span');
showAnswersSlider.className = 'slider';
showAnswersSwitch.appendChild(showAnswersSlider);

// Add footer with DUB5 credit
const footer = document.createElement('div');
footer.style.width = '100%';
footer.style.padding = '0.8rem';
footer.style.textAlign = 'center';
footer.style.marginTop = '0.8rem';

const footerText = document.createElement('p');
footerText.textContent = '© 2025 DUB5. All rights reserved.';
footerText.style.fontSize = '0.75rem'; // Increased from 0.75rem to 1.2rem
footerText.style.color = 'rgb(224, 242, 254)';
// Removed: footerText.style.fontWeight = 'bold';
footer.appendChild(footerText);

uiElement.appendChild(footer);

const style = document.createElement('style');
style.textContent = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: linear-gradient(to bottom, #000044, #000033, #000066);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
  position: relative;
}

.custom-slider {
  appearance: none;
  height: 0.6vw; /* Reduced from 0.75vw to 0.6vw */
  border-radius: 1vw;
  background: linear-gradient(to right, red, yellow, limegreen);
  outline: none;
}

.custom-slider::-webkit-slider-thumb {
  appearance: none;
  width: 1.5vw; /* Reduced from 1.75vw to 1.5vw */
  height: 1.5vw; /* Reduced from 1.75vw to 1.5vw */
  background-color: white;
  border-radius: 50%;
  cursor: ew-resize;
  margin-top: -0.30vw; /* Adjusted from -0.45vw to -0.35vw to position the thumb lower */
}

:root {
  --switch-width: 4.5vw; /* Reduced from 5.9vw to 4.5vw */
  --switch-height: 2.5vw; /* Reduced from 3.3vw to 2.5vw */
  --slider-size: 1.9vw; /* Reduced from 2.5vw to 1.9vw */
  --slider-thumb-size: 1vw; /* Reduced from 1.3vw to 1vw */
}

.switch {
  position: relative;
  display: inline-block;
  width: var(--switch-width);
  height: var(--switch-height);
  margin: 0; /* Remove default margin */
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 0, 0, 0.5);
  transition: 0.8s;
  border-radius: 2vw; /* Increased from 3vw to make it more rounded relative to size */
}

.slider:before {
  position: absolute;
  content: "";
  height: var(--slider-size);
  width: var(--slider-size);
  left: 0.3vw; /* Reduced from 0.4vw to 0.3vw */
  bottom: 0.3vw; /* Reduced from 0.4vw to 0.3vw */
  background-color: white;
  transition: 0.8s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: rgba(0, 255, 0, 0.5);
}

input:checked + .slider:before {
  transform: translateX(2vw); /* Reduced from 2.6vw to 2vw */
}

/* Stars Background */
.stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .floating-ui {
    width: 70vw; /* Reduced from 80vw to 70vw */
  }
  
  header, header2, header3 {
    font-size: 3vw; /* Reduced from 4vw to 3vw */
  }
  
  .switch-label, pointsLabel {
    font-size: 2.5vw; /* Reduced from 3vw to 2.5vw */
  }
}
`;

document.head.appendChild(style);
document.body.appendChild(uiElement);

// Generate stars for background
function generateStars() {
  const starsContainer = document.getElementById('stars');
  starsContainer.innerHTML = '';

  for (let i = 0; i < 400; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random position
    star.style.left = `${Math.random() * 150 - 25}%`;
    star.style.top = `${Math.random() * 150 - 25}%`;
    
    // Random size
    const size = Math.random() * (0.4 - 0.1) + 0.1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Random animation delay
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `3s`;
    
    starsContainer.appendChild(star);
  }
}

// Initialize stars
generateStars();

// Regenerate stars on window resize
window.addEventListener('resize', generateStars);

// Make UI draggable
let isDragging = false;
let offsetX, offsetY;

// Update to make the entire uiElement draggable
uiElement.addEventListener('mousedown', (e) => {
  // Prevent dragging when clicking on input elements or buttons
  if (e.target.tagName === 'INPUT' || 
      e.target === closeButton || 
      e.target === minimizeButton ||
      e.target.classList.contains('slider')) {
    return;
  }
  
  isDragging = true;
  offsetX = e.clientX - uiElement.getBoundingClientRect().left;
  offsetY = e.clientY - uiElement.getBoundingClientRect().top;
  uiElement.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;
  
  uiElement.style.left = `${x}px`;
  uiElement.style.top = `${y}px`;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  uiElement.style.cursor = 'move';
});

// Remove the old handle-specific drag events
handle.removeEventListener('mousedown', handle._mousedownListener);

// Close and minimize functionality
closeButton.addEventListener('click', () => {
  uiElement.remove();
});

let isMinimized = false;
minimizeButton.addEventListener('click', () => {
  if (isMinimized) {
    // Restore to full UI
    uiElement.style.height = 'auto';
    handle.style.borderRadius = '1.5rem 1.5rem 0 0'; // Reset handle border radius
    uiElement.style.borderRadius = '1.5rem'; // Reset to original border radius
    
    // Properly restore all children with their original display properties
    Array.from(uiElement.children).forEach(child => {
      if (child !== handle) {
        child.style.display = '';
      }
    });
    
    // Explicitly ensure input container is properly centered
    inputContainer.style.display = 'flex';
    inputContainer.style.justifyContent = 'center';
    
    minimizeButton.textContent = '─'; // Change to minus when expanded
    minimizeButton.style.fontSize = '1.2vw'; // Original size for minus
    isMinimized = false;
  } else {
    // Minimize UI
    uiElement.style.height = '2.5vw'; // Match exactly the handle height
    handle.style.borderRadius = '1.5rem'; // Make handle fully rounded when minimized
    uiElement.style.borderRadius = '1.5rem'; // Keep consistent rounded corners
    
    // Hide all children except handle
    Array.from(uiElement.children).forEach(child => {
      if (child !== handle) {
        child.style.display = 'none';
      }
    });
    
    // Remove bottom border when minimized
    handle.style.borderBottom = '0';
    minimizeButton.textContent = '+'; // Change to plus when minimized
    minimizeButton.style.fontSize = '1.5vw'; // Larger size for plus to match minus visually
    isMinimized = true;
  }
});

// Quiz ID input handling
inputBox.addEventListener('input', handleInputChange);
