let selectedMedium = null;
let data = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAndProcessCSVData('../MoMA_merged_final.csv');
    
    // Add a global click handler to show the poem when clicking outside the bubbles
    document.addEventListener('click', function(event) {
        // If we're not clicking on a bubble or pie chart, show the poem
        const clickedElement = event.target;
        const clickedOnVisualization = clickedElement.closest('#visualization') || 
                                      clickedElement.closest('#pie-chart');
        
        if (!clickedOnVisualization && selectedMedium) {
            // Reset selectedMedium and hide pie chart, show poem
            selectedMedium = null;
            togglePoemAndPieChart(false);
            
            // Reset bubble styling
            d3.selectAll(".medium-bubble")
                .style("stroke-width", 1)
                .style("stroke", "#aaa");
        }
    });
});

// Function to toggle between poem and pie chart
function togglePoemAndPieChart(showPieChart) {
    const poemDisplay = document.getElementById('poem-display');
    const pieChart = document.getElementById('pie-chart');
    
    if (showPieChart) {
        poemDisplay.style.display = 'none';
        pieChart.style.display = 'block';
    } else {
        poemDisplay.style.display = 'flex'; // Using flex for alignment
        pieChart.style.display = 'none';
    }
}

function createPatterns(svg) {
    const defs = svg.append("defs");
    
    // Gelatin silver print - silver color with grain texture
    const gelatinSilverPattern = defs.append("pattern")
        .attr("id", "gelatin-silver-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    gelatinSilverPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#d6d6d6");
    
    // Add grain texture
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 20;
        const y = Math.random() * 20;
        const size = Math.random() * 0.7;
        
        gelatinSilverPattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "#ffffff")
            .attr("fill-opacity", 0.6);
    }
    
    // Pencil on paper - textured paper appearance
    const pencilPaperPattern = defs.append("pattern")
        .attr("id", "pencil-paper-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    pencilPaperPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#6e6e6e");
    
    // Add paper texture with pencil lines
    for (let i = 0; i < 5; i++) {
        const y = 2 + i * 4;
        pencilPaperPattern.append("line")
            .attr("x1", 0)
            .attr("y1", y)
            .attr("x2", 20)
            .attr("y2", y)
            .attr("stroke", "#555")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.4);
    }
    
    // Add random pencil marks
    for (let i = 0; i < 10; i++) {
        const x1 = Math.random() * 20;
        const y1 = Math.random() * 20;
        const x2 = x1 + Math.random() * 5 - 2.5;
        const y2 = y1 + Math.random() * 5 - 2.5;
        
        pencilPaperPattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#444")
            .attr("stroke-width", 0.3)
            .attr("stroke-opacity", 0.5);
    }
    
    // Lithograph - blue color with vertical lines
    const lithographPattern = defs.append("pattern")
        .attr("id", "lithograph-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    lithographPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#5aa9e6");
        
    for (let i = 0; i < 8; i++) {
        lithographPattern.append("line")
            .attr("x1", i*3)
            .attr("y1", 0)
            .attr("x2", i*3)
            .attr("y2", 20)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.5);
    }
    
    // Albumen silver print - warmer silver with yellowish tint
    const albumenSilverPattern = defs.append("pattern")
        .attr("id", "albumen-silver-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    albumenSilverPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#c9b99b"); // Warmer, more yellow-brown tone
    
    // Add subtle cracks and aging effect
    for (let i = 0; i < 5; i++) {
        const x1 = Math.random() * 20;
        const y1 = Math.random() * 20;
        const x2 = x1 + Math.random() * 10 - 5;
        const y2 = y1 + Math.random() * 10 - 5;
        
        albumenSilverPattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#8a795d")
            .attr("stroke-width", 0.4)
            .attr("stroke-opacity", 0.4);
    }
    
    // Pencil on tracing paper - transparent with grid lines
    const tracingPaperPattern = defs.append("pattern")
        .attr("id", "tracing-paper-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 20)
        .attr("height", 20);
        
    tracingPaperPattern.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "#dedede"); // Light gray background
    
    // Add grid lines for tracing paper
    for (let i = 0; i < 5; i++) {
        // Horizontal lines
        tracingPaperPattern.append("line")
            .attr("x1", 0)
            .attr("y1", i * 4)
            .attr("x2", 20)
            .attr("y2", i * 4)
            .attr("stroke", "#aaaaaa")
            .attr("stroke-width", 0.3)
            .attr("stroke-opacity", 0.7);
            
        // Vertical lines
        tracingPaperPattern.append("line")
            .attr("x1", i * 4)
            .attr("y1", 0)
            .attr("x2", i * 4)
            .attr("y2", 20)
            .attr("stroke", "#aaaaaa")
            .attr("stroke-width", 0.3)
            .attr("stroke-opacity", 0.7);
    }
}

function getPatternId(medium) {
    const mediumLower = medium.toLowerCase();
    if (mediumLower.includes("gelatin silver")) return "url(#gelatin-silver-pattern)";
    if (mediumLower.includes("pencil on paper") && !mediumLower.includes("tracing")) return "url(#pencil-paper-pattern)";
    if (mediumLower.includes("lithograph")) return "url(#lithograph-pattern)";
    if (mediumLower.includes("albumen silver")) return "url(#albumen-silver-pattern)";
    if (mediumLower.includes("pencil on tracing paper")) return "url(#tracing-paper-pattern)";
    return "#555555"; // Darker default color for unmatched mediums
}

function getGenderColor(gender) {
    return gender === "male" ? "#7c67a9" : "#ff9e56"; // Brighter colors for better visibility
}

function handleMediumClick(medium) {
    if (selectedMedium === medium) {
        // If clicking the same medium again, hide the pie chart and show poem
        selectedMedium = null;
        togglePoemAndPieChart(false);
    } else {
        // If clicking a different medium, show its pie chart
        selectedMedium = medium;
        createPieChart(medium);
        togglePoemAndPieChart(true);
    }
    
    // Update bubble styling
    d3.selectAll(".medium-bubble")
        .style("stroke-width", function(d) {
            return d.data.medium === selectedMedium ? 3 : 1;
        })
        .style("stroke", function(d) {
            return d.data.medium === selectedMedium ? "#fff" : "#aaa";
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
        .style("fill", "#ffffff")
        .text("Art Medium Distribution by Gender");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 70)
        .attr("text-anchor", "middle")
        .attr("class", "subtitle")
        .style("font-size", "16px")
        .style("font-style", "italic")
        .style("fill", "#dddddd")
        .text("Size represents number of artworks; Click to explore gender distribution.");
    
    const pack = d3.pack()
        .size([width - 100, height - 140])
        .padding(20);
    
    const hierarchy = d3.hierarchy({ children: data.topMediums })
        .sum(d => d.total);
    
    const root = pack(hierarchy);
    
    const bubblesGroup = svg.append("g")
        .attr("transform", `translate(50, 150)`);
    
    const bubbles = bubblesGroup.selectAll("g.medium")
        .data(root.children)
        .enter()
        .append("g")
        .attr("class", "medium-group")
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .style("cursor", "pointer")
        .on("click", function(event, d) {
            // D3 v7 event handling
            if (event) event.stopPropagation();
            handleMediumClick(d.data.medium);
        });
    
    bubbles.append("circle")
        .attr("class", "medium-bubble")
        .attr("r", d => d.r)
        .style("fill", d => getPatternId(d.data.medium))
        .style("stroke", "#aaa")
        .style("stroke-width", 1)
        .on("mouseover", function() {
            d3.select(this)
                .style("stroke-width", 3)
                .style("stroke", "#fff");
        })
        .on("mouseout", function(event, d) {
            if (selectedMedium !== d3.select(this.parentNode).datum().data.medium) {
                d3.select(this)
                    .style("stroke-width", 1)
                    .style("stroke", "#aaa");
            }
        });
    
    bubbles.append("circle")
        .attr("r", d => Math.min(d.r / 1.5, 30))
        .attr("fill", "rgba(0, 0, 0, 0)")
        .style("pointer-events", "none");
    
    bubbles.append("text")
        .attr("class", "medium-label")
        .attr("text-anchor", "middle")
        .attr("dy", "0.1em")
        .text(d => d.data.medium)
        .style("font-size", d => Math.min(d.r / 5, 14) + "px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 4px black, 0px 0px 4px black");
    
    bubbles.append("text")
        .attr("class", "count-label")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .text(d => d.data.total + " artworks")
        .style("font-size", d => Math.min(d.r / 6, 12) + "px")
        .style("fill", "#dddddd")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 4px black, 0px 0px 4px black");
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
    const height = 400; // Increased height to fit all elements
    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;")
        .style("overflow", "visible"); // Prevent clipping
    
    // Create artistic background for pie chart (transparent now)
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        .attr("rx", 10)
        .attr("ry", 10);
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .text(`Gender Distribution for ${medium}`);
    
    // Create a textured effect for the pie slices
    const defs = svg.append("defs");
    
    // Create a radial gradient for male pie slice 
    const maleGradient = defs.append("radialGradient")
        .attr("id", "male-gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%");
        
    maleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#9a85cb");
        
    maleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#5f4c73");
    
    // Create a radial gradient for female pie slice
    const femaleGradient = defs.append("radialGradient")
        .attr("id", "female-gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%");
        
    femaleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffb980");
        
    femaleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ed944d");
    
    const pieGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 - 20})`);
    
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
        .attr("fill", d => d.data.gender === "male" ? "url(#male-gradient)" : "url(#female-gradient)")
        .attr("stroke", "#333")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.3))");
    
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
        .attr("transform", `translate(${width/2 - 100}, ${height - 70})`);
    
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
        .style("font-size", "14px")
        .style("fill", "#ffffff");
    
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
        .style("font-size", "14px")
        .style("fill", "#ffffff");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
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
