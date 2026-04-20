// Vercel Web Analytics Initialization
// This script initializes Vercel Web Analytics for tracking page views and user interactions

(function() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Initialize Vercel Analytics using the inject function
  // This will automatically track page views and web vitals
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
  
  // Create and inject the analytics script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  
  // Append to document head
  var firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
  
  console.log('✅ Vercel Analytics initialized');
})();
