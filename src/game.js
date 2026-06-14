const STATE_VERSION = 3;
const CAMPAIGN_LENGTH = 12;

const meters = [
  ["trust", "Community trust"],
  ["quality", "Code quality"],
  ["velocity", "Release velocity"],
  ["maintainer", "Maintainer energy"],
  ["security", "Security posture"],
  ["sustainability", "Sustainability"],
];

const initialState = {
  version: STATE_VERSION,
  trust: 52,
  quality: 54,
  velocity: 48,
  maintainer: 64,
  security: 50,
  sustainability: 44,
  week: 0,
  decisions: 0,
  scene: "ready",
  assets: [],
  flags: [],
  lastResult: "",
  log: [],
};

const assets = {
  reproKit: "Repro kit",
  testHarness: "Test harness",
  releaseChecklist: "Release checklist",
  contributorMap: "Contributor map",
  securityAdvisory: "Security advisory",
  governanceNote: "Governance note",
  fundingPlan: "Funding plan",
  docsSprint: "Docs sprint",
};

const scenes = {
  ready: {
    act: "Campaign setup",
    tag: "Ready",
    title: "Take over the release desk",
    body:
      "You maintain a small open-source tool that suddenly matters to more people. The next 12 weeks decide whether it becomes durable, chaotic, or quietly abandoned.",
    meta: ["12-week campaign", "Branching scenario deck", "Multiple endings"],
    choices: [],
  },
};

const scenarioDeck = [
  {
    id: "issue-storm",
    act: "Week 1: Signal",
    tag: "Issue triage",
    title: "The tracker fills up overnight",
    body:
      "A popular newsletter linked your project. You wake up to duplicates, vague bug reports, and one excellent reproduction buried in the noise.",
    meta: ["Triage", "Community", "Support load"],
    choices: [
      {
        label: "Write a reproduction template and label the queue",
        hint: "Slower than closing issues, but future reports become useful.",
        result: "The queue gets calmer. Users see that reports are being handled with care.",
        effects: { trust: 8, quality: 4, velocity: -3, maintainer: -5, sustainability: 4 },
        gain: ["reproKit"],
      },
      {
        label: "Close low-detail reports aggressively",
        hint: "Fast cleanup, but some real bugs may disappear with the noise.",
        result: "The issue count drops fast. A few frustrated users say the project feels hard to approach.",
        effects: { trust: -8, velocity: 8, maintainer: 4, sustainability: -3 },
        flag: ["supportDebt"],
      },
      {
        label: "Invite two users into a focused debugging thread",
        hint: "More human, more context, more coordination work.",
        result: "The best reporters become collaborators and uncover a platform-specific failure.",
        effects: { trust: 9, quality: 6, velocity: -4, maintainer: -7 },
        gain: ["contributorMap"],
      },
    ],
  },
  {
    id: "first-big-pr",
    act: "Week 2: Contribution",
    tag: "Pull request",
    title: "A large PR solves a real pain",
    body:
      "A new contributor built a feature that users keep requesting. It works, but it expands the public API and has thin tests.",
    meta: ["PR review", "API design", "Contributor experience"],
    choices: [
      {
        label: "Merge it behind an experimental flag",
        hint: "Momentum with a boundary around risk.",
        result: "The contributor feels welcomed and users can test the feature without locking the API.",
        effects: { trust: 6, velocity: 7, quality: -2, maintainer: -4, sustainability: 2 },
        flag: ["experimentalApi"],
      },
      {
        label: "Request a smaller core patch first",
        hint: "Protects the architecture, but asks the contributor for patience.",
        result: "The patch becomes smaller and cleaner. The review thread is long but useful.",
        effects: { trust: 2, quality: 10, velocity: -5, maintainer: -6, sustainability: 4 },
        gain: ["testHarness"],
      },
      {
        label: "Rewrite the PR yourself over the weekend",
        hint: "High control, high burnout.",
        result: "The code lands beautifully, but the contributor goes quiet and your weekend vanishes.",
        effects: { quality: 9, velocity: 3, maintainer: -14, trust: -2 },
        flag: ["singleMaintainerRisk"],
      },
    ],
  },
  {
    id: "dependency-alert",
    act: "Week 3: Risk",
    tag: "Security",
    title: "A dependency advisory lands",
    body:
      "A transitive dependency has a moderate vulnerability. Exploitation is unlikely for most users, but downstream packages are already asking what to do.",
    meta: ["Security", "Disclosure", "Downstream users"],
    choices: [
      {
        label: "Patch privately, publish an advisory, then release",
        hint: "Careful coordination with a clear upgrade path.",
        result: "Downstream maintainers appreciate the calm advisory and exact mitigation notes.",
        effects: { security: 12, trust: 8, quality: 3, velocity: -5, maintainer: -7 },
        gain: ["securityAdvisory"],
      },
      {
        label: "Ship a quick patch with a short changelog",
        hint: "Fast relief, less confidence.",
        result: "Most users are covered quickly, but one edge case breaks because the patch was thinly tested.",
        effects: { security: 7, velocity: 8, quality: -5, maintainer: -4 },
        flag: ["regressionRisk"],
      },
      {
        label: "Document why the project is not affected",
        hint: "Useful if true, risky if your analysis is incomplete.",
        result: "The explanation buys time, but people keep asking for a patched dependency anyway.",
        effects: { trust: 2, security: 2, velocity: 4, maintainer: -2 },
      },
    ],
  },
  {
    id: "docs-gap",
    act: "Week 4: Adoption",
    tag: "Documentation",
    title: "The docs no longer match reality",
    body:
      "Users copy examples from the README and hit deprecated behavior. The code works, but the learning path is now misleading.",
    meta: ["Docs", "Onboarding", "Support"],
    choices: [
      {
        label: "Run a documentation sprint before new features",
        hint: "Boring in the best possible way.",
        result: "Support questions drop. New users start opening better issues and smaller PRs.",
        effects: { trust: 9, sustainability: 8, velocity: -5, maintainer: -4 },
        gain: ["docsSprint"],
      },
      {
        label: "Add warnings only where behavior changed",
        hint: "A narrow fix for the sharpest edges.",
        result: "The worst confusion is gone, but the docs still feel stitched together.",
        effects: { trust: 4, sustainability: 3, velocity: 2, maintainer: -2 },
      },
      {
        label: "Postpone docs until the API stabilizes",
        hint: "Common, tempting, and expensive later.",
        result: "Development keeps moving, but repeated questions start draining review time.",
        effects: { velocity: 6, trust: -5, sustainability: -7, maintainer: -3 },
        flag: ["docsDebt"],
      },
    ],
  },
  {
    id: "governance-pressure",
    act: "Week 5: Governance",
    tag: "Project direction",
    title: "Two groups want different futures",
    body:
      "Power users want advanced configuration. New users want fewer concepts. Both groups are right from where they stand.",
    meta: ["Governance", "Scope", "Roadmap"],
    choices: [
      {
        label: "Publish a scope statement and decision record",
        hint: "A firm project boundary reduces future arguments.",
        result: "The project gets a clearer identity. Some requests are easier to decline kindly.",
        effects: { trust: 5, quality: 5, sustainability: 9, maintainer: -4 },
        gain: ["governanceNote"],
      },
      {
        label: "Create plugin hooks for advanced users",
        hint: "Keeps the core small, but adds design responsibility.",
        result: "Advanced users get a path without forcing every feature into core.",
        effects: { trust: 6, quality: 3, velocity: -4, maintainer: -6, sustainability: 5 },
      },
      {
        label: "Accept both directions into core",
        hint: "Maximum short-term happiness, maximum long-term surface area.",
        result: "Everyone gets something now. The next review cycle becomes noticeably heavier.",
        effects: { trust: 7, velocity: 5, quality: -8, maintainer: -7, sustainability: -7 },
        flag: ["scopeCreep"],
      },
    ],
  },
  {
    id: "ci-collapse",
    act: "Week 6: Infrastructure",
    tag: "CI",
    title: "The test suite becomes flaky",
    body:
      "Pull requests fail on random platforms. Contributors retry jobs until they pass. Nobody trusts the red build anymore.",
    meta: ["CI", "Testing", "Reliability"],
    choices: [
      {
        label: "Quarantine flaky tests and open tracked fixes",
        hint: "Restores signal without pretending the failures are gone.",
        result: "The build becomes useful again. The known flaky area is visible instead of folklore.",
        effects: { quality: 8, velocity: 4, trust: 5, maintainer: -5, sustainability: 4 },
        gain: ["testHarness"],
      },
      {
        label: "Disable the slowest platform temporarily",
        hint: "A practical release move, if you document the tradeoff.",
        result: "PRs move again, but platform-specific confidence drops.",
        effects: { velocity: 8, quality: -4, maintainer: 2, trust: -2 },
        flag: ["platformGap"],
      },
      {
        label: "Require maintainers to manually verify every PR",
        hint: "High confidence at the cost of human time.",
        result: "Fewer regressions escape, but reviews pile up around you.",
        effects: { quality: 7, security: 3, velocity: -8, maintainer: -10 },
        flag: ["reviewBottleneck"],
      },
    ],
  },
  {
    id: "release-candidate",
    act: "Week 7: Release",
    tag: "Release candidate",
    title: "A release candidate is almost ready",
    body:
      "The changelog is rough, migration notes are missing, and one experimental API has enthusiastic users despite the warning label.",
    meta: ["Release", "Migration", "Communication"],
    choices: [
      {
        label: "Cut an RC with a migration checklist",
        hint: "Invite testing without calling it done.",
        result: "Users test the upgrade path and catch two confusing migration steps.",
        effects: { velocity: 5, trust: 7, quality: 5, maintainer: -5 },
        gain: ["releaseChecklist"],
      },
      {
        label: "Ship stable now and fix docs later",
        hint: "Fast, but support will collect the missing context.",
        result: "The release lands, then the same migration question appears in five places.",
        effects: { velocity: 10, trust: -4, quality: -4, maintainer: -6, sustainability: -4 },
        flag: ["supportDebt"],
      },
      {
        label: "Freeze features for two more weeks",
        hint: "Quality improves while impatient users wait.",
        result: "The release gets calmer. A few users fork temporary patches while they wait.",
        effects: { quality: 9, security: 3, velocity: -7, trust: 2, maintainer: -4 },
      },
    ],
  },
  {
    id: "funding-email",
    act: "Week 8: Sustainability",
    tag: "Funding",
    title: "A company asks for priority support",
    body:
      "A company depends on the project and wants a private support channel. You need resources, but you do not want public users to become second-class citizens.",
    meta: ["Funding", "Ethics", "Sustainability"],
    choices: [
      {
        label: "Offer transparent sponsorship with public issue priority rules",
        hint: "Money helps, and the rules stay visible.",
        result: "The company sponsors the project without buying the roadmap.",
        effects: { sustainability: 12, trust: 5, maintainer: 4, velocity: 2 },
        gain: ["fundingPlan"],
      },
      {
        label: "Create a private support channel immediately",
        hint: "Helpful revenue, murkier expectations.",
        result: "Support gets funded, but public contributors wonder where decisions happen.",
        effects: { sustainability: 8, maintainer: 3, trust: -6 },
        flag: ["privateRoadmap"],
      },
      {
        label: "Decline paid support for now",
        hint: "Keeps governance simple, leaves the resource problem unsolved.",
        result: "The public process stays clean, but you still carry the whole support load.",
        effects: { trust: 4, sustainability: -4, maintainer: -5 },
      },
    ],
  },
  {
    id: "maintainer-health",
    act: "Week 9: Energy",
    tag: "Maintainer load",
    title: "You are replying slower than usual",
    body:
      "Notifications feel heavier. A contributor asks if the project is still alive. The honest answer is yes, but not at this pace.",
    meta: ["Burnout", "Delegation", "Boundaries"],
    choices: [
      {
        label: "Publish office hours and slower response expectations",
        hint: "A boundary that keeps the project honest.",
        result: "People know what to expect. A few contributors step up during office hours.",
        effects: { maintainer: 10, trust: 4, velocity: -3, sustainability: 6 },
      },
      {
        label: "Invite trusted contributors into triage",
        hint: "Delegation requires clarity, but it multiplies attention.",
        result: "Two contributors start labeling issues and catching duplicates.",
        effects: { maintainer: 7, trust: 7, velocity: 4, sustainability: 8 },
        gain: ["contributorMap"],
      },
      {
        label: "Push through until the release is done",
        hint: "Sometimes works. Often sends the bill to next month.",
        result: "The release moves, but small irritations start shaping your tone.",
        effects: { velocity: 7, maintainer: -14, trust: -3, quality: -2 },
        flag: ["burnoutRisk"],
      },
    ],
  },
  {
    id: "breaking-change",
    act: "Week 10: Compatibility",
    tag: "Breaking change",
    title: "The clean fix breaks old configs",
    body:
      "The right architecture removes a long-standing footgun. It also breaks older configuration files that many users probably still have.",
    meta: ["Compatibility", "Migration", "Trust"],
    choices: [
      {
        label: "Ship a compatibility layer with warnings",
        hint: "More work now, fewer surprised users.",
        result: "Users get time to migrate and the project can still move toward the cleaner design.",
        effects: { trust: 8, quality: 4, velocity: -5, maintainer: -7, sustainability: 4 },
      },
      {
        label: "Make the breaking change and explain it clearly",
        hint: "Honest and clean, but still disruptive.",
        result: "Advanced users respect the clarity. Casual users need extra help upgrading.",
        effects: { quality: 9, velocity: 2, trust: -2, maintainer: -4 },
      },
      {
        label: "Avoid the breaking change entirely",
        hint: "Preserves compatibility while keeping the footgun.",
        result: "Nothing breaks today. The confusing behavior keeps generating support issues.",
        effects: { trust: 3, velocity: 5, quality: -7, sustainability: -5 },
        flag: ["legacyBurden"],
      },
    ],
  },
  {
    id: "incident",
    act: "Week 11: Incident",
    tag: "Production impact",
    title: "A regression reaches real users",
    body:
      "A release candidate missed a path used by downstream automation. The bug is fixable, but public confidence depends on how you handle the incident.",
    meta: ["Incident", "Accountability", "Recovery"],
    choices: [
      {
        label: "Publish a short incident note and rollback guide",
        hint: "Accountability turns a failure into evidence of maturity.",
        result: "Users lose a little time, but gain confidence in how the project responds.",
        effects: { trust: 7, quality: 5, security: 2, maintainer: -5, sustainability: 5 },
      },
      {
        label: "Patch silently to avoid drama",
        hint: "Quiet, but leaves users guessing.",
        result: "The bug disappears for some users while others keep debugging old failures.",
        effects: { velocity: 5, trust: -7, maintainer: -2 },
        flag: ["communicationDebt"],
      },
      {
        label: "Blame the downstream integration",
        hint: "Defensive speed, long-term trust damage.",
        result: "The thread gets tense and future reports become less generous.",
        effects: { trust: -13, maintainer: 2, sustainability: -8 },
        flag: ["communityFracture"],
      },
    ],
  },
  {
    id: "final-release",
    act: "Week 12: Release day",
    tag: "Final release",
    title: "The release is ready to leave your laptop",
    body:
      "The changelog is written, tests are mostly green, and users are waiting. This last move defines what kind of project people think they are joining.",
    meta: ["Release", "Trust", "Future maintenance"],
    choices: [
      {
        label: "Release with checklist, advisory notes, and contributor credits",
        hint: "Slower, clearer, more durable.",
        result: "The release feels professional. Contributors see their work named and users understand the upgrade path.",
        effects: { trust: 10, quality: 6, security: 5, sustainability: 8, maintainer: -5 },
        gain: ["releaseChecklist"],
      },
      {
        label: "Release now and open a follow-up milestone",
        hint: "Balanced if the known gaps are visible.",
        result: "The release lands with honest follow-up work and enough momentum to keep going.",
        effects: { velocity: 8, trust: 4, quality: 1, sustainability: 3, maintainer: -3 },
      },
      {
        label: "Delay until everything feels perfect",
        hint: "Perfection protects quality and can quietly freeze the project.",
        result: "The release gets better, but the community loses the sense that progress is alive.",
        effects: { quality: 8, security: 4, velocity: -10, trust: -4, maintainer: -7 },
      },
    ],
  },
];

let state = loadState();

const elements = {
  start: document.querySelector("#start-button"),
  reset: document.querySelector("#reset-button"),
  copy: document.querySelector("#copy-summary"),
  meters: document.querySelector("#meters"),
  meterTemplate: document.querySelector("#meter-template"),
  progressLabel: document.querySelector("#progress-label"),
  progressFill: document.querySelector("#progress-fill"),
  assets: document.querySelector("#asset-list"),
  chapter: document.querySelector("#chapter-label"),
  week: document.querySelector("#week-count"),
  decisions: document.querySelector("#decision-count"),
  tag: document.querySelector("#scene-tag"),
  title: document.querySelector("#scene-title"),
  body: document.querySelector("#scene-body"),
  meta: document.querySelector("#scene-meta"),
  lastResult: document.querySelector("#last-result"),
  choices: document.querySelector("#choices"),
  log: document.querySelector("#log-list"),
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function loadState() {
  try {
    const saved = localStorage.getItem("maintainer-quest-state");
    if (!saved) return { ...initialState };
    const parsed = JSON.parse(saved);
    return parsed.version === STATE_VERSION ? parsed : { ...initialState };
  } catch {
    return { ...initialState };
  }
}

function saveState() {
  localStorage.setItem("maintainer-quest-state", JSON.stringify(state));
}

function resetState() {
  state = { ...initialState, assets: [], flags: [], log: [] };
  saveState();
  render();
}

function startRun() {
  state = { ...initialState, scene: "campaign", assets: [], flags: [], log: [] };
  saveState();
  render();
  elements.title.scrollIntoView({ behavior: "smooth", block: "center" });
}

function currentScenario() {
  return scenarioDeck[Math.min(state.week, scenarioDeck.length - 1)];
}

function addUnique(collection, values = []) {
  return [...new Set([...collection, ...values])];
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([key, value]) => `${meterLabel(key)} ${value > 0 ? "+" : ""}${value}`)
    .join(", ");
}

function meterLabel(key) {
  return meters.find(([id]) => id === key)?.[1] ?? key;
}

function applyChoice(choice) {
  for (const [key, value] of Object.entries(choice.effects)) {
    state[key] = clamp(state[key] + value);
  }

  state.assets = addUnique(state.assets, choice.gain);
  state.flags = addUnique(state.flags, choice.flag);
  state.week += 1;
  state.decisions += 1;
  state.lastResult = `${choice.result} (${formatEffects(choice.effects)})`;
  state.log = [
    ...state.log,
    `Week ${state.week}: ${choice.label}`,
  ].slice(-10);

  if (state.week >= CAMPAIGN_LENGTH) {
    state.scene = "ending";
  }

  saveState();
  render();
}

function getEnding() {
  const average = Math.round(
    (state.trust +
      state.quality +
      state.velocity +
      state.maintainer +
      state.security +
      state.sustainability) /
      6,
  );
  const debt = state.flags.length;
  const assetCount = state.assets.length;

  if (state.maintainer <= 28) {
    return {
      act: "Final report",
      tag: "Ending",
      title: "The project ships, but the maintainer pays too much",
      body:
        "You delivered value, but too many decisions stayed on your shoulders. The next chapter needs delegation, response boundaries, and automation before ambition grows again.",
      meta: [`Overall score ${average}`, `${assetCount} assets`, `${debt} risks`],
    };
  }

  if (average >= 68 && state.trust >= 65 && state.sustainability >= 60) {
    return {
      act: "Final report",
      tag: "Ending",
      title: "A durable open-source release",
      body:
        "The release is useful, understandable, and maintainable. Users know how to upgrade, contributors know how to help, and the project has enough process to survive attention.",
      meta: [`Overall score ${average}`, `${assetCount} assets`, `${debt} risks`],
    };
  }

  if (state.velocity >= 70 && state.quality < 55) {
    return {
      act: "Final report",
      tag: "Ending",
      title: "Fast momentum with a debt hangover",
      body:
        "The project moved quickly and users noticed. Now the bill is tests, documentation, and a clearer support policy before the next release amplifies the rough edges.",
      meta: [`Overall score ${average}`, `${assetCount} assets`, `${debt} risks`],
    };
  }

  if (state.security >= 70 && state.trust >= 58) {
    return {
      act: "Final report",
      tag: "Ending",
      title: "A careful release people can trust",
      body:
        "You treated risk with respect. The project may not be flashy, but downstream users can see a maintainer who communicates clearly when things get serious.",
      meta: [`Overall score ${average}`, `${assetCount} assets`, `${debt} risks`],
    };
  }

  return {
    act: "Final report",
    tag: "Ending",
    title: "A living project with visible next steps",
    body:
      "The campaign ends with a usable release and a few scars. The strongest next move is to turn the run log into public issues and invite contributors into the work.",
    meta: [`Overall score ${average}`, `${assetCount} assets`, `${debt} risks`],
  };
}

function copySummary() {
  const summary = [
    "Maintainer Quest run summary",
    `Trust: ${state.trust}`,
    `Quality: ${state.quality}`,
    `Velocity: ${state.velocity}`,
    `Maintainer energy: ${state.maintainer}`,
    `Security: ${state.security}`,
    `Sustainability: ${state.sustainability}`,
    `Assets: ${state.assets.map((id) => assets[id]).join(", ") || "None"}`,
    `Risks: ${state.flags.join(", ") || "None"}`,
    "",
    ...state.log,
  ].join("\n");

  navigator.clipboard?.writeText(summary);
  elements.copy.textContent = "Copied";
  window.setTimeout(() => {
    elements.copy.textContent = "Copy summary";
  }, 1200);
}

function renderMeters() {
  elements.meters.replaceChildren();

  for (const [key, label] of meters) {
    const node = elements.meterTemplate.content.cloneNode(true);
    node.querySelector(".meter-name").textContent = label;
    node.querySelector(".meter-value").textContent = `${state[key]}/100`;
    const fill = node.querySelector(".meter-fill");
    fill.style.width = `${state[key]}%`;
    fill.style.background =
      state[key] < 35 ? "var(--danger)" : state[key] < 55 ? "var(--amber)" : "var(--accent)";
    elements.meters.append(node);
  }
}

function renderProgress() {
  const progress = Math.min(state.week, CAMPAIGN_LENGTH);
  elements.progressLabel.textContent = `${progress}/${CAMPAIGN_LENGTH}`;
  elements.progressFill.style.width = `${(progress / CAMPAIGN_LENGTH) * 100}%`;
}

function renderAssets() {
  elements.assets.replaceChildren();
  const visibleAssets = state.assets.map((id) => assets[id]);

  if (!visibleAssets.length) {
    const empty = document.createElement("span");
    empty.className = "asset-pill empty";
    empty.textContent = "No assets yet";
    elements.assets.append(empty);
    return;
  }

  for (const item of visibleAssets) {
    const pill = document.createElement("span");
    pill.className = "asset-pill";
    pill.textContent = item;
    elements.assets.append(pill);
  }
}

function renderLog() {
  elements.log.replaceChildren();
  for (const item of state.log) {
    const li = document.createElement("li");
    li.textContent = item;
    elements.log.append(li);
  }
}

function renderMeta(items = []) {
  elements.meta.replaceChildren();
  for (const item of items) {
    const chip = document.createElement("span");
    chip.textContent = item;
    elements.meta.append(chip);
  }
}

function renderLastResult() {
  if (!state.lastResult) {
    elements.lastResult.hidden = true;
    elements.lastResult.textContent = "";
    return;
  }

  elements.lastResult.hidden = false;
  elements.lastResult.textContent = state.lastResult;
}

function renderScene() {
  const scene =
    state.scene === "ending"
      ? getEnding()
      : state.scene === "campaign"
        ? currentScenario()
        : scenes.ready;

  elements.tag.textContent = scene.tag;
  elements.title.textContent = scene.title;
  elements.body.textContent = scene.body;
  elements.chapter.textContent = scene.act;
  elements.choices.replaceChildren();
  renderMeta(scene.meta);
  renderLastResult();

  if (state.scene === "ready") {
    const begin = document.createElement("button");
    begin.className = "primary";
    begin.type = "button";
    begin.textContent = "Start from week 1";
    begin.addEventListener("click", startRun);
    elements.choices.append(begin);
    return;
  }

  if (state.scene === "ending") {
    const again = document.createElement("button");
    again.className = "primary";
    again.type = "button";
    again.textContent = "Play another campaign";
    again.addEventListener("click", resetState);
    elements.choices.append(again);
    return;
  }

  for (const choice of scene.choices) {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.innerHTML = `<strong></strong><span></span><small></small>`;
    button.querySelector("strong").textContent = choice.label;
    button.querySelector("span").textContent = choice.hint;
    button.querySelector("small").textContent = formatEffects(choice.effects);
    button.addEventListener("click", () => applyChoice(choice));
    elements.choices.append(button);
  }
}

function render() {
  renderProgress();
  renderMeters();
  renderAssets();
  renderLog();
  renderScene();
  elements.week.textContent = state.week;
  elements.decisions.textContent = state.decisions;
}

elements.start.addEventListener("click", startRun);
elements.reset.addEventListener("click", resetState);
elements.copy.addEventListener("click", copySummary);

render();
