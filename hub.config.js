/* Five Star review hub — widget config.
   Light cut (per review-widget FEATURE.md §"Composition profiles"): no auth,
   name-prompt on first comment, localStorage persistence.

   STORAGE: 'local' keeps comments in this browser only. No Firebase project is
   wired — credo-712c4 belongs to a different client and standing up a project
   for this engagement is a decision, not a default. Swap ADAPTER to 'rtdb' and
   fill FIREBASE_CONFIG to move to shared, multi-reviewer persistence. */
window.FIVESTAR_CONTACT_CONFIG = {
  ADAPTER: 'local',
  STORAGE_KEY: 'fsi_review_comments_v1',
  FIREBASE_CONFIG: null,

  commentLifecycleMode: 'full',        // Apply / Edit / Archive / Restore / Delete
  commentableContent: 'allowlist',
  chromeAnchored: false,               // sidebar is <nav> — deliberately not anchored
  anchorEmpty: ['td'],                 // data grids: let a reviewer flag an empty cell
  ANCHOR_TAGS_EXTRA: ['blockquote', 'figcaption'],

  REVIEW_LABELS: {
    bannerTitle:  'Review mode',
    bannerHint:   'Click any element to comment on it',
    exit:         'Exit review',
    sidebarTitle: 'Comments',
    empty:        'No comments yet. Click anything on the page to start.',
    add:          'Add comment',
    save:         'Save',
    cancel:       'Cancel',
    apply:        'Apply',
    edit:         'Edit',
    archive:      'Archive',
    restore:      'Restore',
    del:          'Delete',
    namePrompt:   'Your name (shown next to your comments)',
    placeholder:  'What needs to change here?',
    replacement:  'Suggested replacement (optional)',
    selected:     'Selected element',
    countOne:     '{n} comment',
    countMany:    '{n} comments',
    statusPending:  'Open',
    statusApplied:  'Applied',
    statusArchived: 'Archived'
  }
};
