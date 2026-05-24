const app = {
  isAdminLoggedIn: false,
  currentPreview: null,
  currentDetailArticle: null,
  currentMediaItem: null,
  activity: [],
  taxonomy: {
    categories: ['News', 'Culture', 'Lifestyle', 'Technology', 'Entertainment'],
    keywords: ['Feature', 'Interview', 'Opinion', 'Trending', 'Local']
  },
  content: {
    text: [],
    image: [],
    video: [],
    podcast: [],
    live: []
  }
};

const STORAGE_KEY = 'eMagazineContent';
const ACTIVITY_KEY = 'eMagazineActivity';
const TAXONOMY_KEY = 'eMagazineTaxonomy';
const LOGO_KEY = 'eMagazineLogo';
const ACTIVITY_EXPIRATION_HOURS = 24; // Activities expire after 24 hours

function loadStoredData() {
  try {
    const savedContent = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const savedActivity = JSON.parse(localStorage.getItem(ACTIVITY_KEY));

    if (savedContent) {
      app.content = {
        text: savedContent.text || [],
        image: savedContent.image || [],
        video: savedContent.video || [],
        podcast: savedContent.podcast || [],
        live: savedContent.live || []
      };
    }

    if (Array.isArray(savedActivity)) {
      // Ensure all activities have a createdAt timestamp
      app.activity = savedActivity.map(act => ({
        ...act,
        createdAt: act.createdAt || Date.now() // If missing, treat as just created (for backward compatibility)
      }));
    }

    const savedTaxonomy = JSON.parse(localStorage.getItem(TAXONOMY_KEY));
    if (savedTaxonomy) {
      app.taxonomy = {
        categories: savedTaxonomy.categories || app.taxonomy.categories,
        keywords: savedTaxonomy.keywords || app.taxonomy.keywords
      };
    }
  } catch (error) {
    console.warn('Saved magazine content could not be loaded.', error);
  }
}

function saveStoredData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(app.content));
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(app.activity));
}

function saveTaxonomyData() {
  localStorage.setItem(TAXONOMY_KEY, JSON.stringify(app.taxonomy));
}

function getSavedLogo() {
  return localStorage.getItem(LOGO_KEY);
}

function applySavedLogo() {
  const savedLogo = getSavedLogo();
  document.querySelectorAll('[data-site-logo], #adminLogoPreview').forEach(logo => {
    if (savedLogo) {
      logo.innerHTML = `<img src="${savedLogo}" alt="BlueCrest Multi-Media logo">`;
      logo.classList.add('has-image');
    } else {
      logo.textContent = 'BC';
      logo.classList.remove('has-image');
    }
  });
}

loadStoredData();
applySavedLogo();
