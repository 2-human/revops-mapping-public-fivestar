/* Review widget config. No shared database, so comments stay in each reviewer's browser (local-only mode).
 * Giving the hub shared comments means creating a project for this engagement and putting its config here. */
window.HUB_REVIEW_CONFIG = {
  FIREBASE_CONFIG: {},
  PAGE_PREFIX: 'fivestar-hub:',
  REVIEW_LABELS: {
    toggleButton: 'Comments', toggleButtonTitle: 'Open comment review mode', bannerTitle: 'Review mode · Digital Estate Review',
    localOnly: 'Comments stay in this browser', exit: 'Exit review', sidebarTitle: 'Comments',
    empty: 'No comments on this screen yet. Hover any text and click the + to add one.', add: '+ Comment', save: 'Post comment', cancel: 'Cancel',
    edit: 'Edit', del: 'Delete', resolve: 'Resolve', reopen: 'Reopen', tabOpen: 'Open', tabResolved: 'Resolved', scopePage: 'This screen', scopeAll: 'All screens',
    thisPage: 'This screen', hideSide: 'Hide comments', showSide: 'Show comments', resolvePrompt: 'Resolution note (what was done):',
    placeholder: 'What needs to change here?', replacementPlaceholder: 'Suggested change (optional)…', namePrompt: 'Your name (shown next to your comments):'
  }
};
