window.SIGNWELL_ANALYTICS = {
  enabled: true,
  endpoint: "https://script.google.com/macros/s/AKfycbzmZXZSepxCD1jbfpjMxsnvn0nRl-xEpeXdJoTO-TZL6Z5Zk7T-OsVGpTkIxWaCh-Y/exec"
};

window.SIGNWELL_NEWSLETTER = {
  enabled: true,
  endpoint: "https://script.google.com/macros/s/AKfycbzmZXZSepxCD1jbfpjMxsnvn0nRl-xEpeXdJoTO-TZL6Z5Zk7T-OsVGpTkIxWaCh-Y/exec"
};

// Email OTP v23.9.82: first send is frictionless; resend #2+ requires Cloudflare Turnstile.
// Set the site key here and set SW_TURNSTILE_SECRET in Apps Script Script Properties. Without it, resends fail closed.
window.SIGNWELL_TURNSTILE_SITE_KEY = window.SIGNWELL_TURNSTILE_SITE_KEY || "";
