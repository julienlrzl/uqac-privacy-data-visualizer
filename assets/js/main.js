/**
 * Main JavaScript - Navigation & UI Interactions (Placeholder)
 * No actual data tracking or storage - UI only
 */

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Highlight active page in navigation
  highlightActivePage();

  // Placeholder button handlers (non-functional)
  setupPlaceholderButtons();
});

/**
 * Highlight the active page in navigation
 */
function highlightActivePage() {
  const currentPath = window.location.pathname;
  const navLinkElements = document.querySelectorAll('.nav-links a');

  navLinkElements.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || (currentPath.endsWith('/') && linkPath.includes('index.html'))) {
      link.classList.add('active');
    }
  });
}

/**
 * Setup placeholder buttons (non-functional)
 * These buttons don't do anything - they're UI placeholders
 */
function setupPlaceholderButtons() {
  // Reset buttons
  const resetButtons = document.querySelectorAll('[data-action="reset"]');
  resetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showPlaceholderMessage('Fonctionnalité "Reset" à implémenter');
    });
  });

  // Compare buttons
  const compareButtons = document.querySelectorAll('[data-action="compare"]');
  compareButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showPlaceholderMessage('Fonctionnalité "Comparer" à implémenter');
    });
  });

  // Cookie consent options (visual only)
  const consentOptions = document.querySelectorAll('input[name="consent"]');
  consentOptions.forEach(option => {
    option.addEventListener('change', (e) => {
      console.log('[UI Placeholder] Option sélectionnée:', e.target.value);
      // No actual logic - just visual feedback
    });
  });
}

/**
 * Show a placeholder message (temporary alert)
 */
function showPlaceholderMessage(message) {
  // Simple alert for now - could be replaced with a nicer modal later
  alert(`[UI Placeholder]\n\n${message}\n\nCette action sera implémentée dans une version ultérieure.`);
}

/**
 * Simulate adding a console log entry (visual only - static content)
 */
function addConsoleEntry(timestamp, event, value) {
  // This function exists for future use but doesn't manipulate DOM
  // All console entries are static HTML in the pages
  console.log('[UI Placeholder] Console entry:', { timestamp, event, value });
}
