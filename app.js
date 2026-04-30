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
      text: "They may not feel known, supported, or like they belong"
    },
    {
      name: "Capacity",
      text: "They may be overwhelmed, disorganized, or struggling to keep up"
    },
    {
      name: "Meaning",
      text: "They may not see purpose, value, or relevance in what they are doing"
    },
    {
      name: "Not sure yet",
      text: "I need to learn more before choosing"
    }
  ],
  needs: [
    {
      name: "Connection",
      text: "More consistent, meaningful interaction with an adult"
    },
    {
      name: "Structure & Support",
      text: "Clear expectations, help getting organized, or accountability"
    },
    {
      name: "Purpose & Engagement",
      text: "A reason to engage; connection to strengths, interests, or goals"
    },
    {
      name: "Clarity",
      text: "I need to talk with the student to better understand"
    }
  ],
  moves: {
    Connection: [
      "Have a quick, low-pressure check-in",
      "Ask 1-2 real questions and listen",
      "Follow up on something they have shared",
      "Connect them with another adult"
    ],
    "Structure & Support": [
      "Help them set one small, clear goal",
      "Break a task into next steps",
      "Identify one barrier and one support",
      "Set a simple check-in or accountability point"
    ],
    "Purpose & Engagement": [
      "Ask what they care about or enjoy",
      "Name a strength you see",
      "Connect work to an interest or goal",
      "Give them a small role or responsibility"
    ],
    Clarity: [
      "Start with a conversation to learn more"
    ]
  },
  followUp: [
    "Check back in within a few days",
    "Reference something they shared",
    "Follow through on something you said you would do",
    "Loop in another adult for support"
  ]
};

const requiredSteps = ["returning", "signal", "lens", "need", "move", "followUp"];
const summaryOrder = [
  ["returning", "Returning to student"],
  ["lastOutcome", "What happened last time"],
  ["nextIntent", "Next intention"],
  ["signal", "Signal"],
  ["lens", "Lens"],
  ["need", "Need"],
  ["move", "Move"],
  ["followUp", "Follow-up plan"]
];

const form = document.querySelector("#responseForm");
const template = document.querySelector("#choiceTemplate");
const summaryList = document.querySelector("#summaryList");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const statusPill = document.querySelector("#statusPill");
const notes = document.querySelector("#notes");
const signalOther = document.querySelector("#signalOther");
const followUpOther = document.querySelector("#followUpOther");
const copyStatus = document.querySelector("#copyStatus");
const followUpContext = document.querySelector("#followUpContext");
const moveLegend = document.querySelector("#moveLegend");

const state = {
  returning: "",
  lastOutcome: "",
  nextIntent: "",
  signal: "",
  lens: "",
  need: "",
  move: "",
  followUp: "",
  notes: ""
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
    container.append(createChoice(groupName, item.name, `${item.name}: ${item.text}`));
  });
}

function renderMoves() {
  const container = document.querySelector('[data-group="move"]');
  container.innerHTML = "";

  if (!state.need) {
    moveLegend.textContent = "Select a need first";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Move options will appear after you choose a need.";
    container.append(empty);
    state.move = "";
    return;
  }

  moveLegend.textContent = `${state.need} moves`;
  responseData.moves[state.need].forEach((move) => {
    container.append(createChoice("move", move));
  });

  if (!responseData.moves[state.need].includes(state.move)) {
    state.move = "";
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

  const selectedFollowUp = selectedValue("followUp");
  state.followUp = followUpOther.value.trim() || selectedFollowUp;
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
  const completedSteps = [
    Boolean(state.returning),
    Boolean(state.signal),
    Boolean(state.lens),
    Boolean(state.need),
    Boolean(state.move),
    Boolean(state.followUp)
  ];

  return completedSteps.filter(Boolean).length;
}

function isReady() {
  return requiredSteps.every((step) => Boolean(state[step]));
}

function visibleSummaryRows() {
  return summaryOrder.filter(([key]) => {
    if ((key === "lastOutcome" || key === "nextIntent") && state.returning !== "Yes, this is a follow-up") {
      return false;
    }

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
  progressText.textContent = `${count} of 6 steps`;
  progressBar.style.width = `${Math.round((count / 6) * 100)}%`;

  if (isReady()) {
    statusPill.textContent = "Ready";
    statusPill.classList.add("complete");
  } else {
    statusPill.textContent = "In progress";
    statusPill.classList.remove("complete");
  }
}

function saveState() {
  localStorage.setItem("millbrook-response-flow", JSON.stringify(state));
}

function restoreState() {
  const saved = localStorage.getItem("millbrook-response-flow");
  if (!saved) return;

  Object.assign(state, JSON.parse(saved));
  const savedMove = state.move;
  notes.value = state.notes || "";

  if (!responseData.signal.includes(state.signal) && state.signal) {
    signalOther.value = state.signal;
  }

  if (!responseData.followUp.includes(state.followUp) && state.followUp) {
    followUpOther.value = state.followUp;
  }

  summaryOrder.forEach(([key]) => {
    const value = key === "signal" && signalOther.value ? "" : key === "followUp" && followUpOther.value ? "" : state[key];
    if (!value) return;

    const input = form.querySelector(`input[name="${key}"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  });

  updateConditionalSections();
  renderMoves();
  state.move = savedMove;

  if (savedMove) {
    const moveInput = form.querySelector(`input[name="move"][value="${CSS.escape(savedMove)}"]`);
    if (moveInput) moveInput.checked = true;
  }
}

function handleChange(event) {
  const changedName = event.target.name;
  syncStateFromForm();
  updateConditionalSections();

  if (changedName === "need") {
    state.move = "";
    renderMoves();
  }

  syncStateFromForm();
  updateSummary();
  saveState();
}

function resetAll() {
  form.reset();
  notes.value = "";
  signalOther.value = "";
  followUpOther.value = "";
  Object.keys(state).forEach((key) => {
    state[key] = "";
  });
  localStorage.removeItem("millbrook-response-flow");
  updateConditionalSections();
  renderMoves();
  updateSummary();
  copyStatus.textContent = "";
}

renderSimpleGroup("returning", responseData.returning);
renderSimpleGroup("lastOutcome", responseData.lastOutcome);
renderSimpleGroup("nextIntent", responseData.nextIntent);
renderSimpleGroup("signal", responseData.signal);
renderDescribedGroup("lens", responseData.lenses);
renderDescribedGroup("need", responseData.needs);
renderSimpleGroup("followUp", responseData.followUp);
renderMoves();
restoreState();
syncStateFromForm();
updateConditionalSections();
renderMoves();
updateSummary();

form.addEventListener("change", handleChange);
signalOther.addEventListener("input", handleChange);
followUpOther.addEventListener("input", handleChange);
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

document.querySelector("#printSummary").addEventListener("click", () => {
  window.print();
});

document.querySelector("#resetForm").addEventListener("click", resetAll);
