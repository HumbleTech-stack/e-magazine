const ADMIN_CONFIG = {
  // Change these values to update the admin login from code.
  name: 'Admin',
  username: 'BLUE',
  password: 'admin123'
};

function openAdminLogin() {
  document.getElementById('adminOverlay').classList.add('active');
}

function closeAdminOverlay() {
  document.getElementById('adminOverlay').classList.remove('active');
  document.getElementById('adminUsername').value = '';
  document.getElementById('adminPassword').value = '';
}

function loginAdmin() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value;

  if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
    app.isAdminLoggedIn = true;
    sessionStorage.setItem('eMagazineAdmin', 'true');
    closeAdminOverlay();
    document.getElementById('adminDashboard').classList.add('active');
    renderAdminPostManager();
    alert(`Welcome back, ${ADMIN_CONFIG.name}!`);
  } else {
    alert('Invalid credentials. Check username and password.');
  }
}

function logoutAdmin() {
  app.isAdminLoggedIn = false;
  sessionStorage.removeItem('eMagazineAdmin');
  closeAdminDashboard();
  document.getElementById('adminOverlay').classList.add('active');
}

function closeAdminDashboard() {
  document.getElementById('adminDashboard').classList.remove('active');
  document.getElementById('adminFormContainer').style.display = 'none';
}

function initializeAdminPage() {
  if (sessionStorage.getItem('eMagazineAdmin') === 'true') {
    app.isAdminLoggedIn = true;
    document.getElementById('adminDashboard').classList.add('active');
    renderAdminPostManager();
  } else {
    document.getElementById('adminOverlay').classList.add('active');
  }

  if (typeof applySavedLogo === 'function') {
    applySavedLogo();
  }
}

document.addEventListener('DOMContentLoaded', initializeAdminPage);

function uploadSiteLogo(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file.');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    localStorage.setItem(LOGO_KEY, event.target.result);
    applySavedLogo();
    alert('Logo uploaded successfully!');
  };
  reader.readAsDataURL(file);
}

function removeSiteLogo() {
  localStorage.removeItem(LOGO_KEY);
  const input = document.getElementById('siteLogoFile');
  if (input) input.value = '';
  applySavedLogo();
}

function renderAdminPostManager() {
  const postList = document.getElementById('adminPostList');
  if (!postList) return;

  const posts = getAllContentItems();
  if (posts.length === 0) {
    postList.innerHTML = `
      <div class="admin-empty-posts">
        <i class="fas fa-folder-open"></i>
        <span>No posts published yet</span>
      </div>
    `;
    return;
  }

  postList.innerHTML = '';
  posts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'admin-post-item';
    item.innerHTML = `
      <span class="admin-post-icon"><i class="${getActivityIcon(post.type)}"></i></span>
      <span class="admin-post-copy">
        <strong></strong>
        <small></small>
      </span>
      <button class="btn btn-danger admin-delete-btn" type="button">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;

    item.querySelector('strong').textContent = post.title;
    item.querySelector('small').textContent = `${post.type === 'text' ? 'article' : post.type} | ${post.date}`;
    item.querySelector('button').addEventListener('click', () => deletePost(post.id));
    postList.appendChild(item);
  });
}

function deletePost(postId) {
  const post = findContentItem(postId);
  if (!post) return;

  const confirmed = confirm(`Delete "${post.title}"? This will remove it from the public site.`);
  if (!confirmed) return;

  Object.keys(app.content).forEach(type => {
    app.content[type] = app.content[type].filter(item => item.id !== postId);
  });

  app.activity = app.activity.filter(activity => activity.id !== postId);
  saveStoredData();
  renderAdminPostManager();

  if (typeof updateActivityFeed === 'function') updateActivityFeed();
  if (typeof closeDetailModal === 'function' && app.currentDetailArticle?.id === postId) closeDetailModal();
  if (typeof closeMediaPlayer === 'function' && app.currentMediaItem?.id === postId) closeMediaPlayer();
}
