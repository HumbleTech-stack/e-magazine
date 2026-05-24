function renderAllSections() {
  renderSearchFilters();
  renderLiveStreams();
  renderActivityFrames();
  renderSection('homeGrid', filterContent(app.content.text));
  updateActivityFeed();

  const reelsContent = [...app.content.image, ...app.content.video].sort((a, b) => b.id - a.id);
  renderSection('reelsGrid', filterContent(reelsContent));

  renderSection('podcastsGrid', filterContent(app.content.podcast));

  const allContent = getAllContentItems()
    .sort((a, b) => b.id - a.id);
  renderSection('historyGrid', filterContent(allContent));
}

function renderSearchFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const keywordFilter = document.getElementById('keywordFilter');
  if (!categoryFilter || !keywordFilter) return;

  const selectedCategory = categoryFilter.value;
  const selectedKeyword = keywordFilter.value;

  categoryFilter.innerHTML = '<option value="">All categories</option>' +
    app.taxonomy.categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  keywordFilter.innerHTML = '<option value="">All keywords</option>' +
    app.taxonomy.keywords.map(keyword => `<option value="${escapeHtml(keyword)}">${escapeHtml(keyword)}</option>`).join('');

  categoryFilter.value = selectedCategory;
  keywordFilter.value = selectedKeyword;
}

function filterContent(items) {
  const search = (document.getElementById('contentSearch')?.value || '').trim().toLowerCase();
  const category = document.getElementById('categoryFilter')?.value || '';
  const keyword = document.getElementById('keywordFilter')?.value || '';

  return items.filter(item => {
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    const haystack = [
      item.title,
      item.author,
      item.host,
      item.credit,
      item.description,
      item.content,
      item.url,
      item.category,
      keywords.join(' ')
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = !search || haystack.includes(search);
    const matchesCategory = !category || item.category === category;
    const matchesKeyword = !keyword || keywords.includes(keyword);

    return matchesSearch && matchesCategory && matchesKeyword;
  });
}

function filterByDate(dateString) {
  if (!dateString) {
    const allContent = getAllContentItems()
      .sort((a, b) => b.id - a.id);
    renderSection('historyGrid', allContent);
    return;
  }

  const selectedDate = new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const allContent = getAllContentItems();
  renderSection('historyGrid', allContent.filter(item => item.date === selectedDate));
}

function renderLiveStreams() {
  const section = document.getElementById('liveSection');
  const row = document.getElementById('liveFrameRow');
  if (!section || !row) return;

  const liveStreams = filterContent(app.content.live || []);
  row.innerHTML = '';

  if (liveStreams.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  liveStreams.forEach(stream => row.appendChild(createLiveFrame(stream)));
}

function createLiveFrame(stream) {
  const frame = document.createElement('article');
  frame.className = 'live-frame';
  frame.tabIndex = 0;
  frame.setAttribute('role', 'button');
  frame.setAttribute('aria-label', `Watch live stream ${stream.title}`);
  frame.innerHTML = `
    <div class="live-player"></div>
    <div class="live-info">
      <span class="live-badge"><i class="fas fa-circle"></i> Live</span>
      <h3></h3>
      <p></p>
      <div class="live-actions">
        <button class="card-action" type="button"><i class="fas fa-play"></i> Watch Live</button>
        <a class="card-action secondary live-link" target="_blank" rel="noopener">
          <i class="fas fa-up-right-from-square"></i> Open Link
        </a>
      </div>
    </div>
  `;

  frame.querySelector('.live-player').appendChild(createLivePlayer(stream));
  frame.querySelector('h3').textContent = stream.title;
  frame.querySelector('p').textContent = stream.description || 'Watch this live stream now.';
  const watchBtn = frame.querySelector('button');
  watchBtn.addEventListener('click', event => {
    event.stopPropagation();
    openMediaPlayer(stream.id);
  });

  // Ensure keyboard activation from the inner button is consistent
  watchBtn.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    openMediaPlayer(stream.id);
  });

  frame.querySelector('.live-link').href = stream.url;
  frame.querySelector('.live-link').addEventListener('click', event => event.stopPropagation());
  frame.addEventListener('click', event => {
    if (event.target.closest('button, a, iframe, video')) return;
    openMediaPlayer(stream.id);
  });
  frame.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openMediaPlayer(stream.id);
  });
  return frame;
}

function createLivePlayer(stream) {
  const streamUrl = normalizeLiveUrl(stream.url);
  const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(streamUrl);

  if (isDirectVideo) {
    const video = document.createElement('video');
    video.src = streamUrl;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    return video;
  }

  const iframe = document.createElement('iframe');
  iframe.src = streamUrl;
  iframe.title = stream.title;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  return iframe;
}

function normalizeLiveUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${parsedUrl.searchParams.get('v')}?autoplay=1`;
    }

    if (parsedUrl.hostname.includes('youtube.com') && parsedUrl.pathname.startsWith('/live/')) {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean).pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  } catch (error) {
    return url;
  }

  return url;
}

function renderSection(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <i class="fas fa-inbox"></i>
        <p>No content yet</p>
        <small>Admin can add content from the dashboard</small>
      </div>
    `;
    return;
  }

  items.forEach(item => container.appendChild(createCard(item)));
}

function createCard(item) {
  const card = document.createElement('div');
  card.className = `card ${item.type === 'video' ? 'video-card' : ''} ${item.type === 'podcast' ? 'podcast-card' : ''}`;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${item.type === 'text' ? 'Read article' : 'Open'} ${item.title}`);
  card.addEventListener('click', event => {
    if (event.target.closest('button, a, audio, video, input, select, textarea')) return;
    openContentItem(item.id);
  });
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openContentItem(item.id);
  });

  card.appendChild(createCardMedia(item));

  const content = document.createElement('div');
  content.className = 'card-content';
  content.innerHTML = `
    <div class="card-type">${item.type === 'text' ? 'article' : item.type}</div>
    <div class="card-title"></div>
    <div class="metadata-line"></div>
    <div class="card-info"></div>
    <div class="card-meta">
      <span><i class="fas fa-calendar"></i> ${item.date}</span>
    </div>
  `;

  content.querySelector('.card-title').textContent = item.title;
  content.querySelector('.metadata-line').textContent = buildMetadataLine(item);
  content.querySelector('.card-info').appendChild(createCardInfo(item));
  card.appendChild(content);

  return card;
}

function createCardMedia(item) {
  const media = document.createElement('div');
  media.className = 'card-media';

  if (item.type === 'image') {
    const image = document.createElement('img');
    image.src = item.url;
    image.alt = item.title;
    image.onerror = () => {
      media.innerHTML = '<i class="fas fa-image"></i>';
    };
    media.appendChild(image);
    media.addEventListener('click', event => {
      event.stopPropagation();
      openMediaPlayer(item.id);
    });
    return media;
  }

  if (item.type === 'text' && Array.isArray(item.featuredImages) && item.featuredImages.length > 0) {
    media.classList.add('media-click-target');
    const image = document.createElement('img');
    image.src = item.featuredImages[0];
    image.alt = item.title;
    media.appendChild(image);
    media.appendChild(createMediaBadge('fas fa-book-open', 'Read article'));
    return media;
  }

  if (item.type === 'video') {
    media.classList.add('media-click-target');
    const video = document.createElement('video');
    video.src = item.url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    media.appendChild(video);
    media.appendChild(createMediaBadge('fas fa-play', 'Play video'));
    media.addEventListener('click', event => {
      event.stopPropagation();
      openMediaPlayer(item.id);
    });
    return media;
  }

  if (item.type === 'live') {
    media.classList.add('media-click-target');
    media.innerHTML = '<i class="fas fa-broadcast-tower"></i>';
    media.appendChild(createMediaBadge('fas fa-circle', 'Watch live'));
    return media;
  }

  media.classList.add('media-click-target');
  media.innerHTML = `<i class="${item.type === 'podcast' ? 'fas fa-microphone' : 'fas fa-file-alt'}"></i>`;
  media.appendChild(createMediaBadge(item.type === 'podcast' ? 'fas fa-headphones' : 'fas fa-book-open', item.type === 'podcast' ? 'Play episode' : 'Read article'));
  return media;
}

function createMediaBadge(icon, label) {
  const badge = document.createElement('span');
  badge.className = 'media-play-badge';
  badge.innerHTML = `<i class="${icon}"></i><span>${label}</span>`;
  return badge;
}

function createCardInfo(item) {
  const wrapper = document.createElement('div');

  if (item.type === 'text') {
    wrapper.innerHTML = `
      <small style="color: var(--text-light);"></small>
      <p class="card-text"></p>
      <div class="card-actions">
        <button class="card-action" type="button"><i class="fas fa-book-open"></i> Read</button>
        <button class="card-action secondary" type="button"><i class="fas fa-download"></i> Save</button>
      </div>
    `;
    wrapper.querySelector('small').textContent = `By ${item.author}`;
    wrapper.querySelector('.card-text').textContent = summarize(item.content);
    wrapper.querySelector('.card-action').addEventListener('click', () => showArticleDetail(item.id));
    wrapper.querySelector('.card-action.secondary').addEventListener('click', () => {
      app.currentDetailArticle = item;
      downloadArticle();
    });
    return wrapper;
  }

  if (item.type === 'image') {
    wrapper.innerHTML = `
      <small style="color: var(--text-light);"></small>
      <p class="card-text"></p>
      <button class="card-action" type="button"><i class="fas fa-expand"></i> View</button>
    `;
    wrapper.querySelector('small').textContent = `Photo by ${item.credit}`;
    wrapper.querySelector('.card-text').textContent = item.description || 'Image gallery item';
    wrapper.querySelector('.card-action').addEventListener('click', () => openMediaPlayer(item.id));
    return wrapper;
  }

  if (item.type === 'video') {
    wrapper.innerHTML = `
      <small style="color: var(--text-light);"></small>
      <p class="card-text"></p>
      <button class="card-action" type="button"><i class="fas fa-play"></i> Watch Reel</button>
    `;
    wrapper.querySelector('small').textContent = `Duration: ${item.duration}`;
    wrapper.querySelector('.card-text').textContent = summarize(item.description || 'Watch this reel.', 120);
    wrapper.querySelector('.card-action').addEventListener('click', () => openMediaPlayer(item.id));
    return wrapper;
  }

  if (item.type === 'podcast') {
    wrapper.innerHTML = `
      <small style="color: var(--text-light);"></small>
      <p class="card-text"></p>
      <button class="card-action" type="button"><i class="fas fa-headphones"></i> Play Episode</button>
    `;
    wrapper.querySelector('small').textContent = `Hosted by ${item.host} | ${item.duration}`;
    wrapper.querySelector('.card-text').textContent = summarize(item.description || 'Listen to this podcast episode.', 120);
    wrapper.querySelector('.card-action').addEventListener('click', () => openMediaPlayer(item.id));
    return wrapper;
  }

  if (item.type === 'live') {
    wrapper.innerHTML = `
      <small style="color: var(--text-light);">Live stream</small>
      <p class="card-text"></p>
      <button class="card-action" type="button"><i class="fas fa-broadcast-tower"></i> Watch Live</button>
    `;
    wrapper.querySelector('.card-text').textContent = summarize(item.description || 'Watch this live stream now.', 120);
    wrapper.querySelector('.card-action').addEventListener('click', () => openMediaPlayer(item.id));
    return wrapper;
  }

  return wrapper;
}

function summarize(text, limit = 100) {
  if (!text) return '';
  return text.length > limit ? `${text.substring(0, limit).trim()}...` : text;
}

function openContentItem(itemId) {
  const item = findContentItem(itemId);
  if (!item) return;

  if (item.type === 'text') {
    showArticleDetail(item.id);
    return;
  }

  openMediaPlayer(item.id);
}

function openMediaPlayer(itemId) {
  const item = findContentItem(itemId);
  if (!item) return;

  app.currentMediaItem = item;
  document.getElementById('mediaTypeLabel').textContent = item.type === 'video' ? 'Reel' : item.type === 'live' ? 'Live' : item.type;
  document.getElementById('mediaTitle').textContent = item.title;
  document.getElementById('mediaDescription').textContent = item.description || '';

  const player = document.getElementById('mediaPlayerContent');
  player.innerHTML = '';

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    player.appendChild(video);
    video.play().catch(() => {});
  } else if (item.type === 'live') {
    player.appendChild(createLivePlayer(item));
  } else if (item.type === 'podcast') {
    const audio = document.createElement('audio');
    audio.src = item.url;
    audio.controls = true;
    audio.autoplay = true;
    player.appendChild(audio);
    audio.play().catch(() => {});
  } else if (item.type === 'image') {
    const image = document.createElement('img');
    image.src = item.url;
    image.alt = item.title;
    player.appendChild(image);
  }

  renderRelatedContent(item, 'mediaRecommendations');
  document.getElementById('mediaPlayerModal').classList.add('active');
}

function closeMediaPlayer() {
  const player = document.getElementById('mediaPlayerContent');
  player.querySelectorAll('audio, video').forEach(media => media.pause());
  player.innerHTML = '';
  document.getElementById('mediaPlayerModal').classList.remove('active');
  app.currentMediaItem = null;
}
