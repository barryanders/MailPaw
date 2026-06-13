/* --- BACKGROUND PROCESS --- */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('MailPaw installed. Open Gmail to use direct insertion.');
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || request.source !== 'zt-billing') return;
  sendResponse({ ok: false, error: 'billing disabled' });
});
