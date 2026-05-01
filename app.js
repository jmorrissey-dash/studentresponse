const responseData = {
  returning: [
    { value: "No, this is my first time", label: "No, this is my first time - Start fresh" },
    { value: "Yes, this is a follow-up", label: "Yes, this is a follow-up - Continue from previous work" }
  ],
  lastOutcome: [
    "The student opened up more",
    "I learned something new",
    "No real change yet",
    "Not sure"
  ],
  nextIntent: [
    "Stay the course",
    "Try a different approach",
    "Focus on a different need",
    "Loop in another adult"
  ],
  signal: [
    "Drop in academic engagement",
    "Low student-life engagement",
    "Few or no adult connections",
    "Increase in infractions or behavioral concerns",
    "Attendance or follow-through concerns",
    "Student seems socially disconnected",
    "Student appears fine but may be overlooked",
    "Other / not sure"
  ],
  lenses: [
    {
      name: "Connection",
      text: "They may not feel known, supported, or like they belong."
    },
    {
      name: "Capacity",
      text: "They may be overwhelmed, disorganized, or struggling to keep up."
    },
    {
      name: "Meaning",
      text: "They may not see purpose, value, or relevance in what they are doing."
    },
    {
      name: "Not sure yet",
      text: "I need to learn more before choosing."
    }
  ],
  needsByLens: {
    Connection: {
      question: "What kind of connection support does this student need most?",
      options: [
        { label: "Feel seen by an adult", mappedNeed: "Connection" },
        { label: "Build a consistent adult relationship", mappedNeed: "Connection" },
        { label: "Feel more socially included", mappedNeed: "Connection" },
        { label: "Reconnect with school life", mappedNeed: "Purpose & Engagement" },
        { label: "I need to learn more", mappedNeed: "Clarity" }
      ]
    },
    Capacity: {
      question: "What kind of support would help this student function better right now?",
      options: [
        { label: "Organize next steps", mappedNeed: "Structure & Support" },
        { label: "Reduce overwhelm", mappedNeed: "Structure & Support" },
        { label: "Clarify expectations", mappedNeed: "Structure & Support" },
        { label: "Build confidence through a small win", mappedNeed: "Purpose & Engagement" },
        { label: "I need to learn more", mappedNeed: "Clarity" }
      ]
    },
    Meaning: {
      question: "What kind of meaning or engagement support does this student need?",
      options: [
        { label: "Connect to strengths or interests", mappedNeed: "Purpose & Engagement" },
        { label: "Find a reason to engage", mappedNeed: "Purpose & Engagement" },
        { label: "Feel their contribution matters", mappedNeed: "Purpose & Engagement" },
        { label: "Build a relationship that makes engagement feel safer", mappedNeed: "Connection" },
        { label: "I need to learn more", mappedNeed: "Clarity" }
      ]
    },
    "Not sure yet": {
      question: "What do you need to understand first?",
      options: [
        { label: "What they are experiencing", mappedNeed: "Clarity" },
        { label: "What feels hard right now", mappedNeed: "Clarity" },
        { label: "What support they want", mappedNeed: "Clarity" },
        { label: "Who they feel connected to", mappedNeed: "Connection" }
      ]
    }
  },
  moves: {
    Connection: [
      "Have a quick, low-pressure check-in",
      "Ask 1-2 real questions and listen",
      "Follow up on something they have shared",
      "Notice and name something specific you have seen",
      "Connect them with another adult",
      "Acknowledge them publicly or privately"
    ],
    "Structure & Support": [
      "Help them set one small, clear goal",
      "Break a task into next steps",
      "Identify one barrier and one support",
      "Set a simple check-in or accountability point",
      "Clarify expectations or priorities",
      "Offer a quick reset or fresh start"
    ],
    "Purpose & Engagement": [
      "Ask what they care about or enjoy",
      "Name a strength you see",
      "Connect work to an interest or goal",
      "Give them a small role or responsibility",
      "Invite their input or perspective",
      "Help them see progress or growth"
    ],
    Clarity: [
      "Start with a conversation to learn more",
      "Ask what has been harder than usual",
      "Ask what is going well",
      "Ask what they need right now"
    ]
  },
  followUps: {
    Connection: [
      "Check back in within a few days",
      "Reference something they shared",
      "Notice and name another moment you have seen",
      "Help deepen or expand their connections"
    ],
    "Structure & Support": [
      "Check in on progress toward the goal",
      "Follow through on accountability",
      "Adjust the plan or next steps",
      "Reinforce effort or small wins"
    ],
    "Purpose & Engagement": [
      "Revisit what they care about or enjoy",
      "Name growth, effort, or progress",
      "Build on their interest or role",
      "Invite further input or ownership"
    ],
    Clarity: [
      "Follow up after your initial conversation",
      "Reflect back what you heard",
      "Ask a deeper or more focused question",
      "Decide on a clearer next step together"
    ]
  }
};

const requiredSteps = ["returning", "signal", "lens", "need", "move", "followUp"];
const mainSteps = ["signal", "lens", "need", "move", "followUp"];
const suggestedMoves = {
  Connection: "Have a quick, low-pressure check-in",
  "Structure & Support": "Help them set one small, clear goal",
  "Purpose & Engagement": "Ask what they care about or enjoy",
  Clarity: "Start with a conversation to learn more"
};
const summaryOrder = [
  ["signal", "Signal"],
  ["lens", "Lens"],
  ["need", "Selected need"],
  ["mappedNeed", "Mapped need"],
  ["move", "Move"],
  ["followUp", "Follow-up"]
];

const form = document.querySelector("#responseForm");
const template = document.querySelector("#choiceTemplate");
const summaryList = document.querySelector("#summaryList");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const statusPill = document.querySelector("#statusPill");
const notes = document.querySelector("#notes");
const signalOther = document.querySelector("#signalOther");
const copyStatus = document.querySelector("#copyStatus");
const followUpContext = document.querySelector("#followUpContext");
const needQuestion = document.querySelector("#needQuestion");
const moveLegend = document.querySelector("#moveLegend");
const followUpLegend = document.querySelector("#followUpLegend");
const suggestedMove = document.querySelector("#suggestedMove");
const generatedSummaryText = document.querySelector("#generatedSummaryText");
const generateSummaryButton = document.querySelector("#generateSummary");
const copyGeneratedSummaryButton = document.querySelector("#copyGeneratedSummary");
const generatedCopyStatus = document.querySelector("#generatedCopyStatus");

const state = {
  returning: "",
  lastOutcome: "",
  nextIntent: "",
  signal: "",
  lens: "",
  need: "",
  mappedNeed: "",
  move: "",
  followUp: "",
  notes: "",
  generatedSummary: ""
};

const lensPhrases = {
  Connection: "the student may not feel fully known, supported, or connected",
  Capacity: "the student may be feeling overwhelmed or may need more structure to keep up",
  Meaning: "the student may need more purpose, relevance, or connection to what they are doing",
  "Not sure yet": "there is more to understand before deciding what kind of support will help most"
};

function safeId(groupName, value) {
  return `${groupName}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function createChoice(groupName, value, label = value) {
  const choice = template.content.firstElementChild.cloneNode(true);
  const input = choice.querySelector("input");
  const copy = choice.querySelector(".choice-copy");

  input.name = groupName;
  input.value = value;
  input.id = safeId(groupName, value);
  copy.textContent = label;

  return choice;
}

function createDescribedChoice(groupName, value, description) {
  const choice = template.content.firstElementChild.cloneNode(true);
  const input = choice.querySelector("input");
  const copy = choice.querySelector(".choice-copy");
  const title = document.createElement("strong");
  const detail = document.createElement("span");

  input.name = groupName;
  input.value = value;
  input.id = safeId(groupName, value);
  title.textContent = value;
  detail.textContent = description;
  copy.classList.add("choice-copy-described");
  copy.replaceChildren(title, detail);

  return choice;
}

function renderSimpleGroup(groupName, values) {
  const container = document.querySelector(`[data-group="${groupName}"]`);
  container.innerHTML = "";

  values.forEach((item) => {
    const value = typeof item === "string" ? item : item.value;
    const label = typeof item === "string" ? item : item.label;
    container.append(createChoice(groupName, value, label));
  });
}

function renderDescribedGroup(groupName, items) {
  const container = document.querySelector(`[data-group="${groupName}"]`);
  container.innerHTML = "";

  items.forEach((item) => {
    container.append(createDescribedChoice(groupName, item.name, item.text));
  });
}

function needOptionsForCurrentLens() {
  return responseData.needsByLens[state.lens] || null;
}

function mappedNeedForLabel(label) {
  const current = needOptionsForCurrentLens();
  if (!current) return "";

  const option = current.options.find((item) => item.label === label);
  return option ? option.mappedNeed : "";
}

function renderNeeds() {
  const container = document.querySelector('[data-group="need"]');
  const current = needOptionsForCurrentLens();
  container.innerHTML = "";

  if (!current) {
    needQuestion.textContent = "Select a lens first.";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Need options will appear after you choose a lens.";
    container.append(empty);
    state.need = "";
    state.mappedNeed = "";
    return;
  }

  needQuestion.textContent = current.question;
  current.options.forEach((option) => {
    container.append(createChoice("need", option.label));
  });

  if (!mappedNeedForLabel(state.need)) {
    state.need = "";
    state.mappedNeed = "";
  }
}

function renderMoves() {
  const container = document.querySelector('[data-group="move"]');
  container.innerHTML = "";

  if (!state.mappedNeed) {
    moveLegend.textContent = "Select a need first";
    suggestedMove.textContent = "Suggested move: Select a need first";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Move options will appear after you choose a need.";
    container.append(empty);
    state.move = "";
    return;
  }

  moveLegend.textContent = `${state.mappedNeed} moves`;
  suggestedMove.textContent = `Suggested move: ${suggestedMoves[state.mappedNeed]}`;
  responseData.moves[state.mappedNeed].forEach((move) => {
    container.append(createChoice("move", move));
  });

  if (!responseData.moves[state.mappedNeed].includes(state.move)) {
    state.move = "";
  }
}

function renderFollowUps() {
  const container = document.querySelector('[data-group="followUp"]');
  container.innerHTML = "";

  if (!state.mappedNeed) {
    followUpLegend.textContent = "Select a need first";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Follow-up options will appear after you choose a need.";
    container.append(empty);
    state.followUp = "";
    return;
  }

  followUpLegend.textContent = `${state.mappedNeed} follow-up options`;
  responseData.followUps[state.mappedNeed].forEach((followUp) => {
    container.append(createChoice("followUp", followUp));
  });

  if (!responseData.followUps[state.mappedNeed].includes(state.followUp)) {
    state.followUp = "";
  }
}

function selectedValue(name) {
  const selected = form.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function syncStateFromForm() {
  summaryOrder.forEach(([key]) => {
    if (key !== "signal" && key !== "followUp") {
      state[key] = selectedValue(key);
    }
  });

  const selectedSignal = selectedValue("signal");
  state.signal = signalOther.value.trim() || selectedSignal;
  state.mappedNeed = mappedNeedForLabel(state.need);

  state.followUp = selectedValue("followUp");
  state.notes = notes.value.trim();
}

function updateConditionalSections() {
  const isFollowUp = state.returning === "Yes, this is a follow-up";
  followUpContext.hidden = !isFollowUp;

  if (!isFollowUp) {
    form.querySelectorAll('input[name="lastOutcome"], input[name="nextIntent"]').forEach((input) => {
      input.checked = false;
    });
    state.lastOutcome = "";
    state.nextIntent = "";
  }
}

function completedStepCount() {
  return mainSteps.filter((step) => Boolean(state[step])).length;
}

function canGenerateSummary() {
  return mainSteps.every((step) => Boolean(state[step]));
}

function isReady() {
  return requiredSteps.every((step) => Boolean(state[step]));
}

function visibleSummaryRows() {
  return summaryOrder.filter(([key]) => {
    return true;
  });
}

function summaryText() {
  const lines = ["Millbrook Student Response Flow", ""];

  visibleSummaryRows().forEach(([key, label]) => {
    lines.push(`${label}: ${state[key] || "Not selected yet"}`);
  });

  if (state.notes) {
    lines.push("", `Private notes: ${state.notes}`);
  }

  return lines.join("\n");
}

function sentenceCase(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function actionPhrase(text) {
  if (!text) return "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function followUpPhrase(text) {
  const gerunds = {
    Check: "checking",
    Reference: "referencing",
    Notice: "noticing",
    Help: "helping",
    Follow: "following",
    Adjust: "adjusting",
    Reinforce: "reinforcing",
    Revisit: "revisiting",
    Name: "naming",
    Build: "building",
    Invite: "inviting",
    Reflect: "reflecting",
    Ask: "asking",
    Decide: "deciding"
  };
  const [firstWord, ...rest] = text.split(" ");

  if (gerunds[firstWord]) {
    return [gerunds[firstWord], ...rest].join(" ").toLowerCase();
  }

  return actionPhrase(text);
}

function generatedSummary() {
  if (!canGenerateSummary()) {
    return "";
  }

  return [
    `You noticed ${actionPhrase(state.signal)}.`,
    `This suggests ${lensPhrases[state.lens] || "the student may need a closer look and a supportive next step"}.`,
    `Based on that, you are focusing on helping them ${actionPhrase(state.need)}.`,
    `Your next step is to ${actionPhrase(state.move)}.`,
    `You plan to follow up by ${followUpPhrase(state.followUp)}.`
  ].join(" ");
}

function updateGeneratedSummary() {
  if (state.generatedSummary) {
    generatedSummaryText.textContent = state.generatedSummary;
    copyGeneratedSummaryButton.disabled = false;
  } else {
    generatedSummaryText.textContent = "Complete the flow, then generate a summary.";
    copyGeneratedSummaryButton.disabled = true;
  }
}

function updateSummary() {
  summaryList.innerHTML = "";

  visibleSummaryRows().forEach(([key, label]) => {
    const item = document.createElement("div");
    item.className = "summary-item";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    const valueEl = document.createElement("strong");
    valueEl.textContent = state[key] || "Not selected yet";

    item.append(labelEl, valueEl);
    summaryList.append(item);
  });

  const count = completedStepCount();
  progressText.textContent = `Step ${count} of 5`;
  progressBar.style.width = `${Math.round((count / 5) * 100)}%`;

  if (isReady()) {
    statusPill.textContent = "Ready";
    statusPill.classList.add("complete");
  } else {
    statusPill.textContent = "In progress";
    statusPill.classList.remove("complete");
  }

  generateSummaryButton.disabled = !canGenerateSummary();
  updateGeneratedSummary();
}

function saveState() {
  localStorage.setItem("millbrook-response-flow", JSON.stringify(state));
}

function restoreState() {
  const saved = localStorage.getItem("millbrook-response-flow");
  if (!saved) return;

  Object.assign(state, JSON.parse(saved));
  const savedMove = state.move;
  const savedFollowUp = state.followUp;
  notes.value = state.notes || "";

  if (!responseData.signal.includes(state.signal) && state.signal) {
    signalOther.value = state.signal;
  }

  [...summaryOrder, ["returning"], ["lastOutcome"], ["nextIntent"]].forEach(([key]) => {
    if (key === "mappedNeed") return;
    const value = key === "signal" && signalOther.value ? "" : state[key];
    if (!value) return;

    const input = form.querySelector(`input[name="${key}"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  });

  updateConditionalSections();
  renderNeeds();
  if (state.need) {
    const needInput = form.querySelector(`input[name="need"][value="${CSS.escape(state.need)}"]`);
    if (needInput) needInput.checked = true;
  }
  state.mappedNeed = mappedNeedForLabel(state.need);
  renderMoves();
  renderFollowUps();
  state.move = savedMove;
  state.followUp = savedFollowUp;

  if (savedMove) {
    const moveInput = form.querySelector(`input[name="move"][value="${CSS.escape(savedMove)}"]`);
    if (moveInput) moveInput.checked = true;
  }

  if (savedFollowUp) {
    const followUpInput = form.querySelector(`input[name="followUp"][value="${CSS.escape(savedFollowUp)}"]`);
    if (followUpInput) followUpInput.checked = true;
  }
}

function handleChange(event) {
  const changedName = event.target.name;
  syncStateFromForm();
  updateConditionalSections();

  if (changedName === "lens") {
    state.need = "";
    state.mappedNeed = "";
    state.move = "";
    state.followUp = "";
    state.generatedSummary = "";
    renderNeeds();
    renderMoves();
    renderFollowUps();
  }

  if (changedName === "need") {
    state.mappedNeed = mappedNeedForLabel(state.need);
    state.move = "";
    state.followUp = "";
    state.generatedSummary = "";
    renderMoves();
    renderFollowUps();
  }

  if (["signal", "move", "followUp"].includes(changedName) || event.target.id === "signalOther") {
    state.generatedSummary = "";
  }

  syncStateFromForm();
  updateSummary();
  saveState();
}

function resetAll() {
  form.reset();
  notes.value = "";
  signalOther.value = "";
  Object.keys(state).forEach((key) => {
    state[key] = "";
  });
  localStorage.removeItem("millbrook-response-flow");
  updateConditionalSections();
  renderNeeds();
  renderMoves();
  renderFollowUps();
  updateSummary();
  copyStatus.textContent = "";
  generatedCopyStatus.textContent = "";
}

renderSimpleGroup("returning", responseData.returning);
renderSimpleGroup("lastOutcome", responseData.lastOutcome);
renderSimpleGroup("nextIntent", responseData.nextIntent);
renderSimpleGroup("signal", responseData.signal);
renderDescribedGroup("lens", responseData.lenses);
renderNeeds();
renderMoves();
renderFollowUps();
restoreState();
syncStateFromForm();
updateConditionalSections();
renderNeeds();
renderMoves();
renderFollowUps();
updateSummary();

form.addEventListener("change", handleChange);
signalOther.addEventListener("input", handleChange);
notes.addEventListener("input", handleChange);

document.querySelector("#copySummary").addEventListener("click", async () => {
  const text = summaryText();

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    document.body.append(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  copyStatus.textContent = "Summary copied.";
});

generateSummaryButton.addEventListener("click", () => {
  const text = generatedSummary();

  if (!text) {
    state.generatedSummary = "";
    generatedSummaryText.textContent = "Select a signal, lens, need, move, and follow-up first.";
    copyGeneratedSummaryButton.disabled = true;
    return;
  }

  state.generatedSummary = text;
  generatedCopyStatus.textContent = "";
  updateGeneratedSummary();
  saveState();
});

copyGeneratedSummaryButton.addEventListener("click", async () => {
  if (!state.generatedSummary) return;

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(state.generatedSummary);
  } else {
    const helper = document.createElement("textarea");
    helper.value = state.generatedSummary;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    document.body.append(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  generatedCopyStatus.textContent = "Summary copied.";
});

document.querySelector("#printSummary").addEventListener("click", () => {
  window.print();
});

document.querySelector("#resetForm").addEventListener("click", resetAll);
