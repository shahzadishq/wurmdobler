/* AW Elektrotechnik — "Angebot anfordern" popup (header CTA), like on the WordPress site.
   Fields as on the original popup; sending opens the visitor's e-mail program with a prepared message. */
(function () {
  "use strict";
  var MAIL = "info@wurmdobler-elektro.de";
  var triggers = document.querySelectorAll("[data-popup='anfrage']");
  if (!triggers.length) return;
  var base = document.querySelector("link[href$='premium/premium.css']").getAttribute("href").replace("premium/premium.css", "");

  var opts = ["Netzwerktechnik", "Sicherheitssysteme", "Planung und Ausführung", "Lichtsysteme", "Schaltschrankbau", "Kommunikationstechnik", "Smart Home Systeme"];
  var wrap = document.createElement("div");
  wrap.className = "pop";
  wrap.id = "popAnfrage";
  wrap.setAttribute("role", "dialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.setAttribute("aria-labelledby", "popTitle");
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<div class="pop-backdrop" data-pop-close></div>' +
    '<div class="pop-box" data-lenis-prevent>' +
      '<button class="pop-close" type="button" aria-label="Schließen" data-pop-close><span></span><span></span></button>' +
      '<div class="pop-head">' +
        '<span class="pop-logo"><span class="logo-anim"><img src="' + base + 'assets/logos/aw-logo.png" alt="" /><img class="logo-spark" src="' + base + 'assets/img/electricity-dark.gif" alt="" /></span></span>' +
        '<div><p class="pop-kicker">AW Elektrotechnik</p><h2 id="popTitle">Angebot <em>anfordern</em>.</h2></div>' +
      '</div>' +
      '<p class="pop-lead">Kostenlos &amp; unverbindlich — schildern Sie uns kurz Ihr Vorhaben, wir melden uns zeitnah.</p>' +
      '<form class="pop-form" novalidate>' +
        '<label class="pf-full"><span>Name</span><input type="text" name="name" autocomplete="name" /></label>' +
        '<label><span>E-Mail *</span><input type="email" name="email" required autocomplete="email" /></label>' +
        '<label><span>Telefon</span><input type="tel" name="telefon" autocomplete="tel" /></label>' +
        '<label><span>Adresse *</span><input type="text" name="adresse" required autocomplete="street-address" /></label>' +
        '<label><span>Stadt</span><input type="text" name="stadt" autocomplete="address-level2" /></label>' +
        '<label class="pf-full"><span>Leistung</span><select name="leistung">' + opts.map(function (o) { return "<option>" + o + "</option>"; }).join("") + '</select></label>' +
        '<label class="pf-full"><span>Ihr Kommentar</span><textarea name="kommentar" rows="3"></textarea></label>' +
        '<label class="pf-check pf-full"><input type="checkbox" name="dsgvo" required /><span>Ich habe die <a href="' + base + 'datenschutz/">Datenschutzerklärung</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Beantwortung meiner Anfrage einverstanden. *</span></label>' +
        '<div class="pf-foot pf-full"><button type="submit" class="btn-pill"><span>Angebot einholen</span><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></button><p class="pf-msg" role="status" aria-live="polite"></p></div>' +
      '</form>' +
    '</div>';
  document.body.appendChild(wrap);

  var form = wrap.querySelector("form"), msg = wrap.querySelector(".pf-msg"), lastFocus = null;
  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    document.body.classList.remove("menu-open");
    wrap.classList.add("is-open");
    wrap.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("pop-lock");
    if (window.__lenis) window.__lenis.stop();
    setTimeout(function () { var f = form.querySelector("input"); if (f) f.focus(); }, 350);
  }
  function close() {
    wrap.classList.remove("is-open");
    wrap.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("pop-lock");
    if (window.__lenis) window.__lenis.start();
    if (lastFocus) lastFocus.focus();
  }
  triggers.forEach(function (t) { t.addEventListener("click", open); });
  wrap.querySelectorAll("[data-pop-close]").forEach(function (c) { c.addEventListener("click", close); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wrap.classList.contains("is-open")) close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (f) {
      var bad = f.type === "checkbox" ? !f.checked : (!f.value.trim() || (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim())));
      (f.type === "checkbox" ? f.closest("label") : f).classList.toggle("is-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.className = "pf-msg err"; msg.textContent = "Bitte füllen Sie die markierten Felder aus."; return; }
    var d = new FormData(form);
    var subject = "Angebotsanfrage über die Website – " + d.get("leistung");
    var text = "Name: " + (d.get("name") || "–") + "\nE-Mail: " + d.get("email") + "\nTelefon: " + (d.get("telefon") || "–") +
      "\nAdresse: " + d.get("adresse") + "\nStadt: " + (d.get("stadt") || "–") + "\nLeistung: " + d.get("leistung") +
      "\n\nKommentar:\n" + (d.get("kommentar") || "–");
    window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
    msg.className = "pf-msg ok";
    msg.textContent = "Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Anfrage — bitte dort auf „Senden“ klicken.";
  });
  form.querySelectorAll("input, textarea").forEach(function (f) {
    f.addEventListener("input", function () { f.classList.remove("is-invalid"); var l = f.closest(".pf-check"); if (l) l.classList.remove("is-invalid"); });
  });
})();
