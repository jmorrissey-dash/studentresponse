const responseData = {
  signal: [
    "Drop in academic engagement",
    "Low / no Connect-the-Dots connections",
    "Increase in infractions",
    "Student seems disengaged / checked out",
    "No major issue, but student feels invisible"
  ],
  lenses: [
    {
      name: "Connection",
      text: "Student may not feel known, valued, or supported"
    },
    {
      name: "Capacity",
      text: "Student may be overwhelmed, disorganized, or stressed"
    },
    {
      name: "Meaning",
      text: "Student may not see purpose or relevance"
    }
  ],
  pathways: {
    Connection: [
      "Build relationship / trust",
      "Increase adult connections",
      "Help student feel seen"
    ],
    Capacity: [
      "Add structure / clarity",
      "Reduce overwhelm",
      "Build follow-through"
    ],
    Meaning: [
      "Increase relevance / purpose",
      "Connect to strengths",
      "Re-engage interest"
    ]
  },
  actions: {
    Connection: [
      "1:1 check-in conversation (low pressure)",
      "Ask 2-3 get-to-know-you questions",
      "Follow up on something personal they shared",
      "Introduce/connect to another adult",
      "Invite them into something (team, role, space)"
    ],
    Capacity: [
      "Set one small SMART goal",
      "Break a task into smaller steps",
      "Identify one barrier + one support",
      "Create a simple check-in routine",
      "Pair accountability with encouragement"
    ],
    Meaning: [
      "Name a strength you see in them",
      "Ask what they care about / enjoy",
      "Connect work to personal interest",
      "Give them a small role or responsibility",
      "Reframe effort as progress"
    ]
  },
  starter: [
    "\"I have been thinking about you. How have things been going?\"",
    "\"What has been feeling harder than usual lately?\"",
    "\"What is something you have been enjoying recently?\"",
    "\"What would make this week feel more manageable?\""
  ],
  followUp: [
    "Check back in within 2-3 days",
    "Reference something they shared",
    "Follow through on a promise",
    "Loop in another adult (if needed)",
    "No follow-up planned (not recommended)"
  ],
  outcome: [
    "Student opened up more",
    "Learned something new",
    "No visible change yet",
    "Need to try a different approach"
  ],
  nextMove: [
    "Stay in same pathway",
    "Shift to different pathway",
    "Loop in additional support"
  ]
};

const requiredSteps = ["signal", "lens", "pathway", "action", "followUp"];
const summaryOrder = [
  ["signal", "Primary signal"],
  ["lens", "Interpretation lens"],
  ["pathway", "Response pathway"],
  ["action", "Small action"],
  ["starter", "Conversation starter"],
  ["followUp", "Follow-up plan"],
  ["outcome", "Outcome"],
  ["nextMove", "Next move"]
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

const state = {
  signal: "",
  lens: "",
  pathway: "",
  action: "",
  starter: "",
  followUp: "",
  outcome: "",
  nextMove: "",
  notes: ""
};

function createChoice(groupName, value, label = value) {
  const choice = template.content.firstElementChild.cloneNode(true);
  const input = choice.querySelector("input");
  const copy = choice.querySelector(".choice-copy");

  input.name = groupName;
  input.value = value;
  input.id = `${groupName}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  copy.textContent = label;

  return choice;
}

function renderSimpleGroup(groupName, values) {
  const container = document.querySelector(`[data-group="${groupName}"]`);
  container.innerHTML = "";
  values.forEach((value) => container.append(createChoice(groupName, value)));
}

function renderLenses() {
  const container = document.querySelector('[data-group="lens"]');
  container.innerHTML = "";
  responseData.lenses.forEach((lens) => {
    const label = `${lens.name}: ${lens.text}`;
    container.append(createChoice("lens", lens.name, label));
  });
}

function renderPathways() {
  const container = document.querySelector('[data-group="pathway"]');
  container.innerHTML = "";

  Object.entries(responseData.pathways).forEach(([lens, options]) => {
    const group = document.createElement("div");
    group.className = "pathway-group";

    const title = document.createElement("span");
    title.className = "pathway-title";
    title.textContent = `If ${lens}`;
    group.append(title);

    options.forEach((option) => {
      const label = createChoice("pathway", `${lens}: ${option}`, option);
      group.append(label);
    });

    container.append(group);
  });
}

function getCurrentActionLens() {
  if (state.pathway.includes(":")) {
    return state.pathway.split(":")[0];
  }

  return state.lens || "Connection";
}

function renderActions() {
  const actionLens = getCurrentActionLens();
  const container = document.querySelector('[data-group="action"]');
  container.innerHTML = "";

  responseData.actions[actionLens].forEach((action) => {
    container.append(createChoice("action", action));
  });

  state.action = "";
}

function selectedValue(name) {
  const selected = form.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function syncStateFromForm() {
  summaryOrder.forEach(([key]) => {
    if (key !== "signal") {
      state[key] = selectedValue(key);
    }
  });

  const selectedSignal = selectedValue("signal");
  state.signal = signalOther.value.trim() || selectedSignal;
  state.notes = notes.value.trim();
}

function completedStepCount() {
  const completedSteps = [
    Boolean(state.signal),
    Boolean(state.lens),
    Boolean(state.pathway),
    Boolean(state.action),
    Boolean(state.starter),
    Boolean(state.followUp),
    Boolean(state.outcome || state.nextMove)
  ];

  return completedSteps.filter(Boolean).length;
}

function isReady() {
  return requiredSteps.every((step) => Boolean(state[step]));
}

function summaryText() {
  const lines = ["Millbrook Student Response Builder", ""];

  summaryOrder.forEach(([key, label]) => {
    lines.push(`${label}: ${state[key] || "Not selected yet"}`);
  });

  if (state.notes) {
    lines.push("", `Private notes: ${state.notes}`);
  }

  return lines.join("\n");
}

function updateSummary() {
  summaryList.innerHTML = "";

  summaryOrder.forEach(([key, label]) => {
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
  progressText.textContent = `${count} of 7 steps`;
  progressBar.style.width = `${Math.round((count / 7) * 100)}%`;

  if (isReady()) {
    statusPill.textContent = "Ready";
    statusPill.classList.add("complete");
  } else {
    statusPill.textContent = "In progress";
    statusPill.classList.remove("complete");
  }
}

function saveState() {
  localStorage.setItem("millbrook-response-builder", JSON.stringify(state));
}

function restoreState() {
  const saved = localStorage.getItem("millbrook-response-builder");
  if (!saved) return;

  Object.assign(state, JSON.parse(saved));
  const savedAction = state.action;
  notes.value = state.notes || "";

  if (!responseData.signal.includes(state.signal) && state.signal) {
    signalOther.value = state.signal;
  }

  summaryOrder.forEach(([key]) => {
    const value = key === "signal" && signalOther.value ? "" : state[key];
    if (!value) return;

    const input = form.querySelector(`input[name="${key}"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  });

  renderActions();
  state.action = savedAction;

  if (savedAction) {
    const actionInput = form.querySelector(`input[name="action"][value="${CSS.escape(savedAction)}"]`);
    if (actionInput) actionInput.checked = true;
  }
}

function handleChange(event) {
  const changedName = event.target.name;
  syncStateFromForm();

  if (changedName === "lens" && !state.pathway) {
    const firstPathway = responseData.pathways[state.lens][0];
    const pathwayValue = `${state.lens}: ${firstPathway}`;
    const input = form.querySelector(`input[name="pathway"][value="${CSS.escape(pathwayValue)}"]`);
    if (input) input.checked = true;
    syncStateFromForm();
  }

  if (changedName === "lens" || changedName === "pathway") {
    renderActions();
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
  localStorage.removeItem("millbrook-response-builder");
  renderActions();
  updateSummary();
  copyStatus.textContent = "";
}

renderSimpleGroup("signal", responseData.signal);
renderLenses();
renderPathways();
renderSimpleGroup("starter", responseData.starter);
renderSimpleGroup("followUp", responseData.followUp);
renderSimpleGroup("outcome", responseData.outcome);
renderSimpleGroup("nextMove", responseData.nextMove);
renderActions();
restoreState();
syncStateFromForm();
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

document.querySelector("#printSummary").addEventListener("click", () => {
  window.print();
});

document.querySelector("#resetForm").addEventListener("click", resetAll);
