const themes = [
    {
        name: "default",
        bgColor: "#000066",
        mainColor: "#0000ff",
        subColor: "#000033",
        textColor: "#ffffff"
    },
    {
        name: "modern_ink",
        bgColor: "#1a1a1a",
        mainColor: "#ff360d",
        subColor: "#b7b7b7",
        textColor: "#ffffff"
    },
    {
        name: "9009",
        bgColor: "#2c2c2c",
        mainColor: "#eeebe2",
        subColor: "#99947f",
        textColor: "#ffffff"
    },
    {
        name: "aether",
        bgColor: "#101820",
        mainColor: "#eedaea",
        subColor: "#cf6bdd",
        textColor: "#ffffff"
    },
    {
        name: "80s_after_dark",
        bgColor: "#1b1d36",
        mainColor: "#ff71ce",
        subColor: "#01cdfe",
        textColor: "#ffffff"
    },
    {
        name: "dracula",
        bgColor: "#282a36",
        mainColor: "#bd93f9",
        subColor: "#6272a4",
        textColor: "#ffffff"
    },
    {
        name: "8008",
        bgColor: "#333333",
        mainColor: "#f44336",
        subColor: "#1a1a1a",
        textColor: "#ffffff"
    },
    {
        name: "alduin",
        bgColor: "#1c1c1c",
        mainColor: "#ea7162",
        subColor: "#2c2c2c",
        textColor: "#ffffff"
    },
    {
        name: "alpine",
        bgColor: "#2b2937",
        mainColor: "#ffffff",
        subColor: "#6c687f",
        textColor: "#ffffff"
    },
    {
        name: "anti_hero",
        bgColor: "#1a1a1a",
        mainColor: "#f44336",
        subColor: "#2c2c2c",
        textColor: "#ffffff"
    },
    {
        name: "arch",
        bgColor: "#0C0D11",
        mainColor: "#0F94D2",
        subColor: "#1793D1",
        textColor: "#ffffff"
    },
    {
        name: "aurora",
        bgColor: "#011926",
        mainColor: "#00e980",
        subColor: "#001f3f",
        textColor: "#ffffff"
    },
    {
        name: "beach",
        bgColor: "#2d2d2d",
        mainColor: "#56b6c4",
        subColor: "#dba16c",
        textColor: "#ffffff"
    },
    {
        name: "bento",
        bgColor: "#2D394D",
        mainColor: "#FF7A90",
        subColor: "#4A768D",
        textColor: "#ffffff"
    },
    {
        name: "bliss",
        bgColor: "#262727",
        mainColor: "#f0b0b0",
        subColor: "#4d4d4d",
        textColor: "#ffffff"
    }
];

function initThemeSwitcher() {
    const themeSwitcher = document.getElementById('theme-switcher');
    if (!themeSwitcher) return;

    const themePopup = themeSwitcher.querySelector('.theme-popup');
    const themeList = themeSwitcher.querySelector('.theme-list');

    // Clear existing theme options
    themeList.innerHTML = '';

    // Create theme options
    themes.forEach(theme => {
        const option = document.createElement('button');
        option.className = 'theme-option';
        
        const preview = document.createElement('div');
        preview.className = 'theme-preview';
        preview.style.background = `linear-gradient(to bottom right, ${theme.mainColor}, ${theme.subColor})`;
        
        const name = document.createElement('span');
        name.className = 'theme-name';
        name.textContent = theme.name.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        option.appendChild(preview);
        option.appendChild(name);
        
        // Direct click handler
        option.addEventListener('mousedown', () => {
            applyTheme(theme);
            
            // Add visual feedback
            option.style.transform = 'scale(0.95)';
            setTimeout(() => {
                option.style.transform = 'scale(1)';
                themePopup.classList.add('hidden');
            }, 150);
        });
        
        themeList.appendChild(option);
    });

    // Toggle popup visibility
    themeSwitcher.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-option')) {
            themePopup.classList.toggle('hidden');
        }
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#theme-switcher')) {
            themePopup.classList.add('hidden');
        }
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        applyTheme(JSON.parse(savedTheme));
    } else {
        applyTheme(themes[0]);
    }
}

function applyTheme(theme) {
    // Remove any previous theme classes
    document.body.classList.remove('theme-default');

    // Add theme class if it's the default theme
    if (theme.name === "default") {
        document.body.classList.add('theme-default');
    }

    // Convert hex colors to RGB format for rgba usage
    function hexToRGB(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }

    // Set theme colors as CSS variables
    document.documentElement.style.setProperty('--bg-color', theme.bgColor);
    document.documentElement.style.setProperty('--main-color', theme.mainColor);
    document.documentElement.style.setProperty('--sub-color', theme.subColor);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    // Add RGB versions of colors for rgba usage
    document.documentElement.style.setProperty('--bg-color-rgb', hexToRGB(theme.bgColor));
    document.documentElement.style.setProperty('--main-color-rgb', hexToRGB(theme.mainColor));
    document.documentElement.style.setProperty('--sub-color-rgb', hexToRGB(theme.subColor));

    // Apply theme to body background
    document.body.style.background = theme.bgColor;

    // Update container backgrounds
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
        container.style.backgroundColor = `rgba(${hexToRGB(theme.bgColor)}, 0.6)`;
    });

    // Update inputs and textareas
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
        input.style.backgroundColor = theme.subColor;
        input.style.color = theme.textColor;
    });

    // Update all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.classList.contains('close-button')) {
            button.style.backgroundColor = theme.bgColor;
        }
    });

    // Special handling for multiple choice buttons in default theme
    const optionButtons = document.querySelectorAll('.option-button');
    if (theme.name === "default") {
        optionButtons.forEach(button => {
            button.style.background = 'linear-gradient(to bottom, #000088, #000042) !important';
        });
    } else {
        optionButtons.forEach(button => {
            button.style.background = '';  // Remove inline style to use CSS theme variables
        });
    }

    // Save theme preference
    localStorage.setItem('selectedTheme', JSON.stringify(theme));
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Helper function to darken/lighten colors
function adjustColor(color, amount) {
    const rgb = hexToRgb(color);
    return `rgb(${Math.max(0, Math.min(255, rgb.r + amount))}, 
                ${Math.max(0, Math.min(255, rgb.g + amount))}, 
                ${Math.max(0, Math.min(255, rgb.b + amount))})`;
}

// Initialize theme switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', initThemeSwitcher); 