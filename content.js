async function fetchCustomSubtitles(videoId) {
  const userEndpoint = `https://www.youtube.com/api/timedtext?v=${videoId}&ei=P2G7Z57dKdCZ-LAP7t30uAM&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1740358575&sparams=ip,ipbits,expire,v,ei,caps,opi,xoaf&signature=1B412954867693340AD2494D5180E1DBFD5289E2.6F7F5BAB87378A0A1ECA3059FF7EB9EDF20F1E24&key=yt8&kind=asr&lang=en&fmt=json3`;
  try {
    const response = await fetch(userEndpoint);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching custom subtitles:', error);
    return null;
  }
}

function parseCustomSubtitles(data) {
  if (!data || !data.events) {
    console.error('Invalid subtitle data:', data);
    return [];
  }

  const subtitles = data.events.map(event => {
    if (!event.segs) return null;

    const startTime = event.tStartMs / 1000;
    const duration = event.dDurationMs / 1000;
    const text = event.segs.map(seg => seg.utf8).join('');

    return {
      startTime,
      duration,
      text
    };
  }).filter(subtitle => subtitle !== null);

  return subtitles;
}

function addCustomSubtitleButton() {
  const videoPlayer = document.querySelector('.html5-video-player');
  if (!videoPlayer) return;

  const button = document.createElement('button');
  button.textContent = 'Custom Subtitles';
  button.className = 'ytp-button';
  button.style.cssText = `
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 5px 10px;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 3px;
  `;

  let isEnabled = false;
  button.addEventListener('click', async () => {
    isEnabled = !isEnabled;
    button.textContent = isEnabled ? 'Disable Custom Subtitles' : 'Custom Subtitles';

    if (isEnabled) {
      const videoId = window.location.search.split('v=')[1].split('&')[0];
      const subtitleData = await fetchCustomSubtitles(videoId);
      const subtitles = parseCustomSubtitles(subtitleData);
      displayCustomSubtitles(subtitles);
    } else {
      clearCustomSubtitles();
    }
  });

  const controlBar = document.querySelector('.ytp-right-controls');
  if (controlBar) {
    controlBar.appendChild(button);
  }
}

let subtitleContainer = null;

function displayCustomSubtitles(subtitles) {
  const videoPlayer = document.querySelector('.html5-video-player');
  if (!videoPlayer) return;

  subtitleContainer = document.createElement('div');
  subtitleContainer.className = 'custom-subtitles-container';
  subtitleContainer.style.cssText = `
    position: absolute;
    bottom: 60px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    text-align: center !important;
    width: auto !important;
    max-width: 80% !important;
    pointer-events: auto !important;
    color: white !important;
    font-size: 18px !important;
    font-weight: 500 !important;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8) !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    margin: 4px 0 !important;
    line-height: 1.5 !important;
    background-color: rgba(0, 0, 0, 0.8) !important;
    z-index: 20;
  `;

  videoPlayer.appendChild(subtitleContainer);

  const video = document.querySelector('video');
  video.addEventListener('timeupdate', () => {
    const currentTime = video.currentTime + 1.5;
    const activeSubtitle = subtitles.find(subtitle =>
      currentTime >= subtitle.startTime && currentTime <= subtitle.startTime + subtitle.duration
    );

    if (activeSubtitle) {
      // Clear previous content
      subtitleContainer.innerHTML = '';
      
      // Split text into words and wrap each in a span
      activeSubtitle.text.split(' ').forEach(word => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = word + ' ';
        wordSpan.style.cursor = 'pointer';
        wordSpan.style.position = 'relative';
        
        // Add hover listeners for each word
        wordSpan.addEventListener('mouseenter', async (e) => {
          try {
            const translation = await translateText(word.trim());
            showTranslationTooltip(e.target, translation);
          } catch (error) {
            console.error('Translation error:', error);
          }
        });
        
        wordSpan.addEventListener('mouseleave', hideTranslationTooltip);
        
        subtitleContainer.appendChild(wordSpan);
      });
    } else {
      subtitleContainer.textContent = '';
    }
  });
}

function clearCustomSubtitles() {
  const subtitleContainer = document.querySelector('.custom-subtitles-container');
  if (subtitleContainer) {
    subtitleContainer.remove();
  }
}

const translationCache = new Map();

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

let tooltip = null;

function showTranslationTooltip(event, translation) {
  if (tooltip) tooltip.remove();
  
  tooltip = document.createElement('div');
  tooltip.className = 'translation-tooltip';
  tooltip.textContent = translation;
  
  const subRect = subtitleContainer.getBoundingClientRect();
  tooltip.style.position = 'fixed';
  tooltip.style.top = `${subRect.top - 40}px`;
  tooltip.style.left = `50%`;
  tooltip.style.transform = 'translateX(-50%)';
  
  document.body.appendChild(tooltip);
}

function hideTranslationTooltip() {
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }
}

setTimeout(addCustomSubtitleButton, 2000);
