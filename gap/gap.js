const colorMap = {
  "female": "#e75480",
  "male": "#1e90ff",
  "non-binary": "gray",
  "gender non-conforming": "#FFA500",
  "female(transwoman)": "purple",
  "transgender woman": "purple"
};

const leftArea = d3.select("#left");
const rightArea = d3.select("#right");
const slider = document.getElementById("yearSlider");
const yearLabel = document.getElementById("yearLabel");

let dataset;
let years = [];
let bubbleStore = {};
let lastYearIndex = 0;

const sessionSeed = Math.ceil(Math.random() * 10000);

d3.json("data.json").then(data => {
  dataset = data;
  years = Object.keys(data.creation).map(Number).sort((a, b) => a - b);

  slider.min = 0;
  slider.max = years.length - 1;
  slider.step = 1;
  slider.value = 0;

  yearLabel.textContent = `Year: ${years[0]}`;
  initializeStore();

  slider.addEventListener("input", () => {
    const index = parseInt(slider.value);
    const year = years[index];
    yearLabel.textContent = `Year: ${year}`;
    const isForward = index >= lastYearIndex;

    if (!isForward) {
      resetVisualization();
      initializeStore();
      for (let i = 0; i <= index; i++) {
        processYear(years[i], false); // no animation
      }
    } else {
      for (let i = lastYearIndex + 1; i <= index; i++) {
        processYear(years[i], true); // animate forward
      }
    }

    lastYearIndex = index;
  });

  processYear(years[0]);
});

function initializeStore() {
  bubbleStore = {};
}

function resetVisualization() {
  leftArea.selectAll(".bubble").remove();
  rightArea.selectAll(".bubble").remove();
}

function processYear(year, animate = true) {
  const creation = dataset.creation[year] || {};
  const acquired = dataset.acquired[year] || {};
  const allGenders = Object.keys(colorMap); // ensure all genders are processed

  allGenders.forEach(gender => {
    if (!bubbleStore[gender]) {
      bubbleStore[gender] = {
        totalCreated: 0,
        totalAcquired: 0,
        left: 0,
        right: 0,
        elements: []
      };
    }

    const store = bubbleStore[gender];
    store.totalCreated += creation[gender] || 0;
    store.totalAcquired += acquired[gender] || 0;

    const unacquired = store.totalCreated - store.totalAcquired;
    const expectedLeft = unacquired > 0 ? Math.max(1, Math.ceil(unacquired / 1000)) : 0;
    const expectedRight = Math.ceil(store.totalAcquired / 1000);

    while (store.left > expectedLeft) {
      const bubble = store.elements.shift();
      bubble.remove();
      store.left--;
    }

    while (store.left < expectedLeft) {
      const bubble = spawnBubble(leftArea, gender, store.left, 'left');
      store.elements.push(bubble);
      store.left++;
    }

    const toMoveRight = Math.min(expectedRight - store.right, store.left);
    for (let i = 0; i < toMoveRight; i++) {
      const bubble = store.elements.shift();
      if (animate) {
        animateBubbleTo(rightArea, bubble, gender, store.right, 'right');
      } else {
        bubble.remove();
        spawnBubble(rightArea, gender, store.right, 'right', false);
      }
      store.left--;
      store.right++;
    }

    if (!animate && store.right > expectedRight) {
      const extra = store.right - expectedRight;
      for (let i = 0; i < extra; i++) {
        const bubble = selectLastBubbleIn(rightArea);
        if (bubble) bubble.remove();
        store.right--;
      }
    }
  });
}

function spawnBubble(area, gender, index = 0, side = 'left', withTransition = true) {
  const padding = 10;
  const maxTries = 30;
  const size = 8 + (index % 10) * 1.2;
  const r = size / 2;

  const areaBox = area.node().getBoundingClientRect();
  const areaWidth = areaBox.width - size - 2 * padding;
  const areaHeight = areaBox.height - size - 2 * padding;

  const existing = area.selectAll(".bubble").nodes().map(b => {
    const rect = b.getBoundingClientRect();
    const br = parseFloat(b.style.width) / 2;
    return {
      x: rect.left - areaBox.left + br,
      y: rect.top - areaBox.top + br,
      r: br
    };
  });

  let x, y, centerX, centerY;
  let tries = 0;
  let success = false;

  while (tries < maxTries && !success) {
    const seed = hashCode(`${sessionSeed}-${gender}-${index}-${side}-${tries}`);
    const randX = seededRandom(seed);
    const randY = seededRandom(seed + 1);

    x = padding + randX * areaWidth;
    y = padding + randY * areaHeight;
    centerX = x + r;
    centerY = y + r;

    success = !existing.some(b => {
      const dx = centerX - b.x;
      const dy = centerY - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < r + b.r + 1;
    });

    tries++;
  }

  if (!success) {
    const fallbackSeed = hashCode(`${sessionSeed}-fallback-${gender}-${index}-${side}`);
    const randX = seededRandom(fallbackSeed);
    const randY = seededRandom(fallbackSeed + 1);
    x = padding + randX * areaWidth;
    y = padding + randY * areaHeight;
    console.warn(`⚠️ Bubble placed with overlap (${gender})`);
  }

  const bubble = area.append("div")
    .attr("class", "bubble")
    .style("width", `${size}px`)
    .style("height", `${size}px`)
    .style("left", `${x}px`)
    .style("top", `${y}px`)
    .style("background-color", colorMap[gender] || "#999")
    .style("opacity", withTransition ? 0 : 0.8)
    .style("transform", withTransition ? "scale(0.2)" : "scale(1)")
    .attr("title", gender); // tooltip for accessibility

  if (withTransition) {
    bubble.transition()
      .duration(500)
      .style("opacity", 0.8)
      .style("transform", "scale(1)");
  }

  return bubble;
}

function animateBubbleTo(targetArea, bubble, gender, index, side) {
  const size = parseFloat(bubble.style("width"));
  const startRect = bubble.node().getBoundingClientRect();
  bubble.remove();

  const padding = 10;
  const targetBox = targetArea.node().getBoundingClientRect();
  const randX = seededRandom(hashCode(`${sessionSeed}-${gender}-${index}-${side}`));
  const randY = seededRandom(hashCode(`${sessionSeed}-${gender}-${index}-${side}`) + 1);
  const endX = targetBox.left + padding + randX * (targetBox.width - size - 2 * padding);
  const endY = targetBox.top + padding + randY * (targetBox.height - size - 2 * padding);
  const finalX = endX - targetBox.left;
  const finalY = endY - targetBox.top;

  const animated = d3.select("body").append("div")
    .attr("class", "bubble")
    .style("position", "absolute")
    .style("width", `${size}px`)
    .style("height", `${size}px`)
    .style("background-color", colorMap[gender] || "#999")
    .style("left", `${startRect.left}px`)
    .style("top", `${startRect.top}px`)
    .style("z-index", 10000)
    .style("opacity", 0.8)
    .style("border-radius", "50%");

  animated.transition()
    .duration(600)
    .style("left", `${endX}px`)
    .style("top", `${endY}px`)
    .on("end", () => {
      animated.remove();
      targetArea.append("div")
        .attr("class", "bubble")
        .style("width", `${size}px`)
        .style("height", `${size}px`)
        .style("left", `${finalX}px`)
        .style("top", `${finalY}px`)
        .style("background-color", colorMap[gender] || "#999")
        .style("opacity", 0.8)
        .attr("title", gender);
    });
}

function selectLastBubbleIn(area) {
  const bubbles = area.selectAll(".bubble").nodes();
  return bubbles.length > 0 ? d3.select(bubbles[bubbles.length - 1]) : null;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
