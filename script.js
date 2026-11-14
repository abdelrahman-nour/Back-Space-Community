"use strict";

/* ============================================
   BACKSPACE PAYMENT SYSTEM
   ============================================ */

/* ============================================
   01 — CONFIGURATION
   ============================================ */

const CONFIG = {
  whatsapp: "201050900203",

  vodafone: {
    title: "فودافون كاش",
    numLabel: "رقم المحفظة",
    number: "010 5090 0203",
    name: "بسام ع********* ع********* و***** ا*********",

    steps: [
      "افتح محفظتك أو تطبيق إنستاباي",
      "اختار تحويل أموال وادخل رقم المحفظة اللي فوق",
      "اكتب المبلغ وأكّد بالرقم السري",
      "خد سكرين شوت لرسالة التأكيد",
    ],
  },

  instapay: {
    title: "إنستاباي",
    numLabel: "عنوان الدفع",
    number: "backspace@instapay",
    name: "Backspace",

    steps: [
      "افتح تطبيق InstaPay",
      "اختار إرسال أموال وادخل العنوان اللي فوق",
      "اتأكد من اسم المستفيد واكتب المبلغ",
      "أكّد بالـ IPN وخد سكرين شوت",
    ],
  },
};

/* ============================================
   02 — PAYMENT SOURCES
   ============================================ */

const SOURCES = {
  vodafone: "فودافون كاش",
  etisalat: "اتصالات كاش",
  orange: "أورانج كاش",
  instapay: "إنستاباي",
};

/* ============================================
   03 — WALLET USSD CONFIGURATION
   ============================================ */

const WALLET_USSD = {
  vodafone: {
    code: "*9*7#",
    hint: "فودافون كاش: افتح خدمة تحويل الأموال، واكتب رقم المستفيد والمبلغ.",
  },

  etisalat: {
    code: "*777*1#",
    hint: "اتصالات كاش: كمّل التحويل من شاشة المحفظة، واكتب الرقم السري هناك فقط.",
  },

  orange: {
    code: "#7115#",
    hint: "أورنج كاش: افتح خدمات المحفظة واختار تحويل الأموال.",
  },
};

/* ============================================
   04 — GLOBAL HELPERS
   ============================================ */

const $ = (id) => document.getElementById(id);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toEn = (value) =>
  String(value)
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit));

const isPhone = (value) =>
  /^01[0125]\d{8}$/.test(toEn(value).replace(/[\s-]/g, ""));

const centerOf = (element) => {
  const rect = element.getBoundingClientRect();

  return [rect.left + rect.width / 2, rect.top + rect.height / 2];
};

/* ============================================
   05 — APPLICATION STATE
   ============================================ */

let current = null;
let source = null;

let typingRun = 0;

// none | choice | active
let walletState = "none";

/* ============================================
   06 — WALLET VISIBILITY HELPERS
   ============================================ */

const walletChoice = $("wallet-choice");
const walletDial = $("wallet-dial");

function setVisible(element, visible) {
  if (!element) return;

  element.hidden = !visible;

  if (visible) {
    element.style.removeProperty("display");
  } else {
    element.style.setProperty("display", "none", "important");
  }
}

function isWallet() {
  return source === "vodafone" || source === "etisalat" || source === "orange";
}

function renderWalletUI() {
  const eligible = isWallet();

  const showChoice = eligible && walletState === "choice";

  const showDial = eligible && walletState === "active";

  setVisible(walletChoice, showChoice);
  setVisible(walletDial, showDial);

  if (showDial) {
    updateWalletDial();
  }
}

function setWalletState(state) {
  walletState = state;
  renderWalletUI();
}

/*
  في بداية الصفحة:
  لا يظهر السؤال ولا التحويل السريع.
*/

setWalletState("none");

/* ============================================
   07 — TYPING HEADLINE
   ============================================ */

async function typeHeadline(first, final) {
  const element = $("typed");

  if (!element) return;

  if (reduce) {
    element.textContent = final;
    return;
  }

  const run = ++typingRun;
  const alive = () => run === typingRun;

  element.textContent = "";

  if (first) {
    for (const char of first) {
      if (!alive()) return;

      element.textContent += char;
      await sleep(75);
    }

    await sleep(750);

    while (element.textContent.length) {
      if (!alive()) return;

      element.textContent = element.textContent.slice(0, -1);

      await sleep(38);
    }

    await sleep(180);
  }

  for (const char of final) {
    if (!alive()) return;

    element.textContent += char;
    await sleep(60);
  }
}

setTimeout(() => {
  typeHeadline("ادفع في ثواني", "اختار طريقة الدفع");
}, 700);

/* ============================================
   08 — PARTICLE ANIMATION
   ============================================ */

function burst(x, y, count = 16) {
  if (reduce) return;

  const container = $("fx");

  if (!container) return;

  const colors = ["#FFE600", "#fff27a", "#ffffff", "#25D366"];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");

    particle.className = "p";

    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 90;

    particle.style.left = x + "px";
    particle.style.top = y + "px";

    particle.style.background = colors[i % colors.length];

    particle.style.setProperty("--dx", Math.cos(angle) * distance + "px");

    particle.style.setProperty("--dy", Math.sin(angle) * distance + "px");

    particle.style.setProperty("--r", Math.random() * 360 + "deg");

    container.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 850);
  }
}

/* ============================================
   09 — BUTTON SPOTLIGHT
   ============================================ */

document.addEventListener("pointermove", (event) => {
  const button = event.target.closest?.(".key");

  if (!button) return;

  const rect = button.getBoundingClientRect();

  button.style.setProperty("--mx", event.clientX - rect.left + "px");

  button.style.setProperty("--my", event.clientY - rect.top + "px");
});

/* ============================================
   10 — PROGRESS INDICATOR
   ============================================ */

function setStep(step) {
  $("progress").classList.toggle("two", step === 2);

  $("st2").classList.toggle("on", step === 2);
}

/* ============================================
   11 — PAYMENT METHOD DETAILS
   ============================================ */

function renderBeneficiaryName(name) {
  const container = $("d-name");

  container.replaceChildren();

  name.split(/\s+/).forEach((word) => {
    const span = document.createElement("span");

    span.textContent = word;
    container.appendChild(span);
  });
}

function renderBeneficiaryNumber(number) {
  const container = $("d-num");

  container.replaceChildren();

  [...number].forEach((char, index) => {
    const span = document.createElement("span");

    span.textContent = char;
    span.style.setProperty("--i", index);

    container.appendChild(span);
  });
}

function renderPaymentSteps(steps) {
  const container = $("d-steps");

  container.replaceChildren();

  steps.forEach((text, index) => {
    const item = document.createElement("li");

    item.textContent = text;
    item.style.setProperty("--i", index);

    container.appendChild(item);
  });
}

/* ============================================
   12 — SELECT PAYMENT METHOD
   ============================================ */

function pick(method, button) {
  const config = CONFIG[method];

  if (!config) return;

  current = method;

  document.querySelectorAll("button.method").forEach((item) => {
    item.setAttribute("aria-pressed", String(item.dataset.m === method));
  });

  $("d-title").textContent = config.title;

  $("d-numlabel").textContent = config.numLabel;

  renderBeneficiaryName(config.name);
  renderBeneficiaryNumber(config.number);
  renderPaymentSteps(config.steps);

  const details = $("details");

  details.classList.remove("closing");

  details.hidden = false;
  details.style.animation = "none";

  void details.offsetWidth;

  details.style.animation = "";

  setStep(2);

  typeHeadline(null, "حوّل وابعتلنا الإثبات");

  if (button) {
    const [x, y] = centerOf(button);

    burst(x, y, 12);
  }

  buildWhatsAppMessage();

  setTimeout(() => {
    details.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, 120);
}

document.querySelectorAll("button.method").forEach((button) => {
  button.addEventListener("click", () => {
    pick(button.dataset.m, button);
  });
});

/* ============================================
   13 — BACK BUTTON
   ============================================ */

$("change").addEventListener("click", () => {
  const details = $("details");

  const hideDetails = () => {
    details.hidden = true;
    details.classList.remove("closing");
  };

  if (reduce) {
    hideDetails();
  } else {
    details.classList.add("closing");
    setTimeout(hideDetails, 280);
  }

  document.querySelectorAll("button.method").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
  });

  current = null;
  source = null;

  document.querySelectorAll(".src").forEach((button) => {
    button.setAttribute("aria-checked", "false");
  });

  setWalletState("none");

  $("sender-wrap").hidden = true;

  setStep(1);

  typeHeadline(null, "اختار طريقة الدفع");

  window.scrollTo({
    top: 0,
    behavior: reduce ? "auto" : "smooth",
  });
});

/* ============================================
   14 — COPY BENEFICIARY NUMBER
   ============================================ */

$("copy").addEventListener("click", () => {
  if (!current) return;

  const button = $("copy");

  const value = CONFIG[current].number.replace(/\s/g, "");

  const success = () => {
    button.textContent = "اتنسخ ✓";
    button.classList.add("done");

    const [x, y] = centerOf(button);
    burst(x, y, 10);

    setTimeout(() => {
      button.textContent = "نسخ الرقم";
      button.classList.remove("done");
    }, 1800);
  };

  const fallback = () => {
    const range = document.createRange();

    range.selectNodeContents($("d-num"));

    const selection = window.getSelection();

    selection.removeAllRanges();
    selection.addRange(range);

    button.textContent = "متحدد، انسخه";
  };

  if (!navigator.clipboard?.writeText) {
    fallback();
    return;
  }

  navigator.clipboard.writeText(value).then(success).catch(fallback);
});

/* ============================================
   15 — SELECT TRANSFER SOURCE
   ============================================ */

function selectSource(selectedSource) {
  if (!SOURCES[selectedSource]) return;

  source = selectedSource;

  document.querySelectorAll(".src").forEach((button) => {
    button.setAttribute("aria-checked", String(button.dataset.src === source));
  });

  $("src-err").textContent = "";

  const insta = source === "instapay";

  $("sender-label").textContent = insta
    ? "الرقم أو اليوزر اللي حوّلت منه"
    : `رقم ${SOURCES[source]} اللي حوّلت منه`;

  $("sender").placeholder = insta
    ? "01xxxxxxxxx أو username@instapay"
    : "01xxxxxxxxx";

  $("sender").setAttribute("inputmode", insta ? "text" : "tel");

  $("sender-hint").textContent = insta
    ? "اكتب رقم الموبايل أو يوزر إنستاباي، أي واحد فيهم"
    : "";

  $("sender-err").textContent = "";

  $("sender").removeAttribute("aria-invalid");

  $("sender-wrap").hidden = false;

  /*
    المحافظ الثلاثة:
    يظهر سؤال الموافقة أولًا.

    InstaPay:
    لا يظهر أي قسم للتحويل السريع.
  */

  if (isWallet()) {
    setWalletState("choice");
  } else {
    setWalletState("none");
  }

  buildWhatsAppMessage();

  /*
    متعمدين مش نعمل focus على خانة
    رقم المرسل هنا.

    لأن التركيز عليها كان ممكن ينقل
    الشاشة بعيد عن سؤال التحويل السريع
    ويخلي المستخدم يفتكر إنه مش ظاهر.
  */
}

document.querySelectorAll(".src").forEach((button) => {
  button.addEventListener("click", () => {
    selectSource(button.dataset.src);
  });
});

/* ============================================
   16 — QUICK TRANSFER UI
   ============================================ */

/*
  الحالات:

  none:
  لا يظهر أي شيء.

  choice:
  يظهر سؤال "تحب تحول بشكل أسرع؟".

  active:
  يظهر قسم التحويل السريع.
*/

function showWalletChoice() {
  if (!isWallet()) {
    setWalletState("none");
    return;
  }

  setWalletState("choice");
}

function acceptQuickTransfer() {
  if (!isWallet()) {
    setWalletState("none");
    return;
  }

  setWalletState("active");

  const button = $("wallet-yes");

  if (button) {
    const [x, y] = centerOf(button);
    burst(x, y, 12);
  }
}

function declineQuickTransfer() {
  setWalletState("none");
}

function cancelQuickTransfer() {
  /*
    إلغاء التحويل السريع:
    يقفل القسم بالكامل.

    التحويل العادي والواتساب
    يفضلوا شغالين.
  */

  setWalletState("none");
}

/* ============================================
   17 — QUICK TRANSFER BUTTON EVENTS
   ============================================ */

$("wallet-yes").addEventListener("click", acceptQuickTransfer);

$("wallet-no").addEventListener("click", declineQuickTransfer);

$("wallet-cancel").addEventListener("click", cancelQuickTransfer);

/* ============================================
   18 — BUILD WALLET DIAL LINK
   ============================================ */

function updateWalletDial() {
  if (!isWallet()) return;

  const wallet = WALLET_USSD[source];

  if (!wallet) return;

  const amount = toEn($("amount").value.trim());

  const recipient = CONFIG.vodafone.number.replace(/\D/g, "");

  const validAmount = /^\d+(?:\.\d+)?$/.test(amount) && Number(amount) > 0;

  const amountLabel = validAmount ? `${amount} جنيه` : "اكتب المبلغ فوق";

  $("dial-code").textContent = wallet.code;

  $("dial-info").textContent = wallet.hint;

  $("dial-details").textContent =
    `رقم المستفيد: ${recipient} — المبلغ: ${amountLabel}`;

  /*
    علامة # لازم تتعمل لها Encoding
    داخل رابط tel.

    ده بيفتح كود الخدمة فقط،
    مش بيحوّل الأموال تلقائيًا.
  */

  $("dial-open").href = "tel:" + wallet.code.replace(/#/g, "%23");
}

/* ============================================
   19 — WHATSAPP MESSAGE BUILDER
   ============================================ */

function buildWhatsAppMessage() {
  const amount = toEn($("amount").value.trim());

  const sender = toEn($("sender").value.trim());

  const insta = source === "instapay";

  const senderLabel = insta && !isPhone(sender) ? "اليوزر" : "رقم";

  const sourceLabel = source ? SOURCES[source] : "";

  const message = `تم تحويل مبلغ ${amount} ج.م من ${senderLabel} ${sender} عن طريق (${sourceLabel})\nودي اسكرين التحويل`;

  const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;

  $("wa").href = url;

  return {
    amount,
    sender,
    insta,
  };
}

/* ============================================
   20 — INPUT EVENTS
   ============================================ */

/*
  Listener واحد للمبلغ،
  بدل التكرارات الموجودة قبل كده.
*/

$("amount").addEventListener("input", () => {
  buildWhatsAppMessage();

  if (walletState === "active") {
    updateWalletDial();
  }
});

$("sender").addEventListener("input", buildWhatsAppMessage);

/* ============================================
   21 — FORM VALIDATION
   ============================================ */

function showError(id, message) {
  const input = $(id);
  const error = $(id + "-err");

  error.textContent = message;

  input.removeAttribute("aria-invalid");

  void input.offsetWidth;

  input.setAttribute("aria-invalid", "true");
}

function clearError(id) {
  $(id + "-err").textContent = "";

  $(id).removeAttribute("aria-invalid");
}

function validatePayment() {
  const { amount, sender, insta } = buildWhatsAppMessage();

  let valid = true;

  const amountValid = /^\d+(?:\.\d+)?$/.test(amount) && Number(amount) > 0;

  if (!amountValid) {
    showError("amount", "اكتب المبلغ اللي حوّلته بالأرقام");

    valid = false;
  } else {
    clearError("amount");
  }

  if (!source) {
    $("src-err").textContent = "اختار حوّلت منين";

    valid = false;
  } else {
    $("src-err").textContent = "";
  }

  if (source && !insta && !isPhone(sender)) {
    showError("sender", "اكتب رقم موبايل صحيح من 11 رقم يبدأ بـ 01");

    valid = false;
  } else if (source && insta && sender.length < 3) {
    showError("sender", "اكتب الرقم أو اليوزر اللي حوّلت منه");

    valid = false;
  } else {
    clearError("sender");
  }

  return valid;
}

/* ============================================
   22 — WHATSAPP SUBMISSION
   ============================================ */

$("pay").addEventListener("submit", (event) => {
  event.preventDefault();
});

$("wa").addEventListener("click", (event) => {
  const valid = validatePayment();

  if (!valid) {
    event.preventDefault();
    return;
  }

  const [x, y] = centerOf($("wa"));

  burst(x, y, 22);
});

/* ============================================
   23 — GOOGLE REVIEW
   ============================================ */

function initGoogleReview() {
  const KEY = "bs_review";

  const card = $("review");

  if (!card) return;

  const getSaved = () => {
    try {
      return localStorage.getItem(KEY);
    } catch (error) {
      return null;
    }
  };

  const save = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch (error) {
      // Storage unavailable
    }
  };

  const saved = getSaved();

  const alreadyRated = saved === "rated";

  const recentlyDismissed =
    saved && !alreadyRated && Date.now() - Number(saved) < 14 * 864e5;

  if (alreadyRated || recentlyDismissed) {
    card.hidden = true;
    return;
  }

  function closeReview() {
    if (reduce) {
      card.hidden = true;
      return;
    }

    card.classList.add("bye");

    setTimeout(() => {
      card.hidden = true;
    }, 450);
  }

  $("rv-close").addEventListener("click", () => {
    save(String(Date.now()));
    closeReview();
  });

  $("rv-go").addEventListener("click", () => {
    save("rated");

    const [x, y] = centerOf($("rv-go"));

    burst(x, y, 18);

    setTimeout(() => {
      card.innerHTML = `
          <div class="rv-thanks">
            <span aria-hidden="true">💛</span>
            شكرًا على تقييمك!
          </div>
        `;

      setTimeout(closeReview, 2200);
    }, 300);
  });
}

initGoogleReview();

/* ============================================
   END — BACKSPACE PAYMENT SYSTEM
   ============================================ */
