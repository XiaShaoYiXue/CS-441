let selectedMedium = null;
let data = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAndProcessCSVData('../MoMA_merged_final.csv');
});

function createPatterns(svg) {
    const defs = svg.append("defs");
    
    // Lithograph - blue color with texture
    const lithographPattern = defs.append("pattern")
        .attr("id", "lithograph-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    lithographPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#4682b4");
        
    for (let i = 0; i < 8; i++) {
        lithographPattern.append("line")
            .attr("x1", i*3)
            .attr("y1", 0)
            .attr("x2", i*3)
            .attr("y2", 20)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.2);
    }
    
    // Gelatin silver print - gray/silver color with grain
    const silverPattern = defs.append("pattern")
        .attr("id", "gelatin-silver-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    silverPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#a9a9a9");
    
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 20;
        const y = Math.random() * 20;
        
        silverPattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 0.5)
            .attr("fill", "#ffffff")
            .attr("fill-opacity", 0.3);
    }
    
    // Oil on canvas - warm red color with canvas texture
    const oilPattern = defs.append("pattern")
        .attr("id", "oil-canvas-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    oilPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#e07a5f");
        
    oilPattern.append("path")
        .attr("d", "M0,0 Q10,10 20,0 M0,20 Q10,10 20,20")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.2)
        .attr("fill", "none");
    
    // Etching - green color with etched lines
    const etchingPattern = defs.append("pattern")
        .attr("id", "etching-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    etchingPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#3a9679");
        
    for (let i = 0; i < 10; i++) {
        etchingPattern.append("line")
            .attr("x1", 0)
            .attr("y1", i * 2)
            .attr("x2", 20)
            .attr("y2", i * 2)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.2);
    }
    
    // Woodcut - warm brown color with wood grain
    const woodcutPattern = defs.append("pattern")
        .attr("id", "woodcut-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    woodcutPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#deb887");
        
    for (let i = 0; i < 5; i++) {
        woodcutPattern.append("path")
            .attr("d", `M${i*4},0 Q${i*4+2},10 ${i*4},20`)
            .attr("stroke", "#8b4513")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.3)
            .attr("fill", "none");
    }
}

function getPatternId(medium) {
    const mediumLower = medium.toLowerCase();
    if (mediumLower.includes("lithograph")) return "url(#lithograph-pattern)";
    if (mediumLower.includes("gelatin silver")) return "url(#gelatin-silver-pattern)";
    if (mediumLower.includes("oil on canvas")) return "url(#oil-canvas-pattern)";
    if (mediumLower.includes("etching")) return "url(#etching-pattern)";
    if (mediumLower.includes("woodcut")) return "url(#woodcut-pattern)";
    return "#f0f0f0"; 
}

function getGenderColor(gender) {
    return gender === "male" ? "#5f4c73" : "#ed944d";
}

function handleMediumClick(medium) {
    if (selectedMedium === medium) {
        selectedMedium = null;
        d3.select("#pie-chart").selectAll("*").remove();
    } else {
        selectedMedium = medium;
        createPieChart(medium);
    }
    
    d3.selectAll(".medium-bubble")
        .style("stroke-width", function(d) {
            return d.data.medium === selectedMedium ? 3 : 1;
        })
        .style("stroke", function(d) {
            return d.data.medium === selectedMedium ? "#000" : "#333";
        });
}

function createVisualization() {
    d3.select("#visualization").selectAll("*").remove();
    
    const width = 800;
    const height = 500;
    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
    
    createPatterns(svg);
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("class", "title")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("Art Medium Distribution by Gender");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 70)
        .attr("text-anchor", "middle")
        .attr("class", "subtitle")
        .style("font-size", "16px")
        .style("font-style", "italic")
        .text("Size represents number of artworks");
    
    const pack = d3.pack()
        .size([width - 100, height - 140])
        .padding(20);
    
    const hierarchy = d3.hierarchy({ children: data.topMediums })
        .sum(d => d.total);
    
    const root = pack(hierarchy);
    
    const bubblesGroup = svg.append("g")
        .attr("transform", `translate(50, 100)`);
    
    const bubbles = bubblesGroup.selectAll("g.medium")
        .data(root.children)
        .enter()
        .append("g")
        .attr("class", "medium-group")
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .style("cursor", "pointer")
        .on("click", function(event, d) {
            handleMediumClick(d.data.medium);
        });
    
    bubbles.append("circle")
        .attr("class", "medium-bubble")
        .attr("r", d => d.r)
        .style("fill", d => getPatternId(d.data.medium))
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .on("mouseover", function() {
            d3.select(this)
                .style("stroke-width", 3)
                .style("stroke", "#000");
        })
        .on("mouseout", function(event, d) {
            if (selectedMedium !== d3.select(this.parentNode).datum().data.medium) {
                d3.select(this)
                    .style("stroke-width", 1)
                    .style("stroke", "#333");
            }
        });
    
    bubbles.append("text")
        .attr("class", "medium-label")
        .attr("text-anchor", "middle")
        .attr("dy", "0.1em")
        .text(d => d.data.medium)
        .style("font-size", d => Math.min(d.r / 5, 14) + "px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px white, 0px 0px 3px white");
    
    bubbles.append("text")
        .attr("class", "count-label")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .text(d => d.data.total + " artworks")
        .style("font-size", d => Math.min(d.r / 6, 12) + "px")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px white, 0px 0px 3px white");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-style", "italic")
        .text("Click on a medium to see gender distribution");
}

function createPieChart(medium) {
    if (!data) return;
    
    const mediumData = data.topMediums.find(m => m.medium === medium);
    if (!mediumData) return;
    
    const pieData = [
        { gender: "male", value: mediumData.male },
        { gender: "female", value: mediumData.female }
    ];
    
    d3.select("#pie-chart").selectAll("*").remove();
    
    const width = 400;
    const height = 350; 
    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
    
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f9f9f9")
        .attr("rx", 10)
        .attr("ry", 10);
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Gender Distribution for ${medium}`);
    
    const pieGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`);
    
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null); 
    
    const pieArcs = pie(pieData);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 80); 
    
    pieGroup.selectAll("path")
        .data(pieArcs)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => getGenderColor(d.data.gender))
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    
    const arcLabel = d3.arc()
        .innerRadius(Math.min(width, height) / 6)
        .outerRadius(Math.min(width, height) / 6);
    
    pieGroup.selectAll("text.percentage")
        .data(pieArcs)
        .enter()
        .append("text")
        .attr("class", "percentage")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => `${((d.data.value / (mediumData.male + mediumData.female)) * 100).toFixed(1)}%`)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white");
    
    const legendGroup = svg.append("g")
        .attr("transform", `translate(${width/2 - 100}, ${height - 60})`);
    
    legendGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", getGenderColor("male"));
    
    legendGroup.append("text")
        .attr("x", 25)
        .attr("y", 12)
        .text(`male (${pieData[0].value})`)
        .style("font-size", "14px");
    
    legendGroup.append("rect")
        .attr("x", 130)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", getGenderColor("female"));
    
    legendGroup.append("text")
        .attr("x", 155)
        .attr("y", 12)
        .text(`female (${pieData[1].value})`)
        .style("font-size", "14px");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`Total artworks: ${mediumData.total}`);
}

function loadAndProcessCSVData(csvFilePath) {
    d3.csv(csvFilePath).then(function(rawData) {
        const mediumCounts = {};
        
        rawData.forEach(function(row) {
            const medium = row.Medium;
            const gender = row["Gender.y"]; 
            
            if (!medium || !gender || medium === "" || gender === "") return;
            
            if (!mediumCounts[medium]) {
                mediumCounts[medium] = {
                    total: 0,
                    male: 0,
                    female: 0
                };
            }
            
            mediumCounts[medium].total += 1;
            if (gender.toLowerCase() === "male") {
                mediumCounts[medium].male += 1;
            } else if (gender.toLowerCase() === "female") {
                mediumCounts[medium].female += 1;
            }
        });
        
        const mediumArray = Object.entries(mediumCounts).map(([medium, counts]) => ({
            medium,
            total: counts.total,
            male: counts.male,
            female: counts.female
        }));
        
        mediumArray.sort((a, b) => b.total - a.total);
        
        const top5Mediums = mediumArray.slice(0, 5);
        
        data = { topMediums: top5Mediums };
        createVisualization();
    }).catch(function(error) {
        console.error("Error loading CSV:", error);
        simulateData();
    });
}
