(function(){
  console.log("External cookie consent script loaded.");

  // Utility function: setCookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
    console.log("Set cookie:", name, value);
  }

  // Utility function: getCookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  // Initialize banner when DOM is ready
  document.addEventListener("DOMContentLoaded", function(){
    console.log("DOM fully loaded (external script).");

    // Only display if the cookie "mycookie_consent" is not set
    if (!getCookie("mycookie_consent")) {
      // Create banner element
      var banner = document.createElement("p");
      banner.id = "cookie-notice";
      banner.style.cssText = "font-family:'Inter', sans-serif; color:#fff; background:#000; padding:20px; position:fixed; bottom:10px; left:10px; width:100%; max-width:300px; box-shadow:0 10px 20px rgba(0,0,0,0.2); border-radius:5px; margin:0; z-index:1000000; box-sizing:border-box; line-height:1.6; visibility:visible;";
      
      // Banner content (you can adjust as needed)
      banner.innerHTML = "This website uses cookies to ensure you get the best experience on our website. " +
        "<a href='https://andreas-t-bachmeier.github.io/cookie-policy.html' target='_blank' style='color:#FF6400; text-decoration:underline;'>Review Cookie Policy</a><br/>" +
        "<button id='accept-btn' style='font-family:Inter, sans-serif; color:#fff; background:#FF6400; border:0; padding:10px; width:100%; cursor:pointer;'>Got it!</button>" +
        "<button id='decline-btn' style='font-family:Inter, sans-serif; color:#fff; background:#FF6400; border:0; padding:10px; width:100%; cursor:pointer; margin-top:10px;'>Decline</button>";

      document.body.appendChild(banner);
      console.log("Banner created externally.");

      // Attach event listeners
      document.getElementById("accept-btn").addEventListener("click", function(){
        setCookie("mycookie_consent", "accepted", 365);
        banner.style.visibility = "hidden";
        console.log("Consent accepted externally.");
      });
      document.getElementById("decline-btn").addEventListener("click", function(){
        setCookie("mycookie_consent", "declined", 365);
        banner.style.visibility = "hidden";
        console.log("Consent declined externally.");
      });
    } else {
      console.log("Consent cookie already set externally:", getCookie("mycookie_consent"));
    }
  });
})();