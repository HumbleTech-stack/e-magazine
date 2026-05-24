/************************************************************
███████████████████████████████████████████████████████████
█              FILE UPLOAD & PREVIEW HELPERS               █
█        (Image/Video Preview & Formatting)               █
███████████████████████████████████████████████████████████
************************************************************/

// Helper function to format duration
function formatDuration(seconds) {
  const sec = parseInt(seconds);
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Preview functions
function previewImage(input) {
  const preview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previewVideo(input) {
  const preview = document.getElementById('videoPreview');
  const previewVid = document.getElementById('previewVid');
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewVid.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function previewAudio(input) {
  const preview = document.getElementById('audioPreview');
  const previewAudio = document.getElementById('previewAudio');

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewAudio.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function findContentItem(itemId) {
  return getAllContentItems()
    .find(item => item.id === itemId);
}

function buildMetadataLine(item) {
  const parts = [];
  if (item.category) parts.push(item.category);
  if (Array.isArray(item.keywords) && item.keywords.length > 0) {
    parts.push(item.keywords.join(', '));
  }
  return parts.join(' | ');
}

function getAllContentItems() {
  return [...app.content.text, ...app.content.image, ...app.content.video, ...app.content.podcast, ...(app.content.live || [])]
    .sort((a, b) => b.id - a.id);
}

function readFilesAsDataUrls(files) {
  return Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  })));
}

function getRelatedContent(item, limit = 4) {
  const itemKeywords = Array.isArray(item.keywords) ? item.keywords : [];

  return getAllContentItems()
    .filter(candidate => candidate.id !== item.id)
    .map(candidate => {
      const candidateKeywords = Array.isArray(candidate.keywords) ? candidate.keywords : [];
      const keywordMatches = candidateKeywords.filter(keyword => itemKeywords.includes(keyword)).length;
      const categoryMatch = item.category && candidate.category === item.category ? 2 : 0;
      const typeMatch = candidate.type === item.type ? 1 : 0;

      return {
        item: candidate,
        score: keywordMatches + categoryMatch + typeMatch
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || b.item.id - a.item.id)
    .slice(0, limit)
    .map(result => result.item);
}

function renderRelatedContent(item, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const relatedItems = getRelatedContent(item);
  if (relatedItems.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <h3><i class="fas fa-layer-group"></i> Related Content</h3>
    <div class="related-grid"></div>
  `;

  const grid = container.querySelector('.related-grid');
  relatedItems.forEach(relatedItem => {
    const button = document.createElement('button');
    button.className = 'related-card';
    button.type = 'button';
    button.innerHTML = `
      <span class="related-icon"><i class="${getActivityIcon(relatedItem.type)}"></i></span>
      <span>
        <strong></strong>
        <small></small>
      </span>
    `;
    button.querySelector('strong').textContent = relatedItem.title;
    button.querySelector('small').textContent = buildMetadataLine(relatedItem) || (relatedItem.type === 'text' ? 'Article' : relatedItem.type);
    button.addEventListener('click', () => {
      if (containerId === 'mediaRecommendations') closeMediaPlayer();
      if (containerId === 'articleRecommendations') closeDetailModal();
      openContentItem(relatedItem.id);
    });
    grid.appendChild(button);
  });
}
