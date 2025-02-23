(function(){
  console.log("External cookie consent script loaded.");

  // Utility: Set a cookie
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

  // Utility: Get a cookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  function createBanner() {
    console.log("Creating cookie banner...");

    // Create container
    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.style.cssText = "font-family: 'Inter', sans-serif; color: #fff; background: #000; padding: 20px; position: fixed; bottom: 10px; left: 10px; width: 100%; max-width: 300px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); border-radius: 5px; margin: 0; z-index: 1000000; box-sizing: border-box; line-height: 1.6;";

    // Banner text and link
    var para = document.createElement("p");
    para.innerHTML = "This website uses cookies to ensure you get the best experience on our website. " +
      "<a href='https://andreas-t-bachmeier.github.io/cookie-policy.html' target='_blank' style='color: #FF6400; text-decoration: underline;'>Review Cookie Policy</a>";
    banner.appendChild(para);

    // Create buttons container
    var btnContainer = document.createElement("div");
    btnContainer.style.cssText = "margin-top:10px; display: flex; justify-content: space-between;";

    // Accept button
    var acceptBtn = document.createElement("button");
    acceptBtn.textContent = "Got it!";
    acceptBtn.style.cssText = "font-family: 'Inter', sans-serif; color: #fff; background: #FF6400; border: none; padding: 10px; width: 48%; cursor: pointer;";
    acceptBtn.onclick = function() {
      setCookie("mycookie_consent", "accepted", 365);
      banner.parentNode.removeChild(banner);
      console.log("Consent accepted externally.");
    };

    // Decline button
    var declineBtn = document.createElement("button");
    declineBtn.textContent = "Decline";
    declineBtn.style.cssText = "font-family: 'Inter', sans-serif; color: #fff; background: #FF6400; border: none; padding: 10px; width: 48%; cursor: pointer;";
    declineBtn.onclick = function() {
      setCookie("mycookie_consent", "declined", 365);
      banner.parentNode.removeChild(banner);
      console.log("Consent declined externally.");
    };

    btnContainer.appendChild(acceptBtn);
    btnContainer.appendChild(declineBtn);
    banner.appendChild(btnContainer);

    document.body.appendChild(banner);
    console.log("Banner created and appended.");
  }

  // When DOM is ready, run our banner logic
  if (document.readyState !== "loading") {
    runConsent();
  } else {
    document.addEventListener("DOMContentLoaded", runConsent);
  }

  function runConsent() {
    console.log("DOM is ready in external script.");
    if (!getCookie("mycookie_consent")) {
      createBanner();
    } else {
      console.log("Consent cookie already set:", getCookie("mycookie_consent"));
    }
  }
})();
