const SETS = [
  { name: "Первый день в зоне", bonuses: { knife: 5, pistol: 5, auto: 5 } },
  { name: "Любитель прогулок", bonuses: { grenade: 6, gl: 11, gauss: 36 } },
  { name: "Болотник", bonuses: { knife: 14, pistol: 14, auto: 16 } },
  { name: "Омон", bonuses: { grenade: 30, gl: 62, gauss: 198 } },
  { name: "Полевой", bonuses: { grenade: 16, gl: 34, gauss: 108 } },
  { name: "Марафонец", bonuses: { knife: 9, pistol: 10, auto: 11 } },
  { name: "КХК-01", bonuses: { grenade: 41, gl: 85, gauss: 270 }, critGaussChance: 0.01, critGaussDamage: 100 },
  { name: "Рубеж-М", bonuses: { grenade: 50, gl: 102, gauss: 324 }, critChance: 0.02, critDamage: 50 },
  { name: "Научный сотрудник", bonuses: { knife: 18, pistol: 19, auto: 22 } },
  { name: "Копатель", bonuses: { grenade: 22, gl: 45, gauss: 144 }, critGrenadeChance: 0.01, critGrenadeDamage: 75 },
  { name: "Жестянка", bonuses: { grenade: 60, gl: 124, gauss: 396 }, critChance: 0.03, critDamage: 75 },

];

const ITEMS = [
  { name: "Комбинезон «Рассвет»", bonuses: { knife: 12, pistol: 12, auto: 14 }, cooldown: 0.03, freeNoCooldown: 0.01 },
  { name: 'Футболка «Сердце Зоны»', bonuses: { grenade: 1, gl: 2, gauss: 7 } },
  { name: "Кожаная куртка", bonuses: { grenade: 3, gl: 7, gauss: 22 } },
  { name: "Бандитский плащ", bonuses: { grenade: 2, gl: 5, gauss: 14 } }
];

const state = {
  sets: new Set(),
  items: new Set()
};

const BONUS_KEYS = ["knife", "pistol", "auto", "grenade", "gl", "gauss"];

function formatNumber(value) {
  return Math.round(value).toLocaleString("ru-RU");
}

function selectedBonuses() {
  const total = Object.fromEntries(BONUS_KEYS.map(key => [key, 0]));
  let critGaussChance = 0, critChance = 0, noCooldown = 0, cooldown = 0;

  [...state.sets].forEach(index => {
    const set = SETS[index];
    BONUS_KEYS.forEach(key => total[key] += set.bonuses[key] || 0);
    critGaussChance += set.critGaussChance || 0;
    critChance += set.critChance || 0;
    noCooldown += set.freeNoCooldown || 0;
    cooldown += set.cooldown || 0;
  });

  [...state.items].forEach(index => {
    const item = ITEMS[index];
    BONUS_KEYS.forEach(key => total[key] += item.bonuses[key] || 0);
  });

  return { total, critGaussChance, critChance, noCooldown, cooldown };
}

function renderChoices(containerId, data, selected, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  data.forEach((entry, index) => {
    const label = document.createElement("label");
    label.className = "choice" + (selected.has(index) ? " selected" : "");
    label.innerHTML = `
      <input type="checkbox" data-type="${type}" data-index="${index}" ${selected.has(index) ? "checked" : ""}>
      <span class="choice-name">${entry.name}</span>
      <span class="choice-bonus">${describeBonuses(entry)}</span>
    `;
    container.appendChild(label);
  });
}

function describeBonuses(entry) {
  const names = { knife: "нож", pistol: "пист.", auto: "авт.", grenade: "гран.", gl: "ГП", gauss: "Гаусс" };
  const parts = Object.entries(entry.bonuses || {})
    .filter(([, value]) => value)
    .map(([key, value]) => `+${value} ${names[key]}`);
  if (entry.critGaussChance) parts.push(`крит Гаусс ${entry.critGaussChance * 100}%`);
  if (entry.critChance) parts.push(`крит ${entry.critChance * 100}%`);
  if (entry.cooldown) parts.push(`откат -${entry.cooldown * 100}%`);
  if (entry.freeNoCooldown) parts.push(`без отката ${entry.freeNoCooldown * 100}%`);
  return parts.join(" · ") || "без бонусов";
}

function calculate() {
  const level = Math.max(0, Number(document.getElementById("level").value) || 0);
  const talentGrenade = Number(document.getElementById("talentGrenade").value) || 0;
  const talentGl = Number(document.getElementById("talentGl").value) || 0;
  const talentGauss = Number(document.getElementById("talentGauss").value) || 0;
  const { total, critGaussChance, critChance, noCooldown, cooldown } = selectedBonuses();

  const grenade = Math.round(55 * Math.pow(1.02, level)) + total.grenade + talentGrenade;
  const gl = Math.round(113 * Math.pow(1.02, level)) + total.gl + talentGl;
  const gauss = Math.round(360 * Math.pow(1.02, level)) + total.gauss + talentGauss;

  const knife = Math.floor(45.85 + 1.15 * level) + total.knife;
  const pistol = Math.floor(47.8 + 1.2 * level) + total.pistol;
  const auto = Math.floor(53.65 + 1.35 * level) + total.auto;

  setText("resultGrenade", formatNumber(grenade));
  setText("resultGl", formatNumber(gl));
  setText("resultGauss", formatNumber(gauss));
  setText("resultKnife", formatNumber(knife));
  setText("resultPistol", formatNumber(pistol));
  setText("resultAuto", formatNumber(auto));

  setText("bonusGrenade", "+" + formatNumber(total.grenade));
  setText("bonusGl", "+" + formatNumber(total.gl));
  setText("bonusGauss", "+" + formatNumber(total.gauss));
  setText("bonusKnife", "+" + formatNumber(total.knife));
  setText("bonusPistol", "+" + formatNumber(total.pistol));
  setText("bonusAuto", "+" + formatNumber(total.auto));

  setText("critGaussChance", (critGaussChance * 100).toFixed(0) + "%");
  setText("critChance", (critChance * 100).toFixed(0) + "%");
  setText("noCooldown", (noCooldown * 100).toFixed(0) + "%");
  setText("cooldown", (cooldown * 100).toFixed(0) + "%");
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function refresh() {
  renderChoices("sets", SETS, state.sets, "set");
  renderChoices("items", ITEMS, state.items, "item");
  calculate();
}

document.addEventListener("change", event => {
  const input = event.target.closest("input[data-type]");
  if (!input) return;

  const collection = input.dataset.type === "set" ? state.sets : state.items;
  const index = Number(input.dataset.index);
  input.checked ? collection.add(index) : collection.delete(index);
  refresh();
});

document.querySelectorAll("#level, #talentGrenade, #talentGl, #talentGauss").forEach(input => {
  input.addEventListener("input", calculate);
});

document.getElementById("clearSets").addEventListener("click", () => {
  state.sets.clear();
  refresh();
});

document.getElementById("clearItems").addEventListener("click", () => {
  state.items.clear();
  refresh();
});

refresh();
