(function(){
    console.log("External cookie consent script loaded.");
  
    // Utility function to set a cookie
    function setCookie(name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
      console.log("Set cookie:", name, value);
    }
  
    // Utility function to get a cookie by name
    function getCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
      }
      return null;
    }
  
    // Function to dynamically load the Google Analytics script
    function loadGoogleAnalytics() {
      console.log("Loading Google Analytics...");
      var script = document.createElement("script");
      script.async = true;
      // Replace G-K0PKCLTCVM with your actual GA tracking ID if needed
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-6YL7EGCQ7G";
      document.head.appendChild(script);
  
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-6YL7EGCQ7G', { 'anonymize_ip': true });
    }
  
    // Inject additional CSS for the button hover effect
    function addBannerStyles() {
      var style = document.createElement("style");
      style.innerHTML = "\
        #cookie-banner button { transition: background-color 0.3s; }\
        #cookie-banner button:hover { background-color: rgba(255, 100, 0, 0.8); }";
      document.head.appendChild(style);
    }
  
    // Function to create and display the cookie banner
    function createCookieBanner() {
      console.log("Creating cookie banner...");
      
      // Create banner container
      var banner = document.createElement("div");
      banner.id = "cookie-banner";
      
      // Set banner style: white background, black text, centered near bottom, spans 80% width, text centered
      banner.style.cssText = "font-family:'Inter', sans-serif; color:#000; background:#fff; padding:20px; position:fixed; bottom:10px; left:50%; transform:translateX(-50%); width:80%; text-align:center; box-shadow:0 10px 20px rgba(0,0,0,0.2); border-radius:5px; margin:0; z-index:1000000; box-sizing:border-box; line-height:1.6; display:block;";
      
      // Create text paragraph (centered by parent's text-align)
      var para = document.createElement("p");
      para.innerHTML = "This website uses cookies to ensure you get the best experience. " +
                       "<a href='https://cognicache.crd.co/#privacy' target='_blank' style='color:#FF6400; text-decoration:underline;'>Review Privacy Policy</a>";
      banner.appendChild(para);
      
      // Create a container for buttons, centered using flex
      var btnContainer = document.createElement("div");
      btnContainer.style.cssText = "margin-top:10px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;";
      
      // Create Accept button with increased width
      var acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.style.cssText = "font-family:'Inter', sans-serif; color:#000; background:#FF6400; border:none; padding:10px; width:45%; max-width:400px; cursor:pointer;";
      acceptBtn.onclick = function() {
        setCookie("cookieaccepted", "accepted", 365);
        banner.style.display = "none";
        console.log("Consent accepted.");
        loadGoogleAnalytics();
      };
      btnContainer.appendChild(acceptBtn);
      
      // Create Decline button with increased width
      var declineBtn = document.createElement("button");
      declineBtn.textContent = "Decline";
      declineBtn.style.cssText = "font-family:'Inter', sans-serif; color:#000; background:#FF6400; border:none; padding:10px; width:45%; max-width:400px; cursor:pointer;";
      declineBtn.onclick = function() {
        setCookie("cookieaccepted", "declined", 365);
        banner.style.display = "none";
        console.log("Consent declined.");
      };
      btnContainer.appendChild(declineBtn);
      
      banner.appendChild(btnContainer);
      document.body.appendChild(banner);
      console.log("Banner created and appended to DOM.");
      
      // Add CSS for button hover effects
      addBannerStyles();
    }
  
    // Initialize the consent process once the DOM is ready
    function initConsent() {
      console.log("DOM is ready. Checking for consent cookie...");
      if (!getCookie("cookieaccepted")) {
        createCookieBanner();
      } else {
        console.log("Consent cookie already set:", getCookie("cookieaccepted"));
        if (getCookie("cookieaccepted") === "accepted") {
          loadGoogleAnalytics();
        }
      }
    }
  
    // Run initConsent when the DOM is fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initConsent);
    } else {
      initConsent();
    }
  })();
