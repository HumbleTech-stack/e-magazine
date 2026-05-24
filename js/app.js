/************************************************************
███████████████████████████████████████████████████████████
█                  APPLICATION INITIALIZATION              █
█              (Run on Page Load)                         █
███████████████████████████████████████████████████████████
************************************************************/

// Initialize
if (typeof renderAllSections === 'function') {
  renderAllSections();
}

if (typeof updateActivityFeed === 'function') {
  updateActivityFeed();
}

if (typeof renderTaxonomyPanel === 'function') {
  renderTaxonomyPanel();
}
