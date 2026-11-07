/* Feedback Drawer config (library/features/review-widget, feature_version 1.5.0). Public: labels only, no data.
 *
 * Comments and answers go through window.HubAnswers (answers.js): one Firebase app, one sign-in, one set of rules
 * (firebase/firestore.rules, hubs/fivestar/...). The widget opens no connection of its own, so there is no FIREBASE_CONFIG.
 *   PAGE_PREFIX   names this hub in the comment store: every record's `page` is PAGE_PREFIX + route (+ ?tab=)
 *   HASH_ROUTES   the route for an empty hash; the chassis' render hook calls __rwRefresh (feedback.js), so it does not poll
 * Comments left before 7 Nov 2026 stayed in each reader's browser and were never shared, so nothing is carried over. */
window.HUB_REVIEW_CONFIG = {
  PAGE_PREFIX: 'fivestar-hub:',
  HASH_ROUTES: { defaultRoute: '/overview', hostRefresh: true },
  PAGE_RENAMES: {},
  DRAWER_RENAMES: {},
  REVIEW_LABELS: {
    toggleButton: 'Feedback', toggleButtonTitle: 'Open the Feedback Drawer', bannerTitle: 'Feedback · CRM Design Hub',
    sidebarTitle: 'Feedback Drawer', localOnly: 'Feedback stays in this browser', exit: 'Close feedback',
    hideSide: 'Hide drawer', showSide: 'Show drawer', notSignedIn: 'Not signed in', anonymous: 'Anonymous',
    modeQA: 'QA', modeAnswers: 'Q&A', scopePage: 'This screen', scopeAll: 'All screens', thisPage: 'This screen',
    tabOpen: 'Open', tabResolved: 'Resolved', tabToAnswer: 'To answer', tabAnswered: 'Answered',
    answeredOf: '{n} of {total} answered', filesLabel: 'files',
    emptyToAnswer: 'Every question is answered.', emptyAnswered: 'No answers yet.',
    empty: 'No comments on this screen yet. Hover any text and click + Comment.',
    add: '+ Comment', addTitle: 'Add a comment', editTitle: 'Edit the comment', save: 'Post comment', cancel: 'Cancel',
    edit: 'Edit', del: 'Delete', resolve: 'Resolve', reopen: 'Reopen', badgeOpen: 'open', badgeResolved: 'resolved',
    opens: 'opens ↗', edited: 'edited', resolvedBy: 'Resolved · {name}',
    resolvePrompt: 'Resolution note (what was done):', deleteConfirm: 'Delete this comment?',
    saveFailed: 'That could not be saved. Check the connection and try again.',
    placeholder: 'What needs to change here?', replacementPlaceholder: 'Suggested change (optional)…', namePrompt: 'Your name (shown next to your comments):'
  }
};
