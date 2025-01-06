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

const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.style.marginBottom = '10px';
colorPicker.style.border = 'none';
colorPicker.style.width = '40px';
colorPicker.style.height = '40px';
colorPicker.style.padding = '0';
colorPicker.style.cursor = 'pointer';

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

document.body.appendChild(container);

let selectedElement = null;
let isSelecting = false;
let hoveredElement = null;

const highlightOverlay = document.createElement('div');
highlightOverlay.style.position = 'fixed';
highlightOverlay.style.pointerEvents = 'none';
highlightOverlay.style.zIndex = '9998';
highlightOverlay.style.border = '2px solid #007bff';
highlightOverlay.style.backgroundColor = 'rgba(0, 123, 255, 0.2)';
highlightOverlay.style.display = 'none';
document.body.appendChild(highlightOverlay);

const tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
tooltip.style.color = 'white';
tooltip.style.padding = '5px';
tooltip.style.borderRadius = '3px';
tooltip.style.fontSize = '12px';
tooltip.style.zIndex = '10000';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

function updateHighlight(element) {
  const rect = element.getBoundingClientRect();
  highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
  highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
  highlightOverlay.style.width = `${rect.width}px`;
  highlightOverlay.style.height = `${rect.height}px`;
  highlightOverlay.style.display = 'block';
  
  tooltip.textContent = `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}`;
  tooltip.style.top = `${rect.top + window.scrollY - 25}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.display = 'block';
}

function hideHighlight() {
  highlightOverlay.style.display = 'none';
  tooltip.style.display = 'none';
}

function startSelecting() {
  isSelecting = true;
  selectElementButton.textContent = 'Cancel Selection';
  selectElementButton.style.background = '#FFA500';
  document.body.style.cursor = 'crosshair';
  
  document.addEventListener('mouseover', elementHoverHandler);
  document.addEventListener('click', elementClickHandler, true);
  document.addEventListener('keydown', keyboardNavigationHandler);
}

function stopSelecting() {
  isSelecting = false;
  selectElementButton.textContent = 'Select Element';
  selectElementButton.style.background = '#2196F3';
  document.body.style.cursor = 'default';
  hideHighlight();
  
  document.removeEventListener('mouseover', elementHoverHandler);
  document.removeEventListener('click', elementClickHandler, true);
  document.removeEventListener('keydown', keyboardNavigationHandler);
}

function elementHoverHandler(e) {
  if (e.target !== highlightOverlay && e.target !== container && !container.contains(e.target)) {
    hoveredElement = e.target;
    updateHighlight(hoveredElement);
  }
}

function elementClickHandler(e) {
  if (isSelecting && e.target !== container && !container.contains(e.target)) {
    e.preventDefault();
    e.stopPropagation();
    selectedElement = e.target;
    stopSelecting();
    updateHighlight(selectedElement);
  }
}

function keyboardNavigationHandler(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    const currentElement = hoveredElement || document.body;
    let newElement;
    
    switch (e.key) {
      case 'ArrowUp':
        newElement = currentElement.parentElement || currentElement;
        break;
      case 'ArrowDown':
        newElement = currentElement.firstElementChild || currentElement.nextElementSibling || currentElement;
        break;
      case 'ArrowLeft':
        newElement = currentElement.previousElementSibling || currentElement;
        break;
      case 'ArrowRight':
        newElement = currentElement.nextElementSibling || currentElement;
        break;
    }
    
    if (newElement) {
      hoveredElement = newElement;
      updateHighlight(hoveredElement);
    }
  } else if (e.key === 'Enter') {
    if (hoveredElement) {
      selectedElement = hoveredElement;
      stopSelecting();
      updateHighlight(selectedElement);
    }
  } else if (e.key === 'Escape') {
    stopSelecting();
  }
}

function changeElementColor(element, color) {
  if (element.tagName.toLowerCase() === 'img') {
    element.style.border = `2px solid ${color}`;
  } else if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
    element.style.color = color;
  } else {
    element.style.backgroundColor = color;
  }
}

function resetElementColor(element) {
  if (element.tagName.toLowerCase() === 'img') {
    element.style.border = '';
  } else {
    element.style.color = '';
    element.style.backgroundColor = '';
  }
}

changeButton.addEventListener('click', () => {
  if (selectedElement) {
    changeElementColor(selectedElement, colorPicker.value);
  }
});

resetButton.addEventListener('click', () => {
  if (selectedElement) {
    resetElementColor(selectedElement);
  }
  selectedElement = null;
  hideHighlight();
});

selectElementButton.addEventListener('click', () => {
  if (isSelecting) {
    stopSelecting();
  } else {
    startSelecting();
  }
});

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