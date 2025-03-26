// Global variables
let selectedMedium = null;
let data = null;

// Initialize visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // For development purposes, use simulated data
    // In production, uncomment the line below to load real data
    loadAndProcessCSVData('MoMA_merged_final.csv');
    
    // Simulate data for development
    // simulateData();
});

// Simulate data for development purposes
function simulateData() {
    data = {
        topMediums: [
            { medium: "Lithograph", total: 4326, male: 3459, female: 867 },
            { medium: "Gelatin silver print", total: 3891, male: 2918, female: 973 },
            { medium: "Oil on canvas", total: 3215, male: 2689, female: 526 },
            { medium: "Etching", total: 2780, male: 2113, female: 667 },
            { medium: "Woodcut", total: 1952, male: 1425, female: 527 }
        ]
    };
    
    // Create the visualization with simulated data
    createVisualization();
}

// Create texture patterns for each medium
function createPatterns(svg) {
    // Define patterns for each medium type
    const defs = svg.append("defs");
    
    // Create paint-like textures for each medium
    
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
        
    // Add texture lines for lithograph stone
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
    
    // Add subtle grain texture for photographic paper
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
        
    // Add canvas texture and brush strokes
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
        
    // Add etched lines
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
        
    // Add wood grain lines
    for (let i = 0; i < 5; i++) {
        woodcutPattern.append("path")
            .attr("d", `M${i*4},0 Q${i*4+2},10 ${i*4},20`)
            .attr("stroke", "#8b4513")
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.3)
            .attr("fill", "none");
    }
}

// Get pattern ID for a given medium
function getPatternId(medium) {
    const mediumLower = medium.toLowerCase();
    if (mediumLower.includes("lithograph")) return "url(#lithograph-pattern)";
    if (mediumLower.includes("gelatin silver")) return "url(#gelatin-silver-pattern)";
    if (mediumLower.includes("oil on canvas")) return "url(#oil-canvas-pattern)";
    if (mediumLower.includes("etching")) return "url(#etching-pattern)";
    if (mediumLower.includes("woodcut")) return "url(#woodcut-pattern)";
    return "#f0f0f0"; // Default
}

// Get fill color for gender in pie chart
function getGenderColor(gender) {
    return gender === "male" ? "#5f4c73" : "#ed944d";
}

// Handle medium selection
function handleMediumClick(medium) {
    if (selectedMedium === medium) {
        selectedMedium = null;
        // Clear pie chart
        d3.select("#pie-chart").selectAll("*").remove();
    } else {
        selectedMedium = medium;
        createPieChart(medium);
    }
    
    // Update stroke styling based on selection
    d3.selectAll(".medium-bubble")
        .style("stroke-width", function(d) {
            return d.data.medium === selectedMedium ? 3 : 1;
        })
        .style("stroke", function(d) {
            return d.data.medium === selectedMedium ? "#000" : "#333";
        });
}

// Create main visualization
function createVisualization() {
    // Clear any existing visualization
    d3.select("#visualization").selectAll("*").remove();
    
    // Create SVG
    const width = 800;
    const height = 500;
    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
    
    // Create patterns
    createPatterns(svg);
    
    // Create title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("class", "title")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text("Art Medium Distribution by Gender");
    
    // Add subtitle
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 70)
        .attr("text-anchor", "middle")
        .attr("class", "subtitle")
        .style("font-size", "16px")
        .style("font-style", "italic")
        .text("Size represents number of artworks");
    
    // Pack layout for the bubbles
    const pack = d3.pack()
        .size([width - 100, height - 140])
        .padding(20);
    
    const hierarchy = d3.hierarchy({ children: data.topMediums })
        .sum(d => d.total);
    
    const root = pack(hierarchy);
    
    // Create a group for the bubbles
    const bubblesGroup = svg.append("g")
        .attr("transform", `translate(50, 100)`);
    
    // Add bubbles for each medium
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
    
    // Create the main circle for each medium
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
    
    // Add medium labels
    bubbles.append("text")
        .attr("class", "medium-label")
        .attr("text-anchor", "middle")
        .attr("dy", "0.1em")
        .text(d => d.data.medium)
        .style("font-size", d => Math.min(d.r / 5, 14) + "px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px white, 0px 0px 3px white");
    
    // Add count labels
    bubbles.append("text")
        .attr("class", "count-label")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .text(d => d.data.total + " artworks")
        .style("font-size", d => Math.min(d.r / 6, 12) + "px")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px white, 0px 0px 3px white");
    
    // Add instructions
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-style", "italic")
        .text("Click on a medium to see gender distribution");
}

// Create gender distribution pie chart
function createPieChart(medium) {
    if (!data) return;
    
    // Find the selected medium data
    const mediumData = data.topMediums.find(m => m.medium === medium);
    if (!mediumData) return;
    
    // Prepare pie chart data
    const pieData = [
        { gender: "male", value: mediumData.male },
        { gender: "female", value: mediumData.female }
    ];
    
    // Clear existing pie chart
    d3.select("#pie-chart").selectAll("*").remove();
    
    // Create SVG for pie chart
    const width = 400;
    const height = 350; // Increased height to accommodate lower placement
    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto;");
    
    // Add background
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f9f9f9")
        .attr("rx", 10)
        .attr("ry", 10);
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(`Gender Distribution for ${medium}`);
    
    // Create group for the pie chart - position it lower
    const pieGroup = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`);
    
    // Create the pie layout
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null); // Don't sort, maintain the order (male, female)
    
    const pieArcs = pie(pieData);
    
    // Create the arc generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 80); // Reduced radius to avoid overlap
    
    // Create the arcs
    pieGroup.selectAll("path")
        .data(pieArcs)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => getGenderColor(d.data.gender))
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    
    // Add percentage labels
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
    
    // Add gender labels as a separate legend below the pie
    const legendGroup = svg.append("g")
        .attr("transform", `translate(${width/2 - 100}, ${height - 60})`);
    
    // Male legend item
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
    
    // Female legend item
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
    
    // Add total count
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(`Total artworks: ${mediumData.total}`);
}

// Function to parse and process CSV data from the MoMA dataset
function loadAndProcessCSVData(csvFilePath) {
    // Use d3.csv to load the file
    d3.csv(csvFilePath).then(function(rawData) {
        // Process the loaded data
        const mediumCounts = {};
        
        // Count artworks by medium and gender
        rawData.forEach(function(row) {
            const medium = row.Medium;
            const gender = row["Gender.y"]; // Adjust based on actual column name
            
            // Skip rows with missing medium or gender
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
        
        // Convert to array and sort
        const mediumArray = Object.entries(mediumCounts).map(([medium, counts]) => ({
            medium,
            total: counts.total,
            male: counts.male,
            female: counts.female
        }));
        
        // Sort by total count descending
        mediumArray.sort((a, b) => b.total - a.total);
        
        // Get top 5 mediums
        const top5Mediums = mediumArray.slice(0, 5);
        
        // Update data and create visualization
        data = { topMediums: top5Mediums };
        createVisualization();
    }).catch(function(error) {
        console.error("Error loading CSV:", error);
        // If error loading, fall back to simulated data
        simulateData();
    });
}
