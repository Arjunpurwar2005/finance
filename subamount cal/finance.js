'use strict';

const translations = {
  en: {
    subamountAnalyzer: "Subamount Analyzer",
    understandYourLoan: "Understand Your Loan & Save Money",
    loanDetails: "Loan Details",
    loanAmountLeft: "Loan Amount Left",
    interestRate: "Interest Rate",
    loanTime: "Loan Time",
    years: "years",
    extraPayment: "Extra Payment (Optional)",
    monthly: "Monthly",
    lumpSum: "Lump Sum (Yearly)",
    monthlyExtra: "Monthly Extra",
    lumpSumExtra: "Lump Sum Extra",
    optGoal: "Optimization Goal",
    reduceTime: "Reduce Loan Time",
    finishEarlier: "Finish loan earlier",
    reduceEmi: "Reduce EMI",
    lowerMonthly: "Lower monthly payment",
    analyzeBtn: "Analyze My Loan →",
    yourEmi: "Your Monthly EMI",
    loanSummary: "Loan Summary",
    totalPayable: "Total Payable",
    interestYouPay: "Interest You Pay",
    interestSaved: "Interest Saved",
    timeSaved: "Time Saved",
    viewDetails: "📅 View Detailed Breakdown",
    hideDetails: "📅 Hide Detailed Breakdown",
    yearlySchedule: "Yearly Loan Schedule",
    year: "Year",
    totalPaid: "Total Paid",
    interestPaid: "Interest Paid",
    principalPaid: "Principal Paid",
    remainingLoan: "Remaining Loan",
    footerNote: "Calculations are indicative. Consult your lender for exact figures.",
    loanAmountTooltip: "Total amount borrowed or left to pay",
    interestTooltip: "Annual interest rate charged by bank",
    timeTooltip: "Total number of years to repay",
    extraTooltip: "Additional payment you can make"
  },
  hi: {
    subamountAnalyzer: "सबअमाउंट एनालाइज़र",
    understandYourLoan: "अपना लोन समझें और पैसे बचाएं",
    loanDetails: "लोन विवरण",
    loanAmountLeft: "बची हुई लोन राशि",
    interestRate: "ब्याज दर",
    loanTime: "लोन का समय",
    years: "वर्ष",
    extraPayment: "अतिरिक्त भुगतान (वैकल्पिक)",
    monthly: "मासिक",
    lumpSum: "एकमुश्त (वार्षिक)",
    monthlyExtra: "मासिक अतिरिक्त",
    lumpSumExtra: "एकमुश्त अतिरिक्त",
    optGoal: "बचत का लक्ष्य",
    reduceTime: "लोन का समय कम करें",
    finishEarlier: "लोन जल्दी चुकाएं",
    reduceEmi: "EMI कम करें",
    lowerMonthly: "मासिक भुगतान कम करें",
    analyzeBtn: "मेरा लोन एनालाइज़ करें →",
    yourEmi: "आपकी मासिक EMI",
    loanSummary: "लोन सारांश",
    totalPayable: "कुल देय",
    interestYouPay: "आपका ब्याज",
    interestSaved: "बचाया गया ब्याज",
    timeSaved: "बचाया गया समय",
    viewDetails: "📅 विस्तृत ब्रेकडाउन देखें",
    hideDetails: "📅 विस्तृत ब्रेकडाउन छिपाएं",
    yearlySchedule: "वार्षिक लोन शिड्यूल",
    year: "वर्ष",
    totalPaid: "कुल भुगतान",
    interestPaid: "ब्याज का भुगतान",
    principalPaid: "मूलधन का भुगतान",
    remainingLoan: "शेष लोन",
    footerNote: "गणनाएँ सांकेतिक हैं। सटीक आँकड़ों के लिए अपने ऋणदाता से संपर्क करें।",
    loanAmountTooltip: "कुल उधार ली गई या शेष राशि",
    interestTooltip: "बैंक द्वारा लागू वार्षिक ब्याज दर",
    timeTooltip: "चुकाने के लिए वर्षों की कुल संख्या",
    extraTooltip: "अतिरिक्त भुगतान जो आप कर सकते हैं"
  },
  hinglish: {
    subamountAnalyzer: "Subamount Analyzer",
    understandYourLoan: "Apna Loan Samjho aur Paise Bachao",
    loanDetails: "Loan Details",
    loanAmountLeft: "Bacha Hua Loan Amount",
    interestRate: "Interest Rate",
    loanTime: "Loan Ka Time",
    years: "saal",
    extraPayment: "Extra Payment (Optional)",
    monthly: "Monthly",
    lumpSum: "Ek Saath (Yearly)",
    monthlyExtra: "Monthly Extra",
    lumpSumExtra: "Lump Sum Extra",
    optGoal: "Bachat Ka Goal",
    reduceTime: "Loan Time Kam Karein",
    finishEarlier: "Loan jaldi khatm karein",
    reduceEmi: "EMI Kam Karein",
    lowerMonthly: "Monthly payment kam karein",
    analyzeBtn: "Mera Loan Analyze Karein →",
    yourEmi: "Aapki Monthly EMI",
    loanSummary: "Loan Summary",
    totalPayable: "Total Dena Hoga",
    interestYouPay: "Aapka Interest",
    interestSaved: "Interest Bachat",
    timeSaved: "Time Bachat",
    viewDetails: "📅 Poori Details Dekhein",
    hideDetails: "📅 Details Chupayein",
    yearlySchedule: "Yearly Loan Schedule",
    year: "Saal",
    totalPaid: "Total Diya",
    interestPaid: "Interest Diya",
    principalPaid: "Principal Diya",
    remainingLoan: "Bacha Hua Loan",
    footerNote: "Calculations sirf idea dene ke liye hain. Details ke liye bank se baat karein.",
    loanAmountTooltip: "Total loan amount jo bacha hai",
    interestTooltip: "Bank ka saalana interest rate",
    timeTooltip: "Loan chukane ke liye total saal",
    extraTooltip: "Koi extra paisa jo aap de sakte hain"
  }
};

const $ = id => document.getElementById(id);

function fmtINR(n) {
  if (isNaN(n) || n == null) return '—';
  n = Math.round(n);
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

function fmtMonths(m) {
  if (!m || m <= 0) return '—';
  const lang = $('langToggle').value;
  const ys = lang === 'hi' ? 'वर्ष' : lang === 'hinglish' ? 'saal' : 'yr';
  const ysPlural = lang === 'hi' ? 'वर्ष' : lang === 'hinglish' ? 'saal' : 'yrs';
  const moStr = lang === 'hi' ? 'माह' : lang === 'hinglish' ? 'mahina' : 'mo';
  
  const y = Math.floor(m / 12), mo = m % 12;
  return (y ? y + ' ' + (y > 1 ? ysPlural : ys) + ' ' : '') + (mo ? mo + ' ' + moStr : '');
}

let extraType   = 'monthly';
let optMode     = 'tenure';
let hasAnalyzed = false;

function updateSliderFill(el) {
  const pct = ((+el.value - +el.min) / (+el.max - +el.min) * 100).toFixed(1);
  el.style.background = `linear-gradient(90deg, var(--ocean-deep) ${pct}%, var(--sand-dark) ${pct}%)`;
}
function updateSliderGreen(el) {
  const pct = ((+el.value - +el.min) / (+el.max - +el.min) * 100).toFixed(1);
  el.style.background = `linear-gradient(90deg, var(--green-deep) ${pct}%, var(--sand-dark) ${pct}%)`;
}
document.querySelectorAll('.slider').forEach(s => {
  (s.classList.contains('green') ? updateSliderGreen : updateSliderFill)(s);
  s.addEventListener('input', () =>
    (s.classList.contains('green') ? updateSliderGreen : updateSliderFill)(s));
});

function bindPair(inputId, sliderId, dispId, fmtFn, greenSlider) {
  const inp = $(inputId), rng = $(sliderId), disp = $(dispId);
  const fill = greenSlider ? updateSliderGreen : updateSliderFill;
  inp.addEventListener('input', () => {
    rng.value = inp.value;
    disp.textContent = fmtFn(+inp.value);
    fill(rng);
    if (hasAnalyzed) analyze();
  });
  rng.addEventListener('input', () => {
    inp.value = rng.value;
    disp.textContent = fmtFn(+rng.value);
    fill(rng);
    if (hasAnalyzed) analyze();
  });
}
bindPair('iLoan',   'rLoan',   'dLoan',   v => fmtINR(v));
bindPair('iRate',   'rRate',   'dRate',   v => v.toFixed(1) + '%');
bindPair('iTenure', 'rTenure', 'dTenure', v => {
    const lang = $('langToggle').value;
    return v + ' ' + (lang === 'hi' ? 'वर्ष' : lang === 'hinglish' ? 'saal' : 'Years');
});
bindPair('iExtra',  'rExtra',  'dExtra',  v => fmtINR(v), true);

document.querySelectorAll('input[name="xt"]').forEach(r => {
  r.addEventListener('change', e => {
    extraType = e.target.value;
    $('tabMonthly').classList.toggle('active', extraType === 'monthly');
    $('tabLump').classList.toggle('active',    extraType === 'lump');
    
    const lang = $('langToggle').value;
    const key = extraType === 'monthly' ? 'monthlyExtra' : 'lumpSumExtra';
    document.querySelector('#extraLbl span[data-i18n]').setAttribute('data-i18n', key);
    updateLanguage();
    
    if (extraType === 'lump') { $('rExtra').max = 5000000; $('rExtra').step = 50000; }
    else                      { $('rExtra').max = 100000;  $('rExtra').step = 500; }
    
    updateSliderGreen($('rExtra'));
    if (hasAnalyzed) analyze();
  });
});

document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener('change', e => {
    optMode = e.target.value;
    $('mTenure').classList.toggle('active', optMode === 'tenure');
    $('mEMI').classList.toggle('active',    optMode === 'emi');
    if (hasAnalyzed) analyze();
  });
});

function calcEMI(P, r, n) {
  if (r === 0) return P / n;
  return P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

function amortize(P, annualRate, tenureMonths, globalExtra, xType, mode) {
  const r   = annualRate / 100 / 12;
  const emi = calcEMI(P, r, tenureMonths);
  let   bal = P;
  const rows = [];

  if (xType === 'lump' && globalExtra > 0) bal = Math.max(0, bal - globalExtra);

  let dynEMI = emi;

  for (let m = 1; m <= tenureMonths * 2; m++) {
    if (bal <= 0) break;

    const intPart = bal * r;
    let   prinPart = dynEMI - intPart;
    if (prinPart <= 0) prinPart = 0.01;

    let sub = 0;

    if (xType === 'monthly' && globalExtra > 0) {
      if (mode === 'tenure') {
        sub      += globalExtra;
        prinPart += globalExtra;
      } else {
        sub      += globalExtra;
        prinPart += globalExtra;
        const remM = tenureMonths - m;
        if (remM > 0) {
          const nb = Math.max(0, bal - prinPart);
          dynEMI   = calcEMI(nb, r, remM);
        }
      }
    }

    bal = Math.max(0, bal - prinPart);
    rows.push({
      month:     m,
      interest:  intPart,
      principal: prinPart - sub,
      sub:       sub,
      balance:   bal,
      emi:       dynEMI
    });
    if (bal <= 0) break;
  }

  return { rows, baseEMI: emi };
}

function yearBuckets(rows) {
  const b = {};
  rows.forEach(r => {
    const yr = Math.ceil(r.month / 12);
    if (!b[yr]) b[yr] = { year: yr, principal: 0, interest: 0, sub: 0, balance: r.balance };
    b[yr].principal += r.principal;
    b[yr].interest  += r.interest;
    b[yr].sub       += r.sub;
    b[yr].balance    = r.balance;
  });
  return Object.values(b);
}

function analyze() {
  const P     = +$('iLoan').value   || 0;
  const rate  = +$('iRate').value   || 0;
  const yrs   = +$('iTenure').value || 0;
  const extra = +$('iExtra').value  || 0;
  if (!P || !rate || !yrs) return;

  const months = yrs * 12;

  const base   = amortize(P, rate, months, 0, 'none', 'tenure');
  const baseTI = base.rows.reduce((s, v) => s + v.interest, 0);
  const baseTot = P + baseTI;
  const baseMo  = base.rows.length;

  const opt    = amortize(P, rate, months, extra, extraType, optMode);
  const optTI  = opt.rows.reduce((s, v) => s + v.interest, 0);
  const optTot = P + optTI;
  const optMo  = opt.rows.length;

  const saved  = Math.max(0, baseTI - optTI);
  const savedM = Math.max(0, baseMo - optMo);

  $('emiNum').textContent  = fmtINR(base.baseEMI);
  $('mTotal').textContent  = fmtINR(baseTot);
  $('mInt').textContent    = fmtINR(baseTI);
  $('mSaved').textContent  = fmtINR(saved);
  $('mTime').textContent   = fmtMonths(savedM);

  buildAmortTable(yearBuckets(opt.rows));
}

function buildAmortTable(buckets) {
  const tb = $('amortBody');
  tb.innerHTML = '';
  buckets.forEach(b => {
    const principalPaidThisYear = b.principal + b.sub;
    const totalPaidThisYear = principalPaidThisYear + b.interest;

    const ratio = b.interest / (totalPaidThisYear + 0.01);
    let bgColor = '';
    
    if (ratio > 0.6) bgColor = 'rgba(224,123,84,.06)';
    else if (ratio < 0.35) bgColor = 'rgba(76,175,125,.06)';
    else bgColor = 'rgba(245,166,35,.04)';

    const tr = document.createElement('tr');
    tr.style.background = bgColor;
    tr.innerHTML = `
      <td>${b.year}</td>
      <td>${fmtINR(totalPaidThisYear)}</td>
      <td style="color:${ratio > 0.5 ? 'var(--red)' : 'var(--green)'}">${fmtINR(b.interest)}</td>
      <td>${fmtINR(principalPaidThisYear)}</td>
      <td>${fmtINR(b.balance)}</td>
    `;
    tb.appendChild(tr);
  });
}

$('btnAnalyze').addEventListener('click', () => {
  hasAnalyzed = true;
  analyze();
});

// THIS WILL NOW SHOW THE TABLE FLAWLESSLY ON CLICK.
$('btnViewMore').addEventListener('click', function() {
    const content = $('scheduleContent');
    const isHidden = content.style.display === 'none' || content.style.display === '';
    
    this.classList.toggle('open');
    if (isHidden) {
      content.style.display = 'block';
      this.querySelector('span[data-i18n]').setAttribute('data-i18n', 'hideDetails');
    } else {
      content.style.display = 'none';
      this.querySelector('span[data-i18n]').setAttribute('data-i18n', 'viewDetails');
    }
    updateLanguage();
});

const langToggle = $('langToggle');

function updateLanguage() {
  const lang = langToggle.value;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[lang] && translations[lang][key]) {
      el.title = translations[lang][key];
    }
  });

  $('dTenure').textContent = $('iTenure').value + ' ' + (lang === 'hi' ? 'वर्ष' : lang === 'hinglish' ? 'saal' : 'Years');

  if (hasAnalyzed) analyze();
}

langToggle.addEventListener('change', updateLanguage);

window.addEventListener('DOMContentLoaded', () => {
  $('dLoan').textContent   = fmtINR(+$('iLoan').value);
  $('dRate').textContent   = (+$('iRate').value).toFixed(1) + '%';
  $('dTenure').textContent = $('iTenure').value + ' Years';
  $('dExtra').textContent  = fmtINR(+$('iExtra').value);
  
  updateLanguage();
  
  hasAnalyzed = true;
  analyze();
});
