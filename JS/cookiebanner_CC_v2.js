
(function () {
  console.log("[consent] Script loaded");

  /* ========== Cookie utils ========== */
  function setCookie(name, value, days){
    var expires = "";
    if (days){
      var d = new Date();
      d.setTime(d.getTime() + days*24*60*60*1000);
      expires = "; expires=" + d.toUTCString();
    }
    var secure = (location.protocol === "https:") ? "; Secure" : "";
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + secure;
    console.log("[consent] Set cookie:", name, value);
  }
  function getCookie(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i=0; i<ca.length; i++){
      var c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  /* ========== Tag loaders (after consent) ========== */
  function loadGoogleAnalytics(){
    if (window._ccGALoaded) { console.log("[consent] GA4 already loaded"); return; }
    console.log("[consent] Loading GA4…");
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-6YL7EGCQ7G"; // <-- your GA4 ID
    s.onload = function(){ console.log("[consent] GA4 library loaded"); };
    s.onerror = function(e){ console.warn("[consent] GA4 load error", e); };
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());
    gtag('config', 'G-6YL7EGCQ7G', { anonymize_ip: true });
    window._ccGALoaded = true;
  }

  function loadLinkedIn(){
    if (window._ccLiLoaded) { console.log("[consent] LinkedIn already loaded"); return; }
    console.log("[consent] Loading LinkedIn Insight Tag…");
    // Set BOTH variables (some versions rely on the global)
    window._linkedin_partner_id = "7875210"; // <-- confirm your partner ID
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(window._linkedin_partner_id);

    var firstScript = document.getElementsByTagName("script")[0];
    var tag = document.createElement("script");
    tag.type = "text/javascript";
    tag.async = true;
    tag.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    tag.onload = function(){
      console.log("[consent] LinkedIn tag loaded. lintrk =", typeof window.lintrk);
    };
    tag.onerror = function(e){
      console.warn("[consent] LinkedIn tag load error", e);
    };
    firstScript.parentNode.insertBefore(tag, firstScript);
    window._ccLiLoaded = true;
  }

  function loadMarketingTags(){
    if (window._ccTagsLoaded) { console.log("[consent] Tags already loaded; skipping"); return; }
    console.log("[consent] Loading all consented tags…");
    loadGoogleAnalytics();
    loadLinkedIn();
    window._ccTagsLoaded = true;
  }

  /* ========== Banner UI ========== */
  function addBannerStyles(){
    var style = document.createElement("style");
    style.textContent =
      "#cookie-banner{font-family:Inter,system-ui,sans-serif;color:#000;background:#fff;padding:20px;position:fixed;bottom:10px;left:50%;transform:translateX(-50%);width:80%;max-width:880px;text-align:center;box-shadow:0 10px 20px rgba(0,0,0,.2);border-radius:8px;z-index:1000000;line-height:1.6}" +
      "#cookie-banner p{margin:0 0 10px}" +
      "#cookie-banner .btns{margin-top:10px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap}" +
      "#cookie-banner button{transition:background-color .3s;color:#000;background:#FF6400;border:none;padding:10px 14px;min-width:140px;cursor:pointer;border-radius:8px;font-weight:600}" +
      "#cookie-banner button:hover{background-color:rgba(255,100,0,.85)}" +
      "#cookie-banner a{color:#FF6400;text-decoration:underline}";
    document.head.appendChild(style);
  }

  function createCookieBanner(){
    console.log("[consent] Creating banner…");
    addBannerStyles();

    var banner = document.createElement("div");
    banner.id = "cookie-banner";

    var p = document.createElement("p");
    p.innerHTML = "This website uses cookies for analytics/ads <strong>only after your consent</strong>. " +
                  "<a href='https://cognicache.crd.co/#privacy' target='_blank' rel='noopener'>Privacy Policy</a>";
    banner.appendChild(p);

    var btns = document.createElement("div");
    btns.className = "btns";

    var accept = document.createElement("button");
    accept.textContent = "Accept";
    accept.onclick = function(){
      console.log("[consent] Accept clicked");
      setCookie("cookieaccepted","accepted",365);
      banner.remove();
      loadMarketingTags();
    };

    var decline = document.createElement("button");
    decline.textContent = "Decline";
    decline.onclick = function(){
      console.log("[consent] Decline clicked");
      setCookie("cookieaccepted","declined",365);
      banner.remove();
      // No tags loaded
    };

    btns.appendChild(accept);
    btns.appendChild(decline);
    banner.appendChild(btns);
    document.body.appendChild(banner);

    console.log("[consent] Banner appended");
  }

  /* ========== Init ========== */
  function initConsent(){
    console.log("[consent] Init. Checking cookie…");
    var c = getCookie("cookieaccepted");
    if (!c){
      createCookieBanner();
    } else if (c === "accepted"){
      console.log("[consent] Prior consent found → load tags");
      loadMarketingTags();
    } else {
      console.log("[consent] Prior decline found → do not load tags");
    }
  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initConsent);
  } else {
    initConsent();
  }
})();

