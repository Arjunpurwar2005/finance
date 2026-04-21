const bankRules = {
  HDFC: {
    prepaymentPenalty: {
      "Home Loan": "Floating rate home loan par usually individual borrowers ke liye prepayment penalty nahi hoti.",
      "Personal Loan": "Personal loan par around 2% to 4% prepayment charge lag sakta hai.",
      "Car Loan": "Car loan par commonly 2% to 3% foreclosure ya part-payment charge lag sakta hai."
    },
    processingFee: {
      "Home Loan": "Approx 0.5% tak processing fee ho sakti hai, minimum cap alag ho sakta hai.",
      "Personal Loan": "Approx 1% to 2.5% fee dekhne ko mil sakti hai.",
      "Car Loan": "Usually fixed ya slab-based fee hoti hai."
    },
    specialCondition: "Part-payment rules ticket size aur loan age par depend kar sakte hain."
  },
  SBI: {
    prepaymentPenalty: {
      "Home Loan": "Home loan par individual borrowers ke liye generally prepayment penalty nahi hoti.",
      "Personal Loan": "Personal loan par bank terms ke hisaab se charge lag sakta hai.",
      "Car Loan": "Car loan closure par 2% ke aas-paas charges ho sakte hain."
    },
    processingFee: {
      "Home Loan": "Campaign period mein low ya zero processing fee mil sakti hai.",
      "Personal Loan": "Small percentage processing fee lag sakti hai.",
      "Car Loan": "Processing fee fixed amount ya percentage dono ho sakti hai."
    },
    specialCondition: "Government bank hone ki wajah se terms comparatively simple hoti hain, but exact sanction letter dekhna best hota hai."
  },
  ICICI: {
    prepaymentPenalty: {
      "Home Loan": "Floating home loan borrowers ke liye penalty usually nahi hoti.",
      "Personal Loan": "Personal loan par 3% to 5% tak charges possible hain.",
      "Car Loan": "Car loan foreclosure par percentage-based fee lag sakti hai."
    },
    processingFee: {
      "Home Loan": "Around 0.5% ya policy-based fee ho sakti hai.",
      "Personal Loan": "Usually percentage fee lagti hai.",
      "Car Loan": "File charges aur processing fee dono ho sakte hain."
    },
    specialCondition: "Kuch products mein minimum EMI history ke baad hi prepayment allow hota hai."
  }
};

const conversationHistory = [];

const elements = {
  loanAmount: document.getElementById("loanAmount"),
  interestRate: document.getElementById("interestRate"),
  interestRateDisplay: document.getElementById("interestRateDisplay"),
  tenureYears: document.getElementById("tenureYears"),
  tenureDisplay: document.getElementById("tenureDisplay"),
  loanType: document.getElementById("loanType"),
  bankName: document.getElementById("bankName"),
  interestType: document.getElementById("interestType"),
  emiType: document.getElementById("emiType"),
  currentEmi: document.getElementById("currentEmi"),
  loanAgeMonths: document.getElementById("loanAgeMonths"),
  loanAgeDisplay: document.getElementById("loanAgeDisplay"),
  emiValue: document.getElementById("emiValue"),
  emiSubtext: document.getElementById("emiSubtext"),
  stageValue: document.getElementById("stageValue"),
  stageSubtext: document.getElementById("stageSubtext"),
  amountPaidValue: document.getElementById("amountPaidValue"),
  amountPaidSubtext: document.getElementById("amountPaidSubtext"),
  interestPaidValue: document.getElementById("interestPaidValue"),
  interestPaidSubtext: document.getElementById("interestPaidSubtext"),
  principalPaidValue: document.getElementById("principalPaidValue"),
  principalPaidSubtext: document.getElementById("principalPaidSubtext"),
  totalPayValue: document.getElementById("totalPayValue"),
  totalPaySubtext: document.getElementById("totalPaySubtext"),
  chatToggle: document.getElementById("chatToggle"),
  chatPanel: document.getElementById("chatPanel"),
  chatWindow: document.getElementById("chatWindow"),
  chatInput: document.getElementById("chatInput"),
  sendButton: document.getElementById("sendButton"),
  quickButtons: document.querySelectorAll(".quick-btn")
};

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount).replace("₹", "Rs ");
}

function getLoanInputs() {
  const tenureYears = Number(elements.tenureYears.value) || 0;
  const tenureMonths = tenureYears * 12;
  const monthsPaid = Math.min(Number(elements.loanAgeMonths.value) || 0, Math.max(0, tenureMonths - 1));
  const currentEmiRaw = elements.currentEmi.value.trim();

  return {
    principal: Number(elements.loanAmount.value) || 0,
    annualRate: Number(elements.interestRate.value) || 0,
    tenureYears,
    tenureMonths,
    loanType: elements.loanType.value,
    bankName: elements.bankName.value,
    interestType: elements.interestType.value,
    emiType: elements.emiType.value,
    monthsPaid,
    currentEmiInput: currentEmiRaw === "" ? null : Number(currentEmiRaw)
  };
}

function calculateReducingEMI(principal, annualRate, tenureMonths) {
  if (!principal || !annualRate || !tenureMonths) return 0;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function calculateFlatEMI(principal, annualRate, tenureMonths) {
  if (!principal || !annualRate || !tenureMonths) return 0;
  const years = tenureMonths / 12;
  const totalInterest = principal * (annualRate / 100) * years;
  return (principal + totalInterest) / tenureMonths;
}

function calculateEMI(principal, annualRate, tenureMonths, emiType) {
  return emiType === "Flat Rate"
    ? calculateFlatEMI(principal, annualRate, tenureMonths)
    : calculateReducingEMI(principal, annualRate, tenureMonths);
}

function calculateReducingOutstanding(principal, annualRate, emi, monthsPaid) {
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  for (let month = 0; month < monthsPaid; month += 1) {
    const interestPart = balance * monthlyRate;
    const principalPart = emi - interestPart;
    balance = Math.max(0, balance - principalPart);
  }
  return balance;
}

function calculateFlatOutstanding(principal, tenureMonths, monthsPaid) {
  if (!tenureMonths) return 0;
  return Math.max(0, principal - (principal / tenureMonths) * monthsPaid);
}

function calculateOutstanding(principal, annualRate, emi, tenureMonths, monthsPaid, emiType) {
  return emiType === "Flat Rate"
    ? calculateFlatOutstanding(principal, tenureMonths, monthsPaid)
    : calculateReducingOutstanding(principal, annualRate, emi, monthsPaid);
}

function calculateRemainingMonths(outstanding, annualRate, emi, emiType) {
  if (outstanding <= 0 || emi <= 0) return 0;
  if (emiType === "Flat Rate") {
    const monthlyPrincipal = outstanding > 0 ? emi - (outstanding * annualRate / 12 / 100) : 0;
    return monthlyPrincipal > 0 ? Math.ceil(outstanding / monthlyPrincipal) : 0;
  }

  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.ceil(outstanding / emi);
  const ratio = emi / (emi - outstanding * monthlyRate);
  if (ratio <= 0) return 0;
  return Math.ceil(Math.log(ratio) / Math.log(1 + monthlyRate));
}

function getStage(monthsPaid, tenureMonths) {
  const progress = tenureMonths ? monthsPaid / tenureMonths : 0;
  if (progress <= 0.33) {
    return {
      key: "early",
      title: "Early stage",
      insight: "EMI ka major part abhi interest mein ja raha hai."
    };
  }
  if (progress <= 0.7) {
    return {
      key: "middle",
      title: "Mid stage",
      insight: "Ab interest aur principal dono ka mix chal raha hai."
    };
  }
  return {
    key: "late",
    title: "Late stage",
    insight: "Ab EMI ka bada hissa principal reduce kar raha hai."
  };
}

function getStructureInsights(interestType, emiType) {
  return {
    interestText: interestType === "Floating"
      ? "Floating rate hai, isliye future mein EMI ya tenure change ho sakta hai agar rates move karein."
      : "Fixed rate hai, isliye repayment structure zyada stable rehta hai.",
    emiText: emiType === "Flat Rate"
      ? "Flat rate mein overall interest burden usually higher hota hai."
      : "Reducing balance mein interest sirf remaining balance par lagta hai, jo generally better hota hai."
  };
}

function getCurrentBreakdown(snapshot) {
  if (snapshot.outstanding <= 0) {
    return { interestPart: 0, principalPart: 0 };
  }

  if (snapshot.emiType === "Flat Rate") {
    const totalInterest = snapshot.principal * (snapshot.annualRate / 100) * snapshot.tenureYears;
    const monthlyInterest = totalInterest / snapshot.tenureMonths;
    return {
      interestPart: monthlyInterest,
      principalPart: Math.max(0, snapshot.emi - monthlyInterest)
    };
  }

  const interestPart = snapshot.outstanding * (snapshot.annualRate / 12 / 100);
  return {
    interestPart,
    principalPart: Math.max(0, snapshot.emi - interestPart)
  };
}

function getPaymentSummary(inputs, emi) {
  if (!inputs.principal || !inputs.tenureMonths || !emi) {
    return {
      amountPaidTillNow: 0,
      interestPaidTillNow: 0,
      principalPaidTillNow: 0,
      totalInterestOverall: 0,
      totalPayableOverall: 0
    };
  }

  if (inputs.emiType === "Flat Rate") {
    const totalInterestOverall = inputs.principal * (inputs.annualRate / 100) * inputs.tenureYears;
    const totalPayableOverall = inputs.principal + totalInterestOverall;
    const monthlyInterest = totalInterestOverall / inputs.tenureMonths;
    const amountPaidTillNow = emi * inputs.monthsPaid;
    const interestPaidTillNow = Math.min(totalInterestOverall, monthlyInterest * inputs.monthsPaid);
    const principalPaidTillNow = Math.max(0, amountPaidTillNow - interestPaidTillNow);

    return {
      amountPaidTillNow,
      interestPaidTillNow,
      principalPaidTillNow,
      totalInterestOverall,
      totalPayableOverall
    };
  }

  let balance = inputs.principal;
  let interestPaidTillNow = 0;
  let principalPaidTillNow = 0;

  for (let month = 0; month < inputs.monthsPaid; month += 1) {
    const interestPart = balance * (inputs.annualRate / 12 / 100);
    const principalPart = Math.max(0, emi - interestPart);
    interestPaidTillNow += interestPart;
    principalPaidTillNow += principalPart;
    balance = Math.max(0, balance - principalPart);
  }

  const amountPaidTillNow = emi * inputs.monthsPaid;
  const totalPayableOverall = emi * inputs.tenureMonths;
  const totalInterestOverall = Math.max(0, totalPayableOverall - inputs.principal);

  return {
    amountPaidTillNow,
    interestPaidTillNow,
    principalPaidTillNow,
    totalInterestOverall,
    totalPayableOverall
  };
}

function extractPrepaymentAmount(message) {
  const normalized = message.replace(/,/g, "");
  const lakhMatch = normalized.match(/(\d+(?:\.\d+)?)\s*lakh/i);
  if (lakhMatch) return Number(lakhMatch[1]) * 100000;

  const rupeeMatch = normalized.match(/(?:rs\.?|rupees?)\s*(\d+(?:\.\d+)?)/i);
  if (rupeeMatch) return Number(rupeeMatch[1]);

  const bareNumberMatch = normalized.match(/(\d{5,8})/);
  return bareNumberMatch ? Number(bareNumberMatch[1]) : 0;
}

function createLoanSnapshot() {
  const inputs = getLoanInputs();
  const calculatedEmi = calculateEMI(inputs.principal, inputs.annualRate, inputs.tenureMonths, inputs.emiType);
  const emi = inputs.currentEmiInput !== null ? inputs.currentEmiInput : calculatedEmi;
  const calculatedOutstanding = calculateOutstanding(
    inputs.principal,
    inputs.annualRate,
    emi,
    inputs.tenureMonths,
    inputs.monthsPaid,
    inputs.emiType
  );
  const outstanding = calculatedOutstanding;
  const remainingMonths = calculateRemainingMonths(outstanding, inputs.annualRate, emi, inputs.emiType);
  const stage = getStage(inputs.monthsPaid, inputs.tenureMonths);
  const structure = getStructureInsights(inputs.interestType, inputs.emiType);
  const paymentSummary = getPaymentSummary(inputs, emi);
  const breakdown = getCurrentBreakdown({
    ...inputs,
    emi,
    outstanding
  });

  return {
    ...inputs,
    emi,
    outstanding,
    remainingMonths,
    stage,
    structure,
    paymentSummary,
    breakdown,
    emiSource: inputs.currentEmiInput !== null ? "manual" : "calculated"
  };
}

function buildLoanContext(snapshot) {
  const emiBreakdownPct = snapshot.emi > 0
    ? `(${Math.round((snapshot.breakdown.interestPart / snapshot.emi) * 100)}% interest, ${Math.round((snapshot.breakdown.principalPart / snapshot.emi) * 100)}% principal)`
    : "";

  return [
    "=== USER'S LOAN PROFILE ===",
    `Bank / Lender      : ${snapshot.bankName}`,
    `Loan Type          : ${snapshot.loanType}`,
    `Interest Type      : ${snapshot.interestType} Rate`,
    `EMI Calculation    : ${snapshot.emiType}`,
    "",
    "=== KEY NUMBERS ===",
    `Original Loan      : ${formatINR(Math.round(snapshot.principal))}`,
    `Interest Rate      : ${snapshot.annualRate.toFixed(1)}% per year`,
    `Total Tenure       : ${snapshot.tenureYears} years (${snapshot.tenureMonths} months)`,
    `Months Already Paid: ${snapshot.monthsPaid} months`,
    `Months Remaining   : ${snapshot.remainingMonths} months`,
    "",
    "=== CURRENT STATUS ===",
    `Monthly EMI        : ${formatINR(Math.round(snapshot.emi))} / month ${snapshot.emiSource === "manual" ? "(user-entered)" : "(calculated)"}`,
    `This Month Split   : Interest = ${formatINR(Math.round(snapshot.breakdown.interestPart))}, Principal = ${formatINR(Math.round(snapshot.breakdown.principalPart))} ${emiBreakdownPct}`,
    `Outstanding Balance: ${formatINR(Math.round(snapshot.outstanding))} still to be paid`,
    `Loan Stage         : ${snapshot.stage.title} — ${snapshot.stage.insight}`,
    "",
    "=== PAYMENT HISTORY SO FAR ===",
    `Total Paid Till Now: ${formatINR(Math.round(snapshot.paymentSummary.amountPaidTillNow))}`,
    `  ↳ Interest Paid  : ${formatINR(Math.round(snapshot.paymentSummary.interestPaidTillNow))}`,
    `  ↳ Principal Paid : ${formatINR(Math.round(snapshot.paymentSummary.principalPaidTillNow))}`,
    "",
    "=== TOTAL COST OF THIS LOAN ===",
    `Total You Will Pay : ${formatINR(Math.round(snapshot.paymentSummary.totalPayableOverall))}`,
    `  ↳ Principal      : ${formatINR(Math.round(snapshot.principal))}`,
    `  ↳ Total Interest : ${formatINR(Math.round(snapshot.paymentSummary.totalInterestOverall))} (extra cost of borrowing)`
  ].join("\n");
}

function buildCalculationContext(snapshot, message) {
  const extraPayment = extractPrepaymentAmount(message);
  const bankRule = bankRules[snapshot.bankName];

  const notes = [
    "=== BANK-SPECIFIC RULES ===",
    `Prepayment Rule    : ${bankRule.prepaymentPenalty[snapshot.loanType]}`,
    `Processing Fee Note: ${bankRule.processingFee[snapshot.loanType]}`,
    `Special Condition  : ${bankRule.specialCondition}`,
    "",
    "=== LOAN STRUCTURE INSIGHT ===",
    `Interest Type Note : ${snapshot.structure.interestText}`,
    `EMI Type Note      : ${snapshot.structure.emiText}`
  ];

  if (extraPayment > 0) {
    const newOutstanding = Math.max(0, snapshot.outstanding - extraPayment);
    const newRemainingMonths = calculateRemainingMonths(newOutstanding, snapshot.annualRate, snapshot.emi, snapshot.emiType);
    const monthsSaved = Math.max(0, snapshot.remainingMonths - newRemainingMonths);
    const interestBefore = Math.max(0, snapshot.emi * snapshot.remainingMonths - snapshot.outstanding);
    const interestAfter = Math.max(0, snapshot.emi * newRemainingMonths - newOutstanding);
    const interestSaved = Math.max(0, interestBefore - interestAfter);

    notes.push(
      "",
      "=== PREPAYMENT CALCULATION (use these numbers in your answer) ===",
      `User Wants to Prepay: ${formatINR(extraPayment)}`,
      `Outstanding BEFORE   : ${formatINR(Math.round(snapshot.outstanding))}`,
      `Outstanding AFTER    : ${formatINR(Math.round(newOutstanding))}`,
      `Remaining EMIs BEFORE: ${snapshot.remainingMonths} months`,
      `Remaining EMIs AFTER : ${newRemainingMonths} months`,
      `Months Saved         : ${monthsSaved} months (loan closes this much earlier)`,
      `Interest Saved       : ${formatINR(Math.round(interestSaved))} (this is the real benefit of prepaying)`
    );
  }

  return notes.join("\n");
}

function detectAdaptationInstruction(message) {
  const text = message.toLowerCase();
  if (
    text.includes("samajh nahi aaya") ||
    text.includes("phir se samjhao") ||
    text.includes("aur simple") ||
    text.includes("simple bana do")
  ) {
    return "Explain in even simpler Hinglish, use shorter sentences, and avoid finance jargon completely.";
  }
  if (text.includes("example se samjhao") || text.includes("example do")) {
    return "Explain with a real-life Indian example using relatable numbers and day-to-day language.";
  }

  const lastUserMessage = [...conversationHistory].reverse().find((entry) => entry.role === "user")?.content?.toLowerCase() || "";
  if (
    lastUserMessage.includes("samajh nahi aaya") ||
    lastUserMessage.includes("simple bana do") ||
    lastUserMessage.includes("example")
  ) {
    return "Continue explaining in a simpler, patient tone and refer back to the previous confusion.";
  }

  return "Always start with 'Simple samajh lo...' and structure the reply as what is happening, why it matters, and what the user should do.";
}

function getSystemPrompt() {
  return [
    "You are ArthSaathi — a trusted, friendly Indian financial advisor who speaks in natural Hinglish.",
    "You are like a knowledgeable dost who explains money matters simply, honestly, and without judgment.",
    "",
    "=== YOUR JOB ===",
    "The user has filled in their loan details in a form. Those details are given to you as LOAN CONTEXT.",
    "You MUST use these exact numbers in your answer. Never give generic advice — always refer to the user's actual loan.",
    "",
    "=== RESPONSE FORMAT (always follow this structure) ===",
    "1. START with: 'Simple samajh lo —' followed by a 1-line plain-language summary of the answer.",
    "2. SITUATION: What is happening with their loan right now based on the numbers.",
    "3. WHY IT MATTERS: Why this is important for them financially.",
    "4. ACTION: What they should concretely do — with specific numbers where possible.",
    "5. END with one encouraging line in Hinglish.",
    "",
    "=== LANGUAGE RULES ===",
    "- Mix Hindi and English naturally (Hinglish). Example: 'Tumhara outstanding balance Rs 18 lakh hai, jo abhi bhi bahut zyada hai.'",
    "- If you use a finance word (like 'amortization', 'prepayment', 'principal'), immediately explain it in brackets in simple words.",
    "- Use Indian number format: Rs 2,50,000 — not $250,000.",
    "- Keep sentences short. No paragraph longer than 3 lines.",
    "",
    "=== STRICT RULES ===",
    "- NEVER make up numbers. Only use numbers from the Loan Context given to you.",
    "- NEVER give generic advice like 'consult a financial advisor'. You ARE the advisor.",
    "- If a calculation is in the Financial Notes section, reference it directly.",
    "- If the user asks about prepayment, always show the interest saved and months reduced from the Financial Notes.",
    "- Keep total response under 200 words."
  ].join("\n");
}

function updateLoanSummary() {
  const snapshot = createLoanSnapshot();
  elements.loanAgeMonths.max = snapshot.tenureMonths || 1;
  if (Number(elements.loanAgeMonths.value) > snapshot.tenureMonths) {
    elements.loanAgeMonths.value = snapshot.tenureMonths;
  }

  elements.interestRateDisplay.textContent = `${snapshot.annualRate.toFixed(1)}%`;
  elements.tenureDisplay.textContent = `${snapshot.tenureYears} years`;
  elements.loanAgeDisplay.textContent = `${snapshot.monthsPaid} months`;
  elements.emiValue.textContent = `${formatINR(Math.round(snapshot.emi))} / month`;
  elements.emiSubtext.textContent = `${snapshot.loanType} with ${snapshot.bankName} | ${snapshot.interestType} | ${snapshot.emiType} | ${snapshot.emiSource === "manual" ? "your EMI" : "estimated EMI"}`;
  elements.stageValue.textContent = snapshot.stage.title;
  elements.stageSubtext.textContent = snapshot.stage.insight;
  elements.amountPaidValue.textContent = formatINR(Math.round(snapshot.paymentSummary.amountPaidTillNow));
  elements.amountPaidSubtext.textContent = `${snapshot.monthsPaid} paid EMIs ke basis par ab tak total paisa gaya.`;
  elements.interestPaidValue.textContent = formatINR(Math.round(snapshot.paymentSummary.interestPaidTillNow));
  elements.interestPaidSubtext.textContent = `Is amount mein se interest ka hissa itna gaya hai.`;
  elements.principalPaidValue.textContent = formatINR(Math.round(snapshot.paymentSummary.principalPaidTillNow));
  elements.principalPaidSubtext.textContent = `Ab tak principal amount mein se itna cover ho chuka hai.`;
  elements.totalPayValue.textContent = formatINR(Math.round(snapshot.paymentSummary.totalPayableOverall));
  elements.totalPaySubtext.textContent = `${formatINR(Math.round(snapshot.principal))} loan + ${formatINR(Math.round(snapshot.paymentSummary.totalInterestOverall))} interest.`;
}

function addMessage(text, sender) {
  const node = document.createElement("div");
  node.className = `message ${sender}`;
  node.textContent = text;
  elements.chatWindow.appendChild(node);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
  return node;
}

function addLoadingMessage() {
  const node = document.createElement("div");
  node.className = "message bot loading";
  node.innerHTML = `
    <span>ArthSaathi answer dhoond raha hai</span>
    <span class="typing-dots" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  elements.chatWindow.appendChild(node);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
  return node;
}

function showErrorInMessage(node, friendlyText, errorMessage) {
  node.className = "message bot";
  node.innerHTML = "";

  const mainText = document.createElement("div");
  mainText.textContent = friendlyText;

  const errorText = document.createElement("span");
  errorText.className = "error-text";
  errorText.textContent = `Actual error: ${errorMessage}`;

  node.appendChild(mainText);
  node.appendChild(errorText);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function pushHistory(role, content) {
  conversationHistory.push({ role, content });
  if (conversationHistory.length > 12) {
    conversationHistory.shift();
  }
}

function setChatOpen(isOpen) {
  elements.chatPanel.classList.toggle("chat-panel-hidden", !isOpen);
  elements.chatPanel.classList.toggle("chat-panel-floating", isOpen);
  elements.chatToggle.setAttribute("aria-expanded", String(isOpen));
  elements.chatToggle.querySelector(".chat-toggle-text").textContent = isOpen ? "Close" : "Chat";
  elements.chatToggle.querySelector(".chat-toggle-icon").textContent = isOpen ? "x" : "?";

  if (isOpen) {
    window.setTimeout(() => {
      elements.chatInput.focus();
      elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
    }, 50);
  }
}

function buildFallbackResponse(snapshot) {
  return [
    "Simple samajh lo, AI response tab chalega jab `config.js` mein API key add hogi.",
    `Abhi tumhara setup ${snapshot.loanType} with ${snapshot.bankName} hai, EMI approx ${formatINR(Math.round(snapshot.emi))} hai, aur loan left ${formatINR(Math.round(snapshot.outstanding))} ke aas-paas hai.`,
    `Why it matters: ${snapshot.stage.insight} ${snapshot.structure.interestText} ${snapshot.structure.emiText}`,
    "What you should do: `config.js` mein Gemini ya Mistral key daalo, phir main tumhari exact query ka AI-powered answer dunga."
  ].join("\n\n");
}

async function handleSendMessage(prefilledText) {
  const text = (prefilledText || elements.chatInput.value).trim();
  if (!text) return;

  const snapshot = createLoanSnapshot();
  addMessage(text, "user");
  pushHistory("user", text);
  elements.chatInput.value = "";
  elements.sendButton.disabled = true;
  elements.sendButton.textContent = "Loading...";

  const typingNode = addLoadingMessage();

  try {
    let responseText;
    if (typeof window.generateResponse === "function") {
      responseText = await window.generateResponse({
        systemPrompt: getSystemPrompt(),
        loanContext: buildLoanContext(snapshot),
        userQuery: text,
        conversationHistory,
        adaptationInstruction: detectAdaptationInstruction(text),
        calculationContext: buildCalculationContext(snapshot, text)
      });
    } else {
      responseText = buildFallbackResponse(snapshot);
    }

    typingNode.className = "message bot";
    typingNode.textContent = responseText;
    pushHistory("assistant", responseText);
  } catch (error) {
    const fallback = buildFallbackResponse(snapshot);
    showErrorInMessage(typingNode, fallback, error.message);
    pushHistory("assistant", fallback);
  } finally {
    elements.sendButton.disabled = false;
    elements.sendButton.textContent = "Send";
  }
}

[
  elements.loanAmount,
  elements.interestRate,
  elements.tenureYears,
  elements.loanType,
  elements.bankName,
  elements.interestType,
  elements.emiType,
  elements.currentEmi,
  elements.loanAgeMonths
].forEach((element) => {
  element.addEventListener("input", updateLoanSummary);
  element.addEventListener("change", updateLoanSummary);
});

elements.sendButton.addEventListener("click", () => {
  handleSendMessage();
});

elements.chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSendMessage();
  }
});

elements.quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleSendMessage(button.dataset.question);
  });
});

elements.chatToggle.addEventListener("click", () => {
  const isCurrentlyOpen = elements.chatToggle.getAttribute("aria-expanded") === "true";
  setChatOpen(!isCurrentlyOpen);
});

updateLoanSummary();
const welcomeMessage = [
  "Namaste, main ArthSaathi hoon.",
  "Simple samajh lo, ab main tumhare loan inputs ko context bana kar AI se jawab de sakta hoon.",
  "Agar tum bolo 'samajh nahi aaya', 'simple bana do', ya 'example se samjhao', toh main usi hisaab se response aur easy bana dunga."
].join("\n\n");
addMessage(welcomeMessage, "bot");
pushHistory("assistant", welcomeMessage);
setChatOpen(false);