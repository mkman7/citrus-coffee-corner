const app = document.getElementById("app");

const data = {
  coffees: [
    { id: "espresso", name: "Espresso", description: "Small, strong, straight to the point.", icedAvailable: false, milkAvailable: false, image: "assets/espresso.jpg" },
    { id: "americano", name: "Americano", icedName: "Iced Americano", description: "Clean, simple, and timeless.", icedAvailable: true, milkAvailable: false, image: "assets/espresso.jpg" },
    { id: "flat-white", name: "Flat White", description: "Smooth, balanced, and soft.", icedAvailable: false, milkAvailable: true, image: "assets/latte.jpg" },
    { id: "latte", name: "Latte", icedName: "Iced Latte", description: "Creamy, warm, and comforting.", icedAvailable: true, milkAvailable: true, image: "assets/latte.jpg" },
    { id: "filter-coffee", name: "Filter Coffee", icedName: "Iced Filter Coffee", description: "Slow, honest, and made for long conversations.", icedAvailable: true, milkAvailable: false, image: "assets/espresso.jpg" }
  ],
  milks: [
    { id: "whole-milk", name: "Whole Milk", description: "Classic and creamy." },
    { id: "oat-milk", name: "Oat Milk", description: "Soft, modern, café favourite." },
    { id: "almond-milk", name: "Almond Milk", description: "Light and nutty." },
    { id: "lactose-free-milk", name: "Lactose-free Milk", description: "Classic taste, easier on the stomach." }
  ],
  syrups: [
    { id: "no-syrup", name: "No Syrup", description: "Keep it simple." },
    { id: "mocha-syrup", name: "Mocha Syrup", description: "Chocolate mood." },
    { id: "hazelnut-syrup", name: "Hazelnut Syrup", description: "Warm and nutty." },
    { id: "vanilla-syrup", name: "Vanilla Syrup", description: "Soft and sweet." },
    { id: "caramel-syrup", name: "Caramel Syrup", description: "Golden and cozy." }
  ],
  sides: [
    { id: "chocolate-walnut-cookie", group: "Cookies", name: "Chocolate Walnut Cookie", badge: "Citrus Favourite", description: "Chunky, rich, and the Citrus favourite.", image: "assets/cookie-chocolate-walnut.jpg" },
    { id: "tiramisu-cookie", group: "Cookies", name: "Tiramisu Cookie", description: "Soft, creamy, and a little nostalgic.", image: "assets/cookie-tiramisu.jpg" },
    { id: "sour-cherry-chocolate-cookie", group: "Cookies", name: "Sour Cherry Chocolate Cookie", description: "Deep chocolate with a sour cherry twist.", image: "assets/cookie-sour-cherry.jpg" },
    { id: "brownie", group: "Other", name: "Brownie", description: "Rich, dense, and chocolatey.", image: "assets/brownie.jpg" },
    { id: "smoked-turkey-sandwich", group: "Other", name: "Smoked Turkey Sandwich", description: "Fresh, simple, and savoury.", image: "assets/sandwich.jpg" },
    { id: "no-side", group: "Other", name: "No Side", description: "Just the coffee, please.", image: "" }
  ],
  catComments: [
    "Approved. I would sit next to this.",
    "Soft choice. Very sofa-by-the-window.",
    "Classic. I respect that.",
    "This feels like a slow afternoon at Citrus.",
    "Good balance. Not too serious, not too sweet.",
    "A proper little coffee break.",
    "This one belongs near the big window.",
    "Cozy. Very Citrus."
  ]
};

let state = {};
let screen = "welcome";
let historyStack = [];

function escapeHtml(text = "") {
  return text.replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

function push(nextScreen) {
  historyStack.push(screen);
  screen = nextScreen;
  render();
}

function goBack() {
  if (historyStack.length) {
    screen = historyStack.pop();
    render();
  }
}

function restart() {
  state = {};
  screen = "welcome";
  historyStack = [];
  render();
}

function choose(type, item) {
  state[type] = item;

  if (type === "coffee") {
    if (!item.icedAvailable) state.temperature = { id: "hot", name: "Hot", description: "Classic Citrus mood." };
    if (!item.milkAvailable) delete state.milk;

    if (item.icedAvailable) push("temperature");
    else if (item.milkAvailable) push("milk");
    else push("syrup");
    return;
  }

  if (type === "temperature") {
    if (state.coffee.milkAvailable) push("milk");
    else push("syrup");
    return;
  }

  if (type === "milk") {
    push("syrup");
    return;
  }

  if (type === "syrup") {
    push("side");
    return;
  }

  if (type === "side") {
    state.catComment = makeCatComment();
    push("result");
  }
}

function drinkName() {
  if (!state.coffee) return "";
  if (state.temperature?.id === "iced" && state.coffee.icedName) return state.coffee.icedName;
  return state.coffee.name;
}

function makeCatComment() {
  const side = state.side?.id;
  const syrup = state.syrup?.id;
  const temp = state.temperature?.id;

  if (side === "chocolate-walnut-cookie") return "You picked the favourite. Smart human.";
  if (side === "tiramisu-cookie") return "Soft, creamy, dangerous.";
  if (side === "sour-cherry-chocolate-cookie") return "Chocolate with drama. I like it.";
  if (side === "smoked-turkey-sandwich") return "Finally, something serious.";
  if (temp === "iced") return "Fresh choice. Outside-table energy.";
  if (syrup === "no-syrup") return "Classic. I respect that.";
  return data.catComments[Math.floor(Math.random() * data.catComments.length)];
}

function selectedImage() {
  if (state.side?.image) return state.side.image;
  if (state.temperature?.id === "iced") return "assets/iced-drink.jpg";
  if (state.coffee?.image) return state.coffee.image;
  return "assets/latte.jpg";
}

function card(item, type, withImage = false) {
  const safeName = escapeHtml(item.name);
  const safeDescription = escapeHtml(item.description);
  const thumb = withImage && item.image ? `<div class="thumb" style="background-image:url('${escapeHtml(item.image)}')"></div>` : "";
  const badge = item.badge ? `<span class="badge">${escapeHtml(item.badge)}</span>` : "";
  return `
    <button class="choice-card fade-in" type="button" data-type="${type}" data-id="${escapeHtml(item.id)}">
      ${thumb}
      <h3>${safeName}</h3>
      <p>${safeDescription}</p>
      ${badge}
    </button>`;
}

function cards(items, type, withImage = false) {
  return `<div class="grid">${items.map(item => card(item, type, withImage)).join("")}</div>`;
}

function screenShell(step, title, subtitle, body) {
  return `
    <section class="screen fade-in">
      <div class="panel-head">
        <div>
          <div class="step">${escapeHtml(step)}</div>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        <div class="nav">
          <button class="btn secondary small" type="button" data-action="restart">Restart</button>
          ${historyStack.length ? `<button class="btn secondary small" type="button" data-action="back">Back</button>` : ""}
        </div>
      </div>
      ${body}
    </section>`;
}

function welcome() {
  return `
    <section class="hero fade-in">
      <div class="topbar">
        <div class="logo-mark">citrus<span class="dot">.</span></div>
        <div>coffee corner</div>
      </div>

      <div class="hero-content">
        <p class="kicker">A small Citrus memory</p>
        <h1>Welcome back to Citrus</h1>
        <p class="lead">A quiet little corner, a sleepy cat, and one more coffee to make. Build a small Citrus order and let the cat judge your choice.</p>
        <div class="actions">
          <button class="btn" type="button" data-action="start">Make Your Citrus Coffee</button>
          <button class="btn secondary" type="button" data-action="radio">Citrus Radio</button>
        </div>

        <div id="radioBox" class="radio-box" hidden>
          <div class="radio-title"><span>Citrus Radio</span><span>Spotify</span></div>
          <p class="radio-sub">The songs we used to play at the café. Press play when you want the atmosphere.</p>
          <iframe src="https://open.spotify.com/embed/playlist/4U2LKKEhfGT8YS0B8TkesU?utm_source=generator" width="100%" height="96" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
      </div>

      <div class="footer-note">
        <span>coffee · cookies · cat approval</span>
        <span>made for slow afternoons</span>
      </div>
    </section>`;
}

function result() {
  const syrup = state.syrup?.id === "no-syrup" ? "No Syrup" : state.syrup?.name;
  const milkRow = state.milk ? `<div class="receipt-row"><strong>Milk</strong><span>${escapeHtml(state.milk.name)}</span></div>` : "";
  const side = state.side?.name || "No Side";
  const chips = [drinkName(), state.milk?.name, syrup, side].filter(Boolean).map(x => `<span class="chip">${escapeHtml(x)}</span>`).join("");

  return `
    <section class="screen fade-in">
      <div class="result-layout">
        <div class="result-card">
          <div class="step">Your Citrus order is ready</div>
          <h2>${escapeHtml(drinkName())}</h2>
          <p class="lead">Here is your small digital order from Citrus.</p>
          <div class="receipt">
            <div class="receipt-row"><strong>Coffee</strong><span>${escapeHtml(drinkName())}</span></div>
            <div class="receipt-row"><strong>Temperature</strong><span>${escapeHtml(state.temperature?.name || "Hot")}</span></div>
            ${milkRow}
            <div class="receipt-row"><strong>Syrup</strong><span>${escapeHtml(syrup || "No Syrup")}</span></div>
            <div class="receipt-row"><strong>Side</strong><span>${escapeHtml(side)}</span></div>
          </div>
          <div class="cat-comment"><strong>Citrus Cat says:</strong><br>“${escapeHtml(state.catComment)}”</div>
          <div class="summary-chips">${chips}</div>
          <div class="actions" style="margin-top:22px">
            <button class="btn" type="button" data-action="restart">Make another</button>
            <button class="btn secondary" type="button" data-action="back">Change side</button>
          </div>
        </div>
        <div class="visual-card" style="background-image:linear-gradient(0deg, rgba(45,22,14,.12), rgba(45,22,14,.02)), url('${escapeHtml(selectedImage())}')">
          <div class="visual-overlay">
            <strong>${escapeHtml(side)}</strong><br>
            <span>${escapeHtml(state.side?.description || "A quiet Citrus moment.")}</span>
          </div>
        </div>
      </div>
    </section>`;
}

function render() {
  if (screen === "welcome") app.innerHTML = welcome();
  if (screen === "coffee") app.innerHTML = screenShell("Step 1 / 5", "Choose your coffee", "Start with the base of your Citrus order.", cards(data.coffees, "coffee"));
  if (screen === "temperature") {
    const tempOptions = [
      { id: "hot", name: "Hot", description: "Classic Citrus mood." },
      { id: "iced", name: "Iced", description: `Turns into ${state.coffee?.icedName || "an iced coffee"}.` }
    ];
    app.innerHTML = screenShell("Step 2 / 5", "Hot or iced?", "Some coffees can become an iced Citrus version.", cards(tempOptions, "temperature"));
  }
  if (screen === "milk") app.innerHTML = screenShell("Step 3 / 5", "Choose your milk", "Milk choice appears only for milk-based coffees.", cards(data.milks, "milk"));
  if (screen === "syrup") app.innerHTML = screenShell("Step 4 / 5", "Add a syrup", "Keep it simple or make it sweeter.", cards(data.syrups, "syrup"));
  if (screen === "side") {
    const cookies = data.sides.filter(s => s.group === "Cookies");
    const other = data.sides.filter(s => s.group === "Other");
    app.innerHTML = screenShell("Final choice", "Choose something on the side", "The Chocolate Walnut Cookie was the Citrus favourite.", `
      <div class="group-title">Cookies</div>${cards(cookies, "side", true)}
      <div class="group-title">Other</div>${cards(other, "side", true)}
    `);
  }
  if (screen === "result") app.innerHTML = result();
}

app.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === "start") push("coffee");
    if (action === "restart") restart();
    if (action === "back") goBack();
    if (action === "radio") {
      const box = document.getElementById("radioBox");
      if (box) box.hidden = !box.hidden;
    }
    return;
  }

  const choice = event.target.closest("[data-type][data-id]");
  if (!choice) return;
  const type = choice.dataset.type;
  const id = choice.dataset.id;
  let collection = [];
  if (type === "coffee") collection = data.coffees;
  if (type === "temperature") collection = [
    { id: "hot", name: "Hot", description: "Classic Citrus mood." },
    { id: "iced", name: "Iced", description: `Turns into ${state.coffee?.icedName || "an iced coffee"}.` }
  ];
  if (type === "milk") collection = data.milks;
  if (type === "syrup") collection = data.syrups;
  if (type === "side") collection = data.sides;
  const item = collection.find(x => x.id === id);
  if (item) choose(type, item);
});

render();
