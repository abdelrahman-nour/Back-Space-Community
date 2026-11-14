
/* ===== بيانات Backspace ===== */
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
            "خد سكرين شوت لرسالة التأكيد"
        ]
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
            "أكّد بالـ IPN وخد سكرين شوت"
        ]
    }
};

const SOURCES = {
    vodafone: "فودافون كاش",
    etisalat: "اتصالات كاش",
    orange: "أورانج كاش",
    instapay: "إنستاباي"
};

const $ = id => document.getElementById(id);
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

let current = null;
let source = null;

/* ===== العنوان المتحرك ===== */
let typingRun = 0;

async function typeHeadline(first, final) {
    const el = $("typed");
    if (reduce) {
        el.textContent = final;
        return;
    }

    const run = ++typingRun;
    const alive = () => run === typingRun;
    el.textContent = "";

    if (first) {
        for (const ch of first) {
            if (!alive()) return;
            el.textContent += ch;
            await sleep(75);
        }

        await sleep(750);

        while (el.textContent.length) {
            if (!alive()) return;
            el.textContent = el.textContent.slice(0, -1);
            await sleep(38);
        }

        await sleep(180);
    }

    for (const ch of final) {
        if (!alive()) return;
        el.textContent += ch;
        await sleep(60);
    }
}

setTimeout(() => typeHeadline("ادفع في ثواني", "اختار طريقة الدفع"), 700);

/* ===== تأثيرات الأزرار ===== */
function burst(x, y, n = 16) {
    if (reduce) return;

    const fx = $("fx");
    const colors = ["#FFE600", "#fff27a", "#ffffff", "#25D366"];

    for (let i = 0; i < n; i++) {
        const p = document.createElement("span");
        p.className = "p";

        const a = Math.random() * Math.PI * 2;
        const d = 50 + Math.random() * 90;

        p.style.left = x + "px";
        p.style.top = y + "px";
        p.style.background = colors[i % colors.length];
        p.style.setProperty("--dx", Math.cos(a) * d + "px");
        p.style.setProperty("--dy", Math.sin(a) * d + "px");
        p.style.setProperty("--r", (Math.random() * 360) + "deg");

        fx.appendChild(p);
        setTimeout(() => p.remove(), 850);
    }
}

const centerOf = el => {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
};

document.addEventListener("pointermove", e => {
    const k = e.target.closest && e.target.closest(".key");
    if (!k) return;

    const r = k.getBoundingClientRect();
    k.style.setProperty("--mx", (e.clientX - r.left) + "px");
    k.style.setProperty("--my", (e.clientY - r.top) + "px");
});

/* ===== اختيار طريقة الدفع ===== */
function setStep(n) {
    $("progress").classList.toggle("two", n === 2);
    $("st2").classList.toggle("on", n === 2);
}

function pick(m, btn) {
    current = m;
    const c = CONFIG[m];

    document.querySelectorAll("button.method").forEach(b => {
        b.setAttribute("aria-pressed", b.dataset.m === m);
    });

    $("d-title").textContent = c.title;
    $("d-numlabel").textContent = c.numLabel;

    const nm = $("d-name");
    nm.innerHTML = "";

    c.name.split(/\s+/).forEach(w => {
        const s = document.createElement("span");
        s.textContent = w;
        nm.appendChild(s);
    });

    const num = $("d-num");
    num.innerHTML = "";

    [...c.number].forEach((ch, i) => {
        const s = document.createElement("span");
        s.textContent = ch;
        s.style.setProperty("--i", i);
        num.appendChild(s);
    });

    const steps = $("d-steps");
    steps.innerHTML = "";

    c.steps.forEach((t, i) => {
        const li = document.createElement("li");
        li.textContent = t;
        li.style.setProperty("--i", i);
        steps.appendChild(li);
    });

    const d = $("details");
    d.classList.remove("closing");
    d.hidden = false;
    d.style.animation = "none";
    void d.offsetWidth;
    d.style.animation = "";

    setStep(2);
    typeHeadline(null, "حوّل وابعتلنا الإثبات");

    if (btn) {
        const [x, y] = centerOf(btn);
        burst(x, y, 12);
    }

    build();

    setTimeout(() => {
        d.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start"
        });
    }, 120);
}

document.querySelectorAll("button.method").forEach(b => {
    b.addEventListener("click", () => pick(b.dataset.m, b));
});

$("change").addEventListener("click", () => {
    const d = $("details");

    const done = () => {
        d.hidden = true;
        d.classList.remove("closing");
    };

    if (reduce) {
        done();
    } else {
        d.classList.add("closing");
        setTimeout(done, 280);
    }

    document.querySelectorAll("button.method").forEach(b => {
        b.setAttribute("aria-pressed", "false");
    });

    setStep(1);
    typeHeadline(null, "اختار طريقة الدفع");

    window.scrollTo({
        top: 0,
        behavior: reduce ? "auto" : "smooth"
    });
});

/* ===== نسخ رقم المحفظة ===== */
$("copy").addEventListener("click", () => {
    const btn = $("copy");
    const value = CONFIG[current].number.replace(/\s/g, "");

    const ok = () => {
        btn.textContent = "اتنسخ ✓";
        btn.classList.add("done");

        const [x, y] = centerOf(btn);
        burst(x, y, 10);

        setTimeout(() => {
            btn.textContent = "نسخ الرقم";
            btn.classList.remove("done");
        }, 1800);
    };

    const fallback = () => {
        const r = document.createRange();
        r.selectNodeContents($("d-num"));

        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);

        btn.textContent = "متحدد، انسخه";
    };

    try {
        navigator.clipboard.writeText(value).then(ok, fallback);
    } catch (e) {
        fallback();
    }
});

/* ===== اختيار المحفظة المستخدمة ===== */
document.querySelectorAll(".src").forEach(b => {
    b.addEventListener("click", () => {
        source = b.dataset.src;

        document.querySelectorAll(".src").forEach(x => {
            x.setAttribute("aria-checked", x === b);
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

        build();
        updateWalletDial();

        $("sender").focus({ preventScroll: true });
    });
});

/* ===== تجهيز رسالة واتساب ===== */
const toEn = s => s
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

const isPhone = v =>
    /^01[0125]\d{8}$/.test(v.replace(/[\s-]/g, ""));

function build() {
    const amount = toEn($("amount").value.trim());
    const sender = toEn($("sender").value.trim());
    const insta = source === "instapay";

    const fromLabel = insta && !isPhone(sender)
        ? "اليوزر"
        : "رقم";

    const msg =
        `تم تحويل مبلغ ${amount} ج.م من ${fromLabel} ${sender} عن طريق (${source ? SOURCES[source] : ""})\nودي اسكرين التحويل`;

    $("wa").href =
        `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

    return { amount, sender, insta };
}

/* ===== إضافة التحويل السريع الجديدة ===== */
/*
  بنفتح قائمة التحويل الرسمية للشبكة.
  العميل بيكمل العملية بنفسه على شاشة المحفظة.
  لا نطلب أو نخزن الرقم السري في الموقع.
*/

const WALLET_USSD = {
    vodafone: {
        code: "*9*7#",
        hint: "فودافون كاش: افتح خدمة تحويل الأموال واكتب رقم المستفيد والمبلغ."
    },
    etisalat: {
        code: "*777*1#",
        hint: "اتصالات كاش: كمّل التحويل من شاشة الشبكة، واكتب الرقم السري هناك فقط."
    },
    orange: {
        code: "#7115#",
        hint: "أورنج كاش: افتح خدمات المحفظة واختار تحويل الأموال."
    }
};

function updateWalletDial() {
    const panel = $("wallet-dial");
    if (!panel) return;

    const wallet = WALLET_USSD[source];

    if (!wallet) {
        panel.hidden = true;
        return;
    }

    panel.hidden = false;

    const amount = toEn($("amount").value.trim());
    const recipient = CONFIG.vodafone.number.replace(/\D/g, "");

    const validAmount =
        /^\d+(?:\.\d+)?$/.test(amount) &&
        Number(amount) > 0;

    $("dial-code").textContent = wallet.code;
    $("dial-info").textContent = wallet.hint;

    $("dial-details").textContent =
        `رقم المستفيد: ${recipient} — المبلغ: ${validAmount ? amount + " جنيه" : "اكتب المبلغ فوق"
        }`;

    $("dial-open").href =
        "tel:" + wallet.code.replace(/#/g, "%23");
}

$("amount").addEventListener("input", updateWalletDial);

/* ===== تحديث بيانات الدفع ===== */
["amount", "sender"].forEach(id => {
    $(id).addEventListener("input", build);
});

$("pay").addEventListener("submit", e => e.preventDefault());

$("wa").addEventListener("click", e => {
    const { amount, sender, insta } = build();

    const bad = (id, msg) => {
        $(id + "-err").textContent = msg;
        $(id).removeAttribute("aria-invalid");
        void $(id).offsetWidth;
        $(id).setAttribute("aria-invalid", "true");
    };

    const good = id => {
        $(id + "-err").textContent = "";
        $(id).removeAttribute("aria-invalid");
    };

    let valid = true;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        bad("amount", "اكتب المبلغ اللي حوّلته بالأرقام");
        valid = false;
    } else {
        good("amount");
    }

    if (!source) {
        $("src-err").textContent = "اختار حوّلت منين";
        valid = false;
    } else if (!insta && !isPhone(sender)) {
        bad("sender", "اكتب رقم موبايل صحيح من 11 رقم يبدأ بـ 01");
        valid = false;
    } else if (insta && sender.length < 3) {
        bad("sender", "اكتب الرقم أو اليوزر اللي حوّلت منه");
        valid = false;
    } else {
        good("sender");
    }

    if (!valid) {
        e.preventDefault();
        return;
    }

    const [x, y] = centerOf($("wa"));
    burst(x, y, 22);
});

/* ===== تقييم جوجل ===== */
(function () {
    const KEY = "bs_review";
    const card = $("review");
    if (!card) return;

    const get = () => {
        try {
            return localStorage.getItem(KEY);
        } catch (e) {
            return null;
        }
    };

    const set = v => {
        try {
            localStorage.setItem(KEY, v);
        } catch (e) { }
    };

    const saved = get();

    if (
        saved === "rated" ||
        (saved && Date.now() - Number(saved) < 14 * 864e5)
    ) {
        card.hidden = true;
        return;
    }

    const close = () => {
        if (reduce) {
            card.hidden = true;
            return;
        }

        card.classList.add("bye");
        setTimeout(() => {
            card.hidden = true;
        }, 450);
    };

    $("rv-close").addEventListener("click", () => {
        set(String(Date.now()));
        close();
    });

    $("rv-go").addEventListener("click", () => {
        set("rated");

        const [x, y] = centerOf($("rv-go"));
        burst(x, y, 18);

        setTimeout(() => {
            card.innerHTML =
                '<div class="rv-thanks"><span aria-hidden="true">💛</span>شكرًا على تقييمك!</div>';

            setTimeout(close, 2200);
        }, 300);
    });
})();
