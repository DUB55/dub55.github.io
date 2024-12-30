// Store the original background color
const originalColor = getComputedStyle(document.body).backgroundColor;

// Create a container for the color picker and buttons
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '10px';
container.style.left = '10px';
container.style.zIndex = '9999';
container.style.background = 'white';
container.style.padding = '10px';
container.style.borderRadius = '10px';
container.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
container.style.display = 'flex';
container.style.flexDirection = 'column';
container.style.alignItems = 'center';
container.style.cursor = 'move';

// Create a color picker input
const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.style.marginBottom = '10px';
colorPicker.style.border = 'none';
colorPicker.style.width = '40px';
colorPicker.style.height = '40px';
colorPicker.style.padding = '0';
colorPicker.style.cursor = 'pointer';

// Create a change color button
const changeButton = document.createElement('button');
changeButton.textContent = 'Change Color';
changeButton.style.padding = '8px 15px';
changeButton.style.border = 'none';
changeButton.style.borderRadius = '20px';
changeButton.style.background = '#4CAF50';
changeButton.style.color = 'white';
changeButton.style.cursor = 'pointer';
changeButton.style.transition = 'background 0.3s';
changeButton.style.marginBottom = '10px';

// Create a reset button
const resetButton = document.createElement('button');
resetButton.textContent = 'Reset Color';
resetButton.style.padding = '8px 15px';
resetButton.style.border = 'none';
resetButton.style.borderRadius = '20px';
resetButton.style.background = '#f44336';
resetButton.style.color = 'white';
resetButton.style.cursor = 'pointer';
resetButton.style.transition = 'background 0.3s';
resetButton.style.marginBottom = '10px';

// Create a select element button
const selectElementButton = document.createElement('button');
selectElementButton.textContent = 'Select Element';
selectElementButton.style.padding = '8px 15px';
selectElementButton.style.border = 'none';
selectElementButton.style.borderRadius = '20px';
selectElementButton.style.background = '#2196F3';
selectElementButton.style.color = 'white';
selectElementButton.style.cursor = 'pointer';
selectElementButton.style.transition = 'background 0.3s';

container.appendChild(colorPicker);
container.appendChild(changeButton);
container.appendChild(resetButton);
container.appendChild(selectElementButton);

// Add the container to the body
document.body.appendChild(container);

let selectedElement = document.body;

// Add click event listener to the change color button
changeButton.addEventListener('click', () => {
  selectedElement.style.backgroundColor = colorPicker.value;
});

// Add click event listener to the reset button
resetButton.addEventListener('click', () => {
  selectedElement.style.backgroundColor = '';
  selectedElement = document.body;
});

// Add click event listener to the select element button
selectElementButton.addEventListener('click', () => {
  selectElementButton.textContent = 'Selecting...';
  selectElementButton.style.background = '#FFA500';
  
  const clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectedElement = e.target;
    selectElementButton.textContent = 'Select Element';
    selectElementButton.style.background = '#2196F3';
    document.removeEventListener('click', clickHandler, true);
  };
  
  document.addEventListener('click', clickHandler, true);
});

// Make the container draggable
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

container.addEventListener("mousedown", dragStart);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", dragEnd);

function dragStart(e) {
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;

  if (e.target === container) {
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

    setTranslate(currentX, currentY, container);
  }
}

function dragEnd(e) {
  initialX = currentX;
  initialY = currentY;

  isDragging = false;
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

console.log('Enhanced color picker with change, reset, and select element buttons has been added to the page. You can now select a specific element, change its color, reset it, and drag the interface.');