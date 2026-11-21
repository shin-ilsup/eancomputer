/* 이안컴퓨터 가좌점 — page interactions */
(function () {
  "use strict";

  var STORE = {
    phone: "0325779505",
    mobile: "01090924849",
    mail: "evrc130@naver.com"
  };

  /* ── 1. 헤더 스크롤 상태 ─────────────────────────────── */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── 2. 모바일 메뉴 ─────────────────────────────────── */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "메뉴 열기");
      }
    });
  }

  /* ── 3. 오늘 영업시간 표시 ──────────────────────────── */
  (function todayHours() {
    var target = document.getElementById("todayHours");
    var sub = document.querySelector(".hero-card-sub");
    var label = document.querySelector(".hero-card-label");
    var status = document.getElementById("openStatus");
    if (!target) return;

    var now = new Date();
    var day = now.getDay(); // 0=일
    var mins = now.getHours() * 60 + now.getMinutes();
    var open = (day >= 1 && day <= 5 && mins >= 570 && mins < 1140) ||
               (day === 6 && mins >= 570 && mins < 1020);

    if (label && status) {
      label.classList.toggle("is-open", open);
      status.textContent = open ? "지금 영업 중" : "오늘 영업시간";
    }

    if (day === 0) {
      target.textContent = "오늘은 휴무입니다";
      if (sub) sub.textContent = "일요일 휴무 · 월요일 09:30 오픈";
    } else if (day === 6) {
      target.textContent = "토요일 09:30 ~ 17:00";
      if (sub) sub.textContent = "일요일 휴무 · 평일 09:30 ~ 19:00";
    } else {
      target.textContent = "월~금 09:30 ~ 19:00";
      if (sub) sub.textContent = "토 09:30 ~ 17:00 · 일요일 휴무";
    }
  })();

  /* ── 4. 라인업 카드 → 견적 폼 용도 자동 선택 ─────────── */
  document.querySelectorAll("[data-purpose]").forEach(function (link) {
    link.addEventListener("click", function () {
      var purpose = link.getAttribute("data-purpose");
      var select = document.getElementById("qPurpose");
      if (!select || !purpose) return;
      var matched = false;
      Array.prototype.forEach.call(select.options, function (opt) {
        if (!matched && opt.value.indexOf(purpose.split(" ")[0]) === 0) {
          select.value = opt.value;
          matched = true;
        }
      });
      if (!matched) select.value = "기타 문의";
    });
  });

  /* ── 5. 견적 요청서 생성 ────────────────────────────── */
  var form = document.getElementById("quoteForm");
  var resultText = document.getElementById("resultText");
  var hint = document.getElementById("resultHint");
  var errorBox = document.getElementById("formError");
  var smsBtn = document.getElementById("sendSms");
  var mailBtn = document.getElementById("sendMail");
  var copyBtn = document.getElementById("copyBtn");

  var PLACEHOLDER = "아직 요청서가 없습니다.\n\n왼쪽에서 성함·연락처와 용도를 입력한 뒤 [견적 요청서 만들기]를 눌러 주세요.\n만들어진 요청서는 문자·메일로 그대로 보내실 수 있습니다.";

  function setHint(text) {
    if (hint) hint.textContent = text || "";
  }

  function buildMessage() {
    var name = (document.getElementById("qName").value || "").trim();
    var phone = (document.getElementById("qPhone").value || "").trim();
    var purpose = document.getElementById("qPurpose").value;
    var budget = document.getElementById("qBudget").value;
    var deliveryEl = form.querySelector('input[name="delivery"]:checked');
    var delivery = deliveryEl ? deliveryEl.value : "아직 미정";
    var message = (document.getElementById("qMessage").value || "").trim();

    var lines = [];
    lines.push("[이안컴퓨터 가좌점 견적 요청]");
    lines.push("");
    lines.push("· 성함: " + name);
    lines.push("· 연락처: " + phone);
    lines.push("· 용도: " + purpose);
    lines.push("· 예산: " + budget);
    lines.push("· 희망 방식: " + delivery);
    if (message) {
      lines.push("");
      lines.push("· 요청 내용:");
      message.split(/\n+/).forEach(function (line) {
        lines.push("  " + line.trim());
      });
    }
    lines.push("");
    lines.push("위 내용으로 견적 상담 부탁드립니다.");
    lines.push("(" + new Date().toLocaleDateString("ko-KR") + " 작성)");
    return lines.join("\n");
  }

  function buildSubject() {
    return "[견적 문의] " + document.getElementById("qPurpose").value;
  }

  function applyLinks(text) {
    if (smsBtn) smsBtn.setAttribute("href", "sms:" + STORE.mobile + "?body=" + encodeURIComponent(text));
    if (mailBtn) mailBtn.setAttribute("href", "mailto:" + STORE.mail + "?subject=" + encodeURIComponent(buildSubject()) + "&body=" + encodeURIComponent(text));
  }

  function markReady(ready) {
    [smsBtn, mailBtn, copyBtn].forEach(function (btn) {
      if (!btn) return;
      btn.classList.toggle("is-disabled", !ready);
      btn.setAttribute("aria-disabled", ready ? "false" : "true");
    });
  }

  function submitForm(e) {
    if (e) e.preventDefault();

    var nameEl = document.getElementById("qName");
    var phoneEl = document.getElementById("qPhone");
    var nameOk = nameEl.value.trim().length > 0;
    var phoneOk = phoneEl.value.replace(/[^0-9]/g, "").length >= 8;

    if (!nameOk || !phoneOk) {
      if (errorBox) errorBox.hidden = false;
      if (!nameOk) nameEl.focus(); else phoneEl.focus();
      return;
    }
    if (errorBox) errorBox.hidden = true;

    var text = buildMessage();
    resultText.textContent = text;
    resultText.dataset.built = "1";
    applyLinks(text);

    markReady(true);
    setHint("요청서가 만들어졌습니다. 아래 버튼으로 바로 보내실 수 있습니다.");

    if (window.matchMedia("(max-width: 1080px)").matches) {
      var panel = document.getElementById("quoteResult");
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (form) {
    form.addEventListener("submit", submitForm);

    // 입력이 바뀌면 이미 만든 요청서를 조용히 갱신
    var refresh = function () {
      if (!resultText || resultText.dataset.built !== "1") return;
      var text = buildMessage();
      resultText.textContent = text;
      applyLinks(text);
    };
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
  }

  function guard(btn) {
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      if (resultText && resultText.dataset.built === "1") return;
      e.preventDefault();
      setHint("먼저 [견적 요청서 만들기]를 눌러 주세요.");
      var nameEl = document.getElementById("qName");
      if (nameEl) nameEl.focus();
    });
  }
  guard(smsBtn);
  guard(mailBtn);

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!resultText || resultText.dataset.built !== "1") {
        setHint("먼저 [견적 요청서 만들기]를 눌러 주세요.");
        return;
      }
      var text = resultText.textContent;
      var done = function () { setHint("요청서를 복사했습니다. 카카오톡·문자 어디든 붙여넣기 하세요."); };
      var fail = function () {
        var range = document.createRange();
        range.selectNodeContents(resultText);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        setHint("선택된 내용을 Ctrl+C(모바일은 길게 눌러 복사)로 복사해 주세요.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fail);
      } else {
        fail();
      }
    });
  }

  if (resultText) {
    resultText.textContent = PLACEHOLDER;
    resultText.dataset.built = "0";
  }

  markReady(false);

  /* ── 6. 연도 ───────────────────────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
