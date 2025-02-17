function displaySavedWords() {
  const wordList = document.getElementById('wordList');
  
  chrome.storage.local.get(['savedWords'], function(result) {
    const savedWords = result.savedWords || [];
    
    if (savedWords.length === 0) {
      wordList.innerHTML = `
        <div class="empty-state">
          Nenhuma palavra salva ainda.<br>
          Passe o mouse sobre as legendas para traduzir e clique para salvar!
        </div>
      `;
      return;
    }
    
    const wordsHTML = savedWords.map(word => `
      <div class="word-item" data-word="${word.english}">
        <div class="word-text">
          <div class="word-english">${word.english}</div>
          <div class="word-portuguese">${word.portuguese}</div>
        </div>
        <button class="delete-btn" data-word="${word.english}">×</button>
      </div>
    `).join('');
    
    wordList.innerHTML = wordsHTML;
    
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        const wordToDelete = e.target.dataset.word;
        deleteWord(wordToDelete);
      });
    });
  });
}

function deleteWord(word) {
  chrome.storage.local.get(['savedWords'], function(result) {
    const savedWords = result.savedWords || [];
    const updatedWords = savedWords.filter(w => w.english !== word);
    
    chrome.storage.local.set({ savedWords: updatedWords }, function() {
      displaySavedWords();
    });
  });
}

document.getElementById('clearAll').addEventListener('click', function() {
  if (confirm('Tem certeza que deseja apagar todas as palavras salvas?')) {
    chrome.storage.local.set({ savedWords: [] }, function() {
      displaySavedWords();
    });
  }
});

document.addEventListener('DOMContentLoaded', displaySavedWords);
