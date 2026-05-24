/************************************************************
███████████████████████████████████████████████████████████
█               NAVIGATION & SECTION SWITCHING              █
█             (Show/Hide Content Sections)                █
███████████████████████████████████████████████████████████
************************************************************/

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  
  // Find the clicked button and mark it as active
  document.querySelectorAll('.nav-tab').forEach(btn => {
    if (btn.getAttribute('onclick').includes(sectionId)) {
      btn.classList.add('active');
    }
  });
}

// Initialize active nav tab on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set the home section as default active
  const homeSection = document.getElementById('home');
  if (homeSection && !homeSection.classList.contains('active')) {
    homeSection.classList.add('active');
  }
  
  // Mark home button as active by default
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach((btn, index) => {
    if (index === 0) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
});
