// Main visualization function
async function createVisualization() {
    try {
        const data = await d3.csv('../MoMA_merged_final.csv');
        
        const departmentGenderCounts = {};
        
        data.forEach(d => {
            const department = d.Department;
            
            let gender = null;
            if (d["Gender.y"] !== undefined) gender = d["Gender.y"];
            else if (d.Gender !== undefined) gender = d.Gender;
            
            if (!department || !gender || department === "N/A" || department === "NA" || department === "") {
                return;
            }
            
            const normalizedGender = gender.trim().toLowerCase();
            if (normalizedGender === "n/a" || normalizedGender === "") {
                return;
            }
            
            if (normalizedGender === "male") {
                if (!departmentGenderCounts[department]) {
                    departmentGenderCounts[department] = { male: 0, female: 0, total: 0 };
                }
                departmentGenderCounts[department].male++;
                departmentGenderCounts[department].total++;
            } 
            else if (normalizedGender === "female") {
                if (!departmentGenderCounts[department]) {
                    departmentGenderCounts[department] = { male: 0, female: 0, total: 0 };
                }
                departmentGenderCounts[department].female++;
                departmentGenderCounts[department].total++;
            }
        });
        
        // Convert to array and sort by total count (descending)
        let formattedData = Object.entries(departmentGenderCounts)
            .filter(([department]) => {
                // Filter out N/A categories and the empty Architecture & Design - Image Archive
                return department !== "NA" && 
                       department !== "N/A" && 
                       department !== "Architecture & Design - Image Archive";
            })
            .map(([department, counts]) => ({
                department,
                male: counts.male,
                female: counts.female,
                total: counts.total
            }));
        
        formattedData = formattedData.filter(d => d.total > 0);
        
        formattedData.sort((a, b) => b.total - a.total);
        const topDepartments = formattedData.slice(0, 10);
        
        renderPencilChart(topDepartments);
        
    } catch (error) {
        console.error('Error loading or processing data:', error);
        document.getElementById('chart').innerHTML = `
            <p style="color: red; text-align: center;">
                Error loading data: ${error.message}
            </p>`;
    }
}

// Function to render the pencil chart
function renderPencilChart(data) {
    document.getElementById('chart').innerHTML = '';
    
    const margin = { top: 50, right: 30, bottom: 120, left: 80 };
    const width = Math.max(800, data.length * 100) - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const chartContainer = d3.select("#chart")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center");
    
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x0 = d3.scaleBand()
        .domain(data.map(d => d.department))
        .rangeRound([0, width])
        .paddingInner(0.1);
    
    const x1 = d3.scaleBand()
        .domain(["male", "female"])
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);
    
    const maxCount = d3.max(data, d => Math.max(d.male, d.female));
    
    const y = d3.scaleLinear()
        .domain([0, maxCount > 0 ? maxCount : 100]) // Fallback if max is 0
        .nice()
        .range([height, 0]);
    
    const colors = {
        male: "#5f4c73",
        female: "#ed944d"
    };
    
    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");
    
    svg.append("g")
        .call(d3.axisLeft(y));
    
    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .text("Department");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Number of Artworks");
    
    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Gender Distribution Across Top 10 MoMA Departments");
    
    // Create pencil patterns for both genders
    const defs = svg.append("defs");
    
    // Male pencil pattern (graphite/lead color with purple)
    const malePencil = defs.append("pattern")
        .attr("id", "malePencil")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", x1.bandwidth())
        .attr("height", 20);
    
    malePencil.append("rect")
        .attr("width", x1.bandwidth())
        .attr("height", 20)
        .attr("fill", colors.male);
    
    // Add some texture to the male pencil
    malePencil.append("path")
        .attr("d", `M0,0 L${x1.bandwidth()},0 L${x1.bandwidth()},20 L0,20 Z`)
        .attr("fill", "url(#maleGradient)");
    
    // Female pencil pattern (colored pencil - orange)
    const femalePencil = defs.append("pattern")
        .attr("id", "femalePencil")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", x1.bandwidth())
        .attr("height", 20);
    
    femalePencil.append("rect")
        .attr("width", x1.bandwidth())
        .attr("height", 20)
        .attr("fill", colors.female);
    
    // Add some texture to the female pencil
    femalePencil.append("path")
        .attr("d", `M0,0 L${x1.bandwidth()},0 L${x1.bandwidth()},20 L0,20 Z`)
        .attr("fill", "url(#femaleGradient)");
    
    // Function to create pencil path
    function createPaintbrushPath(x, y, width, height) {
        // Parameters for pencil shape
        const tipHeight = Math.min(30, height * 0.15); // Pencil tip height
        const eraserHeight = Math.min(15, height * 0.08); // Pencil eraser height
        const bodyHeight = height - tipHeight - eraserHeight; // Pencil body height
        const pencilWidth = width; // Width of the pencil
        
        // Calculate points
        const leftX = x;
        const rightX = x + pencilWidth;
        const midX = x + (pencilWidth / 2);
        
        // Define path for pencil shape
        const path = 
            // Start at the tip of the pencil (top)
            `M${midX},${y} ` +
            // Draw the tip (triangle)
            `L${leftX},${y + tipHeight} ` +
            `L${rightX},${y + tipHeight} ` +
            `Z ` +
            // Draw the body (rectangle)
            `M${leftX},${y + tipHeight} ` +
            `L${leftX},${y + tipHeight + bodyHeight} ` +
            `L${rightX},${y + tipHeight + bodyHeight} ` +
            `L${rightX},${y + tipHeight} ` +
            `Z ` +
            // Draw the eraser (slightly wider rectangle)
            `M${leftX - 1},${y + tipHeight + bodyHeight} ` +
            `L${leftX - 1},${y + tipHeight + bodyHeight + eraserHeight} ` +
            `L${rightX + 1},${y + tipHeight + bodyHeight + eraserHeight} ` +
            `L${rightX + 1},${y + tipHeight + bodyHeight} ` +
            `Z`;
        
        return {
            mainPath: path,
            // Return the coordinates for the line between tip and body
            tipLine: {
                x1: leftX,
                y1: y + tipHeight,
                x2: rightX,
                y2: y + tipHeight
            }
        };
    }
    
    // Draw pencils for each department and gender
    data.forEach(d => {
        // Male pencil
        const maleX = x0(d.department) + x1("male");
        const maleHeight = height - y(d.male);
        const maleY = y(d.male);
        const maleWidth = x1.bandwidth();
        
        const malePencil = createPaintbrushPath(maleX, maleY, maleWidth, maleHeight);
        
        svg.append("path")
            .attr("class", "pencil male-pencil")
            .attr("d", malePencil.mainPath)
            .attr("fill", colors.male)
            .attr("opacity", 0.9)
            .on("mouseover", function() {
                d3.select(this).attr("opacity", 1);
                
                svg.append("text")
                    .attr("class", "value-label")
                    .attr("x", maleX + maleWidth / 2)
                    .attr("y", maleY - 10)
                    .attr("text-anchor", "middle")
                    .text(d.male);
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 0.9);
                svg.selectAll(".value-label").remove();
            });
            
        // Add the line between pencil tip and body for male pencil
        svg.append("line")
            .attr("x1", malePencil.tipLine.x1)
            .attr("y1", malePencil.tipLine.y1)
            .attr("x2", malePencil.tipLine.x2)
            .attr("y2", malePencil.tipLine.y2)
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);
        
        // Female pencil
        const femaleX = x0(d.department) + x1("female");
        const femaleHeight = height - y(d.female);
        const femaleY = y(d.female);
        const femaleWidth = x1.bandwidth();
        
        const femalePencil = createPaintbrushPath(femaleX, femaleY, femaleWidth, femaleHeight);
        
        svg.append("path")
            .attr("class", "pencil female-pencil")
            .attr("d", femalePencil.mainPath)
            .attr("fill", colors.female)
            .attr("opacity", 0.9)
            .on("mouseover", function() {
                d3.select(this).attr("opacity", 1);
                
                svg.append("text")
                    .attr("class", "value-label")
                    .attr("x", femaleX + femaleWidth / 2)
                    .attr("y", femaleY - 10)
                    .attr("text-anchor", "middle")
                    .text(d.female);
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 0.9);
                svg.selectAll(".value-label").remove();
            });
            
        // Add the line between pencil tip and body for female pencil
        svg.append("line")
            .attr("x1", femalePencil.tipLine.x1)
            .attr("y1", femalePencil.tipLine.y1)
            .attr("x2", femalePencil.tipLine.x2)
            .attr("y2", femalePencil.tipLine.y2)
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);
    });
}

document.addEventListener('DOMContentLoaded', createVisualization);