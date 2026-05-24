function normalizeTerm(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildMetadataFields() {
  const categoryOptions = app.taxonomy.categories
    .map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join('');
  const keywordOptions = app.taxonomy.keywords
    .map(keyword => `
      <label class="keyword-choice">
        <input type="checkbox" name="contentKeywords" value="${escapeHtml(keyword)}">
        <span>${escapeHtml(keyword)}</span>
      </label>
    `)
    .join('');

  return `
    <div class="metadata-panel">
      <div class="form-group">
        <label>Category Required</label>
        <select id="contentCategory">
          <option value="">Choose a category</option>
          ${categoryOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Tags / Keywords Required</label>
        <div class="keyword-grid">${keywordOptions}</div>
      </div>
    </div>
  `;
}

function getContentMetadata() {
  const category = document.getElementById('contentCategory')?.value || '';
  const keywords = Array.from(document.querySelectorAll('input[name="contentKeywords"]:checked'))
    .map(input => input.value);

  if (!category) {
    alert('Please choose a category before publishing.');
    return null;
  }

  if (keywords.length === 0) {
    alert('Please choose at least one tag/keyword before publishing.');
    return null;
  }

  return { category, keywords };
}

function addCategory() {
  const input = document.getElementById('newCategoryInput');
  const category = normalizeTerm(input.value);
  if (!category) return;

  if (!app.taxonomy.categories.some(item => item.toLowerCase() === category.toLowerCase())) {
    app.taxonomy.categories.push(category);
    app.taxonomy.categories.sort();
    saveTaxonomyData();
    renderTaxonomyPanel();
  }

  input.value = '';
}

function addKeyword() {
  const input = document.getElementById('newKeywordInput');
  const keyword = normalizeTerm(input.value);
  if (!keyword) return;

  if (!app.taxonomy.keywords.some(item => item.toLowerCase() === keyword.toLowerCase())) {
    app.taxonomy.keywords.push(keyword);
    app.taxonomy.keywords.sort();
    saveTaxonomyData();
    renderTaxonomyPanel();
  }

  input.value = '';
}

function removeCategory(category) {
  if (app.taxonomy.categories.length <= 1) {
    alert('Keep at least one category available.');
    return;
  }
  app.taxonomy.categories = app.taxonomy.categories.filter(item => item !== category);
  saveTaxonomyData();
  renderTaxonomyPanel();
}

function removeKeyword(keyword) {
  if (app.taxonomy.keywords.length <= 1) {
    alert('Keep at least one keyword available.');
    return;
  }
  app.taxonomy.keywords = app.taxonomy.keywords.filter(item => item !== keyword);
  saveTaxonomyData();
  renderTaxonomyPanel();
}

function renderTaxonomyPanel() {
  const categoryList = document.getElementById('categoryList');
  const keywordList = document.getElementById('keywordList');
  if (!categoryList || !keywordList) return;

  categoryList.innerHTML = '';
  keywordList.innerHTML = '';

  app.taxonomy.categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'taxonomy-chip';
    button.type = 'button';
    button.innerHTML = '<span></span> <i class="fas fa-times"></i>';
    button.querySelector('span').textContent = category;
    button.addEventListener('click', () => removeCategory(category));
    categoryList.appendChild(button);
  });

  app.taxonomy.keywords.forEach(keyword => {
    const button = document.createElement('button');
    button.className = 'taxonomy-chip';
    button.type = 'button';
    button.innerHTML = '<span></span> <i class="fas fa-times"></i>';
    button.querySelector('span').textContent = keyword;
    button.addEventListener('click', () => removeKeyword(keyword));
    keywordList.appendChild(button);
  });
}
