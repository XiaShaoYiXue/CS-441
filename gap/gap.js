const svgLeft = d3.select("#created");
const svgRight = d3.select("#acquired");
const height = 300;

const sizeMap = {
  small: { radius: 4, value: 40 },
  medium: { radius: 10, value: 400 },
  large: { radius: 20, value: 4000 }
};

const color = d3.scaleOrdinal()
  .domain(["male", "female", "unknown"])
  .range(["#1f77b4", "#ff69b4", "#999"]);

const groupLeft = svgLeft.append("g");
const groupRight = svgRight.append("g");

function quantizeBubbles(data) {
  const result = [];
  const grouped = d3.rollup(data, v => v.length, d => d.gender);

  grouped.forEach((count, gender) => {
    let large = Math.floor(count / 4000);
    let rem = count % 4000;
    let medium = Math.floor(rem / 400);
    rem = rem % 400;
    let small = Math.max(1, Math.floor(rem / 40));

    for (let i = 0; i < large; i++) result.push({ gender, type: "large" });
    for (let i = 0; i < medium; i++) result.push({ gender, type: "medium" });
    for (let i = 0; i < small; i++) result.push({ gender, type: "small" });
  });
  return result;
}

function renderBubbles(bubbles, group, svg) {
  const width = svg.node().getBoundingClientRect().width;

  const sim = d3.forceSimulation(bubbles)
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .force("collide", d3.forceCollide(d => sizeMap[d.type].radius + 1))
    .alpha(1)
    .restart()
    .on("tick", () => {
      group.selectAll("circle")
        .data(bubbles)
        .join("circle")
        .attr("r", d => sizeMap[d.type].radius)
        .attr("fill", d => color(d.gender))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });
}

d3.json("bubbles_dual_view_10yr_full.json").then(data => {
  const createdData = data.filter(d => d.type === "created");
  const acquiredData = data.filter(d => d.type === "acquired");

  const leftBubbles = quantizeBubbles(createdData);
  const rightBubbles = quantizeBubbles(acquiredData);

  renderBubbles(leftBubbles, groupLeft, svgLeft);
  renderBubbles(rightBubbles, groupRight, svgRight);
});
