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
        
        let formattedData = Object.entries(departmentGenderCounts)
            .filter(([department]) => {
                
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
            <p style="color: white; text-align: center;">
                Error loading data: ${error.message}
            </p>`;
    }
}

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
        .domain([0, maxCount > 0 ? maxCount : 100]) 
        .nice()
        .range([height, 0]);
    
    const colors = {
        male: "#5f4c73",
        female: "#ed944d"
    };
    
    // X-axis with white text
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "axis")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("fill", "white");
    
    // Y-axis with white text
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "white");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20)
        .attr("fill", "white")
        .text("Department");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("fill", "white")
        .text("Number of Artworks");
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("Gender Distribution Across MoMA Departments");
    
    const defs = svg.append("defs");
    
    const malePencil = defs.append("pattern")
        .attr("id", "malePencil")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", x1.bandwidth())
        .attr("height", 20);
    
    malePencil.append("rect")
        .attr("width", x1.bandwidth())
        .attr("height", 20)
        .attr("fill", colors.male);
    
    malePencil.append("path")
        .attr("d", `M0,0 L${x1.bandwidth()},0 L${x1.bandwidth()},20 L0,20 Z`)
        .attr("fill", "url(#maleGradient)");
    
    const femalePencil = defs.append("pattern")
        .attr("id", "femalePencil")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", x1.bandwidth())
        .attr("height", 20);
    
    femalePencil.append("rect")
        .attr("width", x1.bandwidth())
        .attr("height", 20)
        .attr("fill", colors.female);
    
    femalePencil.append("path")
        .attr("d", `M0,0 L${x1.bandwidth()},0 L${x1.bandwidth()},20 L0,20 Z`)
        .attr("fill", "url(#femaleGradient)");
    
    function createPaintbrushPath(x, y, width, height) {

        const tipHeight = Math.min(30, height * 0.15); 
        const eraserHeight = Math.min(15, height * 0.08); 
        const bodyHeight = height - tipHeight - eraserHeight; 
        const pencilWidth = width; 
        
        const leftX = x;
        const rightX = x + pencilWidth;
        const midX = x + (pencilWidth / 2);
        
        
        const waveSegments = 4; 
        const waveHeight = tipHeight * 0.4; 
        const waveWidth = pencilWidth / waveSegments;
        
        let wavyLine = `M${leftX},${y + tipHeight} `;
        for (let i = 1; i <= waveSegments; i++) {
            const waveX = leftX + (i * waveWidth);
            const waveY = (y + tipHeight) + (i % 2 === 0 ? 0 : waveHeight);
            wavyLine += `L${waveX},${waveY} `;
        }

        const bodyPath = 
            `M${leftX},${y + tipHeight} ` +
            `L${leftX},${y + tipHeight + bodyHeight} ` +
            `L${rightX},${y + tipHeight + bodyHeight} ` +
            `L${rightX},${y + tipHeight} ` +
            `Z`;
            
        const tipPath = 
            `M${midX},${y} ` +
            `L${leftX},${y + tipHeight} ` +
            `L${rightX},${y + tipHeight} ` +
            `Z`;
            
        const eraserPath = 
            `M${leftX - 1},${y + tipHeight + bodyHeight} ` +
            `L${leftX - 1},${y + tipHeight + bodyHeight + eraserHeight} ` +
            `L${rightX + 1},${y + tipHeight + bodyHeight + eraserHeight} ` +
            `L${rightX + 1},${y + tipHeight + bodyHeight} ` +
            `Z`;
        
        return {
            bodyPath: bodyPath,
            tipPath: tipPath,
            eraserPath: eraserPath,
            wavyTopLine: wavyLine,
            tipLine: {
                x1: leftX,
                y1: y + tipHeight,
                x2: rightX,
                y2: y + tipHeight
            },
            
            eraserLine: {
                x1: leftX - 1,
                y1: y + tipHeight + bodyHeight,
                x2: rightX + 1,
                y2: y + tipHeight + bodyHeight
            }
        };
    }
    
    data.forEach((d, i) => {
        
        const maleX = x0(d.department) + x1("male");
        const maleHeight = height - y(d.male);
        const maleY = y(d.male);
        const maleWidth = x1.bandwidth();
        
        const malePencil = createPaintbrushPath(maleX, maleY, maleWidth, maleHeight);
        
        // Set initial height to 0 for animation
        const initialMalePencil = createPaintbrushPath(maleX, height, maleWidth, 0);
        
        svg.append("path")
            .attr("class", "pencil male-pencil body")
            .attr("d", initialMalePencil.bodyPath) // Start with height 0
            .attr("fill", colors.male)
            .attr("opacity", 0.9)
            .transition() // Add transition
            .duration(1000) // 1 second animation
            .delay(i * 100) // Stagger by index instead of department name
            .attr("d", malePencil.bodyPath) // Animate to full height
            .on("end", function() {
                // Add hover events after animation completes
                d3.select(this)
                    .on("mouseover", function() {
                        d3.select(this).attr("opacity", 1);
                        d3.selectAll(".male-pencil").attr("opacity", 1);
                        
                        svg.append("text")
                            .attr("class", "value-label")
                            .attr("x", maleX + maleWidth / 2)
                            .attr("y", maleY - 10)
                            .attr("text-anchor", "middle")
                            .attr("fill", "white")
                            .text(d.male);
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("opacity", 0.9);
                        d3.selectAll(".male-pencil.tip, .male-pencil.eraser").attr("opacity", 0.7);
                        svg.selectAll(".value-label").remove();
                    });
            });
            
        svg.append("path")
            .attr("class", "pencil male-pencil tip")
            .attr("d", initialMalePencil.tipPath)
            .attr("fill", colors.male)
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(1000)
            .delay(i * 100 + 800) // Show after body grows
            .attr("d", malePencil.tipPath)
            .attr("opacity", 1);
            
        svg.append("path")
            .attr("class", "pencil male-pencil eraser")
            .attr("d", initialMalePencil.eraserPath)
            .attr("fill", colors.male)
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(1000)
            .delay(i * 100 + 800) // Show after body grows
            .attr("d", malePencil.eraserPath)
            .attr("opacity", 0.7);
            
        svg.append("path")
            .attr("d", initialMalePencil.wavyTopLine)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(500)
            .delay(i * 100 + 800) // Show after body grows
            .attr("d", malePencil.wavyTopLine)
            .attr("opacity", 1);
            
        svg.append("line")
            .attr("x1", initialMalePencil.eraserLine.x1)
            .attr("y1", initialMalePencil.eraserLine.y1)
            .attr("x2", initialMalePencil.eraserLine.x2)
            .attr("y2", initialMalePencil.eraserLine.y2)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(500)
            .delay(i * 100 + 800) // Show after body grows
            .attr("x1", malePencil.eraserLine.x1)
            .attr("y1", malePencil.eraserLine.y1)
            .attr("x2", malePencil.eraserLine.x2)
            .attr("y2", malePencil.eraserLine.y2)
            .attr("opacity", 0.7);
        
        const femaleX = x0(d.department) + x1("female");
        const femaleHeight = height - y(d.female);
        const femaleY = y(d.female);
        const femaleWidth = x1.bandwidth();
        
        const femalePencil = createPaintbrushPath(femaleX, femaleY, femaleWidth, femaleHeight);
        
        // Set initial height to 0 for animation
        const initialFemalePencil = createPaintbrushPath(femaleX, height, femaleWidth, 0);
        
        svg.append("path")
            .attr("class", "pencil female-pencil body")
            .attr("d", initialFemalePencil.bodyPath) // Start with height 0
            .attr("fill", colors.female)
            .attr("opacity", 0.9)
            .transition() // Add transition
            .duration(1000) // 1 second animation
            .delay(i * 100 + 200) // Slightly after male bars
            .attr("d", femalePencil.bodyPath) // Animate to full height
            .on("end", function() {
                // Add hover events after animation completes
                d3.select(this)
                    .on("mouseover", function() {
                        d3.select(this).attr("opacity", 1);
                        d3.selectAll(".female-pencil").attr("opacity", 1);
                        
                        svg.append("text")
                            .attr("class", "value-label")
                            .attr("x", femaleX + femaleWidth / 2)
                            .attr("y", femaleY - 10)
                            .attr("text-anchor", "middle")
                            .attr("fill", "white")
                            .text(d.female);
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("opacity", 0.9);
                        d3.selectAll(".female-pencil.tip, .female-pencil.eraser").attr("opacity", 0.7);
                        svg.selectAll(".value-label").remove();
                    });
            });
            
        svg.append("path")
            .attr("class", "pencil female-pencil tip")
            .attr("d", initialFemalePencil.tipPath)
            .attr("fill", colors.female)
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(1000)
            .delay(i * 100 + 1000) // Show after body grows
            .attr("d", femalePencil.tipPath)
            .attr("opacity", 1);
            
        svg.append("path")
            .attr("class", "pencil female-pencil eraser")
            .attr("d", initialFemalePencil.eraserPath)
            .attr("fill", colors.female)
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(1000)
            .delay(i * 100 + 1000) // Show after body grows
            .attr("d", femalePencil.eraserPath)
            .attr("opacity", 0.7);
            
        svg.append("path")
            .attr("d", initialFemalePencil.wavyTopLine)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(500)
            .delay(i * 100 + 1000) // Show after body grows
            .attr("d", femalePencil.wavyTopLine)
            .attr("opacity", 1);
            
        svg.append("line")
            .attr("x1", initialFemalePencil.eraserLine.x1)
            .attr("y1", initialFemalePencil.eraserLine.y1)
            .attr("x2", initialFemalePencil.eraserLine.x2)
            .attr("y2", initialFemalePencil.eraserLine.y2)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0) // Start invisible
            .transition()
            .duration(500)
            .delay(i * 100 + 1000) // Show after body grows
            .attr("x1", femalePencil.eraserLine.x1)
            .attr("y1", femalePencil.eraserLine.y1)
            .attr("x2", femalePencil.eraserLine.x2)
            .attr("y2", femalePencil.eraserLine.y2)
            .attr("opacity", 0.7);
    });
}

document.addEventListener('DOMContentLoaded', createVisualization);
