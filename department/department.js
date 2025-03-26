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
        
        renderBarChart(topDepartments);
        
    } catch (error) {
        console.error('Error loading or processing data:', error);
        document.getElementById('chart').innerHTML = `
            <p style="color: red; text-align: center;">
                Error loading data: ${error.message}
            </p>`;
    }
}

// Function to render the grouped bar chart
function renderBarChart(data) {
    document.getElementById('chart').innerHTML = '';
    
    const margin = { top: 50, right: 30, bottom: 120, left: 80 };
    const width = Math.max(800, data.length * 100) - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
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
    
    data.forEach(d => {
        svg.append("rect")
            .attr("class", "bar male-bar")
            .attr("x", x0(d.department) + x1("male"))
            .attr("y", y(d.male))
            .attr("width", x1.bandwidth())
            .attr("height", height - y(d.male))
            .attr("fill", colors.male)
            .attr("opacity", 0.9)
            .on("mouseover", function(event) {
                d3.select(this).attr("opacity", 1);
                
                svg.append("text")
                    .attr("class", "value-label")
                    .attr("x", x0(d.department) + x1("male") + x1.bandwidth() / 2)
                    .attr("y", y(d.male) - 5)
                    .attr("text-anchor", "middle")
                    .text(d.male);
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 0.9);
                svg.selectAll(".value-label").remove();
            });
        
        svg.append("rect")
            .attr("class", "bar female-bar")
            .attr("x", x0(d.department) + x1("female"))
            .attr("y", y(d.female))
            .attr("width", x1.bandwidth())
            .attr("height", height - y(d.female))
            .attr("fill", colors.female)
            .attr("opacity", 0.9)
            .on("mouseover", function(event) {
                d3.select(this).attr("opacity", 1);
                
                svg.append("text")
                    .attr("class", "value-label")
                    .attr("x", x0(d.department) + x1("female") + x1.bandwidth() / 2)
                    .attr("y", y(d.female) - 5)
                    .attr("text-anchor", "middle")
                    .text(d.female);
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 0.9);
                svg.selectAll(".value-label").remove();
            });
    });
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Gender Distribution Across Top 10 MoMA Departments");
}

document.addEventListener('DOMContentLoaded', createVisualization);
