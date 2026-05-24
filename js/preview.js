/************************************************************
███████████████████████████████████████████████████████████
█           PREVIEW & DOWNLOAD FUNCTIONALITY                █
█      (Show Preview Before Publishing & Downloads)       █
███████████████████████████████████████████████████████████
************************************************************/

async function previewArticle(type) {
  let item = {};

  switch(type) {
    case 'text':
      const title = document.getElementById('textTitle').value.trim();
      const content = document.getElementById('textContent').value.trim();
      const author = document.getElementById('textAuthor').value.trim();
      const articleImageFiles = document.getElementById('articleImages')?.files || [];
      
      if (!title || !content) {
        alert('Please fill in title and content');
        return;
      }
      const metadata = getContentMetadata();
      if (!metadata) return;
      
      item = {
        type: 'text',
        title: title,
        content: content,
        author: author || 'Anonymous',
        featuredImages: await readFilesAsDataUrls(articleImageFiles),
        category: metadata.category,
        keywords: metadata.keywords
      };
      break;
  }

  // Store preview data
  app.currentPreview = item;

  // Show preview modal
  const previewModal = document.getElementById('previewModal');
  const previewContent = document.getElementById('previewContent');

  let previewHtml = '';
  
  if (type === 'text') {
    previewHtml = `
      <div style="border-bottom: 2px solid var(--border); padding-bottom: 15px; margin-bottom: 15px;">
        <h3 id="previewArticleTitle" style="font-size: 24px; margin-bottom: 10px; color: var(--primary);"></h3>
        <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-light);">
          <span><i class="fas fa-user-circle"></i> <span id="previewArticleAuthor"></span></span>
          <span><i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <div class="metadata-line" id="previewMetadataLine"></div>
      </div>
      <div id="previewArticleImages" class="article-image-strip"></div>
      <div id="previewArticleBody" style="line-height: 1.8; font-size: 14px; white-space: pre-wrap;"></div>
    `;
  }

  previewContent.innerHTML = previewHtml;
  if (type === 'text') {
    document.getElementById('previewArticleTitle').textContent = item.title;
    document.getElementById('previewArticleAuthor').textContent = item.author;
    document.getElementById('previewArticleBody').textContent = item.content;
    document.getElementById('previewMetadataLine').textContent = `${item.category} | ${item.keywords.join(', ')}`;
    renderArticleImages(item.featuredImages, 'previewArticleImages');
  }
  previewModal.classList.add('active');
}

function closePreviewModal() {
  document.getElementById('previewModal').classList.remove('active');
  app.currentPreview = null;
}

function publishContent() {
  if (!app.currentPreview) return;

  const item = {
    id: Date.now(),
    type: app.currentPreview.type,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };

  // Add all preview data to item
  Object.assign(item, app.currentPreview);

  // Add to content
  app.content[item.type].unshift(item);

  // Track activity
  addActivity(item);
  saveStoredData();

  // Render sections
  if (typeof renderAllSections === 'function') renderAllSections();
  updateActivityFeed();
  if (typeof renderAdminPostManager === 'function') renderAdminPostManager();

  // Close preview modal
  closePreviewModal();

  // Reset form
  if (item.type === 'text') {
    document.getElementById('textTitle').value = '';
    document.getElementById('textContent').value = '';
    document.getElementById('textAuthor').value = '';
    document.getElementById('articleImages').value = '';
  }

  document.getElementById('adminFormContainer').style.display = 'none';
  alert('✅ Content published successfully!');
}

function addActivity(item) {
  const activity = {
    id: item.id,
    type: item.type,
    title: item.title,
    icon: getActivityIcon(item.type),
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    date: item.date,
    createdAt: Date.now() // Store timestamp in milliseconds for expiration tracking
  };
  
  app.activity.unshift(activity);
  
  // Keep only last 10 activities
  if (app.activity.length > 10) {
    app.activity.pop();
  }
}

function getActivityIcon(type) {
  switch(type) {
    case 'text': return 'fas fa-file-alt';
    case 'image': return 'fas fa-image';
    case 'video': return 'fas fa-video';
    case 'podcast': return 'fas fa-microphone';
    case 'live': return 'fas fa-broadcast-tower';
    default: return 'fas fa-plus';
  }
}

function updateActivityFeed() {
  const activityFeed = document.getElementById('activityFeed');
  if (!activityFeed) return;

  if (app.activity.length === 0) {
    activityFeed.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-light);">
        <i class="fas fa-circle-notch" style="font-size: 30px; opacity: 0.3; margin-bottom: 10px; display: block;"></i>
        No recent activity yet
      </div>
    `;
    return;
  }

  activityFeed.innerHTML = app.activity.map(act => `
    <div style="background: rgba(102, 126, 234, 0.1); border-left: 4px solid var(--primary); padding: 12px 15px; border-radius: 8px; display: flex; align-items: center; gap: 12px; transition: all 0.3s ease;">
      <i class="${act.icon}" style="font-size: 20px; color: var(--primary);"></i>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 13px; text-transform: capitalize;">${act.type} Published</div>
        <div style="font-size: 12px; color: var(--text-light);">${act.title}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: rgba(255,255,255,0.5);">
        <div>${act.date}</div>
        <div>${act.timestamp}</div>
      </div>
    </div>
  `).join('');
}

// Check if an activity has expired (older than 24 hours)
function isActivityExpired(createdAt) {
  if (!createdAt) return false;
  const now = Date.now();
  const expirationTime = ACTIVITY_EXPIRATION_HOURS * 60 * 60 * 1000; // Convert hours to milliseconds
  return (now - createdAt) > expirationTime;
}

// Get non-expired activities
function getNonExpiredActivities() {
  return app.activity.filter(act => !isActivityExpired(act.createdAt));
}

// Move expired activities to history
function handleExpiredActivities() {
  const validActivities = getNonExpiredActivities();
  const expiredActivities = app.activity.filter(act => isActivityExpired(act.createdAt));
  
  // Update activity list with only non-expired items
  app.activity = validActivities;
  
  // Note: Expired activities are simply removed, not moved to history
  // as they are just notifications of when content was published
  // The actual content items remain in their respective sections
}

// Render activities as frames (similar to reels)
function renderActivityFrames() {
  handleExpiredActivities(); // Clean up expired activities first
  
  const section = document.getElementById('activitiesSection');
  const row = document.getElementById('activitiesFrameRow');
  if (!section || !row) return;

  const currentActivities = getNonExpiredActivities();
  row.innerHTML = '';

  if (currentActivities.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  currentActivities.forEach(activity => row.appendChild(createActivityFrame(activity)));
}

// Create an activity frame card
function createActivityFrame(activity) {
  const frame = document.createElement('article');
  frame.className = 'live-frame';
  frame.tabIndex = 0;
  frame.setAttribute('role', 'button');
  frame.setAttribute('aria-label', `Activity: ${activity.title}`);
  
  // Find the actual content item to get more details
  const contentItem = getAllContentItems().find(item => item.id === activity.id);
  
  frame.innerHTML = `
    <div class="activity-icon-display">
      <i class="${activity.icon}"></i>
    </div>
    <div class="activity-info">
      <span class="activity-type-badge">${activity.type}</span>
      <h3></h3>
      <p></p>
      <div class="activity-meta">
        <span><i class="fas fa-calendar"></i> ${activity.date}</span>
        <span><i class="fas fa-clock"></i> ${activity.timestamp}</span>
      </div>
      <div class="activity-actions">
        <button class="card-action" type="button"><i class="fas fa-eye"></i> View</button>
      </div>
    </div>
  `;

  frame.querySelector('h3').textContent = activity.title;
  frame.querySelector('p').textContent = contentItem ? (contentItem.description || contentItem.content || contentItem.author || 'View this content') : 'View this activity';
  
  const viewBtn = frame.querySelector('button');
  viewBtn.addEventListener('click', event => {
    event.stopPropagation();
    if (contentItem) {
      openContentItem(contentItem.id);
    }
  });

  viewBtn.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    if (contentItem) {
      openContentItem(contentItem.id);
    }
  });

  frame.addEventListener('click', event => {
    if (event.target.closest('button, a, input')) return;
    if (contentItem) {
      openContentItem(contentItem.id);
    }
  });

  frame.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (contentItem) {
      openContentItem(contentItem.id);
    }
  });

  return frame;
}

// DETAILED VIEW & DOWNLOAD

function showArticleDetail(itemId) {
  const item = app.content.text.find(t => t.id === itemId);
  if (!item) return;

  app.currentDetailArticle = item;

  const detailTitle = document.getElementById('detailTitle');
  const detailContent = document.getElementById('detailContent');

  detailTitle.textContent = item.title;

  detailContent.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-light); margin-bottom: 15px;">
        <span><i class="fas fa-user-circle"></i> By <span id="detailAuthor"></span></span>
        <span><i class="fas fa-calendar"></i> <span id="detailDate"></span></span>
      </div>
      <div class="metadata-line" id="detailMetadataLine"></div>
      <hr style="border: none; border-top: 1px solid var(--border); margin: 15px 0;">
    </div>
    <div id="detailArticleImages" class="article-image-strip"></div>
    <div id="detailArticleBody" style="line-height: 1.8; font-size: 14px; white-space: pre-wrap;"></div>
  `;
  document.getElementById('detailAuthor').textContent = item.author;
  document.getElementById('detailDate').textContent = item.date;
  document.getElementById('detailMetadataLine').textContent = buildMetadataLine(item);
  renderArticleImages(item.featuredImages, 'detailArticleImages');
  document.getElementById('detailArticleBody').textContent = item.content;
  renderRelatedContent(item, 'articleRecommendations');

  document.getElementById('articleDetailModal').classList.add('active');
}

function renderArticleImages(images, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const imageList = Array.isArray(images) ? images : [];
  if (imageList.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = imageList.map((src, index) => `
    <img src="${src}" alt="Article featured image ${index + 1}">
  `).join('');
}

function closeDetailModal() {
  document.getElementById('articleDetailModal').classList.remove('active');
  app.currentDetailArticle = null;
}

function downloadArticle() {
  if (!app.currentDetailArticle) return;

  const item = app.currentDetailArticle;
  const content = `
${item.title}
${'='.repeat(item.title.length)}

By: ${item.author}
Date: ${item.date}

${'-'.repeat(50)}

${item.content}
  `.trim();

  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', `${item.title.replace(/\s+/g, '_')}.txt`);
  element.style.display = 'none';
  
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  alert('Article downloaded as text file!');
}
