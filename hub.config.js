/* Five Star CRM design hub: the thin config (library/features/hub-chassis 1.2.0). Identity, tokens, labels, file lists and
 * storage prefix, nothing else. Navigation, text and figures are in data/; layout is in views.js; the rest of the look is in
 * skin.css. This file is public: it names no system and no person.
 *
 * The one ordered file list: locally gate.js loads data, then views, as files; on the public mirror
 * tools/fivestar-hub/publish.sh encrypts exactly data + views into data/bundle.enc and gate.js runs them from there. */
window.HUB_CONFIG = {
  id: 'fivestar-hub',
  title: 'Five Star · CRM Design Hub',
  lang: 'en',
  locale: 'en-US',
  currency: 'USD',
  home: '/overview',
  brand: { name: 'Five Star', sub: 'CRM Design Hub', logo: '<i class="star" aria-hidden="true">★</i>',
    favicon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>★</text></svg>" },
  fonts: { body: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif' },
  tokens: {
    accent: '#1f6feb',      /* primary-deep */
    bg: '#ffffff',          /* surface-base */
    soft: '#f7f9fb',        /* surface-tint: table heads, hover rows */
    line: '#e2e7ec',        /* rule */
    ink: '#0f1720',         /* text-default */
    mute: '#5c6b7a',        /* text-soft */
    head: '#0f1720',        /* neutral-deep */
    accentSoft: '#e8f0fe',
    ok: '#0f7b4f', okBg: '#e6f4ee', warn: '#9a6700', warnBg: '#fff4d6', bad: '#b42318', badBg: '#fdeceb',
    s1: '#1f6feb', s2: '#b42318', s3: '#0f7b4f', s4: '#b8730a', s5: '#8250df'
  },
  chips: [{ text: 'Working draft' }],
  storage: { prefix: 'fs-hub' },
  modules: ['group-filter', 'charts'],
  data: ['review.config.js', 'data/pages.js', 'data/entities.js', 'data/topics.js', 'data/org.js', 'data/board.js', 'data/design.js', 'data/portal.js', 'data/hub.js'],
  views: ['feedback.js', 'views.js'],
  labels: {
    /* the sign-in gate (gate.js): the only words a signed-out visitor sees, so they live here, not in the bundle */
    gateTitle: 'CRM Design Hub',
    gatePrompt: 'Five Star · sign in with your work email. We send you a link that opens the hub.',
    gateEmail: 'Work email',
    gateSend: 'Email me a sign-in link',
    gateSending: 'Sending…',
    gateSent: 'Check your inbox for a sign-in link and open it in this browser. It comes from the sign-in service, so look in spam if it is not there.',
    gateNotListed: 'That address is not on the account list.',
    gateSendFailed: 'The link could not be sent. Try again.',
    gateLinkFailed: 'That sign-in link did not work. It may have expired or been used already. Ask for a new one.',
    gateNoAccess: '{email} is signed in, but this account does not have access to the hub.',
    gateSignOut: 'Sign out',
    gateOpenFailed: 'The hub could not be opened. Reload the page, or sign out and in again.',
    gateUnavailable: 'The hub is not available right now.',
    signInConfirmEmail: 'Confirm your email address to finish signing in',
    /* the account line and the Answer tab (feedback.js, answers.js) */
    acctSignedIn: 'Signed in as {email}',
    acctSignIn: 'Sign in',
    acctSignOut: 'Sign out',
    acctTitle: 'Your account',
    acctRole: 'Access',
    acctEmail: 'Email',
    acctNone: 'This account has no access to the hub.',
    acctLocal: 'This copy of the hub runs without accounts.',
    roleAdmin: 'Admin: comments, answers and the account list',
    roleTeam: 'Team: comments and answers',
    roleClient: 'Client: read the hub and answer the questions',
    qaTab: 'Answer',
    qaLabel: 'Your answer',
    qaFiles: 'Files',
    qaAddFiles: 'Add files',
    qaSave: 'Save answer',
    qaSaved: 'Saved',
    qaSaving: 'Saving…',
    qaSaveFailed: 'That could not be saved. Check the connection and try again.',
    qaRemove: 'Remove',
    qaBy: 'Last saved by {name} on {date}',
    qaNone: 'No answer yet.',
    qaSignIn: 'Sign in to answer this question.',
    qaNoRole: 'This account cannot answer questions.',
    qaLocal: 'Answers saved here stay in this browser.',
    qaTooBig: '{name} is over 50 MB and was not added.',
    qaAnswered: 'Answered',
    siSend: 'Email me a sign-in link',
    siNote: 'The link opens the hub signed in.',
    /* chassis words that differ from its defaults */
    groupFilter: 'Filter by brand'
  }
};
