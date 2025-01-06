const element = document.querySelector('#mod-loader-title > h1');

if (element) { element.style.color = '#ff0000'; }

document.querySelector('#mod-loader-title > span:nth-child(1) > a > img').style.display = 'none';


document.querySelector('#mod-loader-title > span:nth-child(3) > a > img').style.display = 'none';

document.querySelector('your-selector-here').style.display = 'none';

(get selector by: selecting element by inspecting, right click --> select, copy - selector

document.querySelector('#mod-descriptions > div:nth-child(10) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(9) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(8) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(7) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(6) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(5) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(4) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(3) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(2) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(1) > span:nth-child(5)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(2) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(3) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(4) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(5) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(6) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(6) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(7) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(8) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(9) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-descriptions > div:nth-child(10) > span:nth-child(3)').style.display = 'none';

document.querySelector('#mod-game-verson-div > label').style.display = 'none';

document.querySelector('#mod-game-version').style.display = 'none';

document.querySelector('#mod-game-verson-div > a').style.display = 'none';

document.querySelector('#version-info').style.display = 'none';

document.querySelector('#advanced-options-show-settings-text').style.display = 'none';

document.querySelector('#advanced-options-toggle').style.display = 'none';


document.querySelector('#mod-loader-title > span:nth-child(3) > a > img').style.display = 'none';


document.querySelector('#mod-loader-title > h1').innerHTML = '<strong>SNAKE HACKS</strong>';



function applyGradient(selector, gradient) {
const element = document.querySelector(selector);  
if (element) {
element.style.background = gradient;
console.log(`Gradient applied to ${selector}`);
} else {

console.log(`Element with selector ${selector} not found`);
}
}

applyGradient('#mod-selector-dialogue', 'linear-gradient(to top, #000033, #00008B)');


