const tooltip = document.createElement('div');
tooltip.style.cssText = `
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10000;
  pointer-events: none;
  display: none;
  max-width: 200px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;
document.body.appendChild(tooltip);

const translationCache = new Map();

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function translateText(text) {
  if (translationCache.has(text)) {
    return translationCache.get(text);
  }

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    const translation = data[0][0][0];
    
    translationCache.set(text, translation);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return 'Erro na tradução';
  }
}

function saveWord(english, portuguese) {
  chrome.storage.local.get(['savedWords'], function(result) {
    const savedWords = result.savedWords || [];
    if (!savedWords.some(word => word.english === english)) {
      savedWords.push({ english, portuguese });
      chrome.storage.local.set({ savedWords });
    }
  });
}

const handleWordHover = debounce(async (word, element) => {
  const translation = await translateText(word);
  tooltip.textContent = translation;
  tooltip.style.display = 'block';
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.top - 30}px`;
}, 200);

let isProcessing = false;
function processCaptionWindow(captionWindow) {
  if (!captionWindow || isProcessing) return;
  
  isProcessing = true;
  
  captionWindow.style.margin = '0 auto';
  captionWindow.style.left = '50%';
  captionWindow.style.transform = 'translateX(-50%)';
  captionWindow.style.textAlign = 'center';
  
  captionWindow.addEventListener('mouseover', async (e) => {
    const wordElement = e.target.closest('.caption-word');
    if (wordElement) {
      handleWordHover(wordElement.textContent, wordElement);
    }
  });
  
  captionWindow.addEventListener('mouseout', (e) => {
    const wordElement = e.target.closest('.caption-word');
    if (wordElement) {
      tooltip.style.display = 'none';
    }
  });
  
  captionWindow.addEventListener('click', async (e) => {
    const wordElement = e.target.closest('.caption-word');
    if (wordElement) {
      const word = wordElement.textContent;
      const translation = await translateText(word);
      saveWord(word, translation);
      
      wordElement.style.color = '#4CAF50';
      setTimeout(() => {
        wordElement.style.color = '';
      }, 500);
    }
  });
  
  isProcessing = false;
}

function enhanceCaptions() {
  const captionWindow = document.querySelector('.caption-window.ytp-caption-window-bottom');
  if (!captionWindow) return;

  processCaptionWindow(captionWindow);

  const segments = captionWindow.querySelectorAll('.ytp-caption-segment');
  segments.forEach(segment => {
    if (segment.dataset.processed) return;
    
    const words = segment.textContent.trim().split(/\s+/);
    segment.innerHTML = words.map(word => 
      `<span class="caption-word">${word}</span>`
    ).join(' ');
    
    segment.dataset.processed = 'true';
  });
}

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const observer = new MutationObserver(throttle((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      enhanceCaptions();
    }
  });
}, 100));

function initializeObserver() {
  const videoPlayer = document.querySelector('.html5-video-player');
  if (videoPlayer) {
    observer.observe(videoPlayer, {
      childList: true,
      subtree: true
    });
    enhanceCaptions();
  } else {
    setTimeout(initializeObserver, 1000);
  }
}

initializeObserver();
