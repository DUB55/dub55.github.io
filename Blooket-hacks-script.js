document.addEventListener('DOMContentLoaded', () => {
    const codeDisplay = document.getElementById('codeDisplay');
    const copyButton = document.getElementById('copyButton');
    const copyIcon = copyButton.querySelector('.copy-icon');
    const checkIcon = document.createElement('span');
    checkIcon.className = 'check-icon';
    checkIcon.textContent = '✔️'; // Add a checkmark icon
    checkIcon.style.display = 'none'; // Initially hidden
    copyButton.appendChild(checkIcon);

    // URL of the JavaScript file to fetch
    const jsFileUrl = 'https://cdn.jsdelivr.net/gh/DUB55/dub55.github.io/blooketICON-bookmark.js';

    // Fetch the JavaScript file
    fetch(jsFileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            // Display the fetched JavaScript code in the codeDisplay container
            codeDisplay.textContent = data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            codeDisplay.textContent = 'Error fetching the JavaScript file.';
        });

    // Copy code to clipboard with fallback method
    
    const copyTextToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for insecure contexts or older browsers
            return new Promise((resolve, reject) => {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                // Prevent scroll to bottom
                textArea.style.position = 'fixed';
                textArea.style.top = '0';
                textArea.style.left = '0';
                textArea.style.width = '2em';
                textArea.style.height = '2em';
                textArea.style.padding = '0';
                textArea.style.border = 'none';
                textArea.style.outline = 'none';
                textArea.style.boxShadow = 'none';
                textArea.style.background = 'transparent';

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    if (document.execCommand('copy')) {
                        resolve();
                    } else {
                        reject(new Error('Unable to copy'));
                    }
                } catch (err) {
                    reject(err);
                } finally {
                    document.body.removeChild(textArea);
                }
            });
        }
    };

    copyButton.addEventListener('click', () => {
        copyTextToClipboard(codeDisplay.textContent).then(() => {
            // Swap icons for visual feedback
            copyIcon.style.display = 'none';
            checkIcon.style.display = 'inline-block';
            copyButton.disabled = true;
            copyButton.textContent = ''; // Clear text to show icons only
            copyButton.appendChild(checkIcon);

            setTimeout(() => {
                checkIcon.style.display = 'none';
                copyIcon.style.display = 'inline-block';
                copyButton.disabled = false;
                copyButton.textContent = 'Copy Code';
                copyButton.insertBefore(copyIcon, copyButton.firstChild);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
});
