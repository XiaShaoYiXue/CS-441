document.addEventListener('DOMContentLoaded', function() {
    let isUsingRealData = true;
    
    function extractYear(dateString) {
        if (!dateString) return null;
        const yearMatch = dateString.match(/\b(1\d{3}|20\d{2})\b/);
        return yearMatch ? parseInt(yearMatch[0]) : null;
    }
    
    const sampleData = [
        { year: 1900, male: 20, female: 2 },
        { year: 1910, male: 42, female: 5 },
        { year: 1920, male: 98, female: 12 },
        { year: 1930, male: 223, female: 25 },
        { year: 1940, male: 475, female: 48 },
        { year: 1950, male: 782, female: 67 },
        { year: 1960, male: 1245, female: 89 },
        { year: 1971, male: 3358, female: 183 },
        { year: 1980, male: 1876, female: 234 },
        { year: 1990, male: 912, female: 178 },
        { year: 2000, male: 432, female: 125 },
        { year: 2010, male: 223, female: 76 },
        { year: 2020, male: 117, female: 50 }
    ];
    
    loadData();
    
    function loadData() {
        d3.csv('../MoMA_merged_final.csv')
            .then(function(data) {
                processData(data);
                isUsingRealData = true;
            })
            .catch(function(error) {
                console.warn('Error loading CSV:', error);
                console.log('Falling back to sample data');
                setupVisualization(sampleData);
                isUsingRealData = false;
            });
    }
    
    function processData(rawData) {
        const countsByYearAndGender = {};
        
        rawData.forEach(row => {
            const year = extractYear(row.Date);
            const gender = row['Gender.y'];
            
            if (year && gender && year >= 1800 && year <= 2020) {
                if (!countsByYearAndGender[year]) {
                    countsByYearAndGender[year] = { male: 0, female: 0 };
                }
                
                if (gender.toLowerCase() === 'male') {
                    countsByYearAndGender[year].male += 1;
                } else if (gender.toLowerCase() === 'female') {
                    countsByYearAndGender[year].female += 1;
                }
            }
        });
        
        let yearlyData = Object.entries(countsByYearAndGender).map(([year, counts]) => ({
            year: parseInt(year),
            male: counts.male,
            female: counts.female,
            total: counts.male + counts.female
        }));
        
        yearlyData = yearlyData.filter(d => d.total >= 5);
        
        yearlyData.sort((a, b) => a.year - b.year);
        
        setupVisualization(yearlyData);
    }
    
    function setupVisualization(data) {
        const container = document.getElementById('visualization');
        const containerWidth = container.clientWidth;
        
        const margin = { top: 40, right: 40, bottom: 60, left: 80 };
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        
        d3.select('#visualization').html('');
        
        const svg = d3.select('#visualization')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);
        
        const maxCount = d3.max(data, d => Math.max(d.male, d.female));
        const yScale = d3.scaleLinear()
            .domain([0, maxCount * 1.1]) 
            .range([height, 0]);
        
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format('d')); 
        
        const yAxis = d3.axisLeft(yScale);
        
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);
        
        svg.append('g')
            .attr('class', 'axis')
            .call(yAxis);
        
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .style('font-size', '14px')
            .attr('fill', 'white')
            .text('Year of Artwork Creation');
        
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -50)
            .style('font-size', '14px')
            .attr('fill', 'white')
            .text('Number of Artworks');
        
        const maleLine = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.male))
            .curve(d3.curveMonotoneX);
        
        svg.append('path')
            .datum(data)
            .attr('class', 'male-line')
            .attr('d', maleLine)
            .attr('fill', 'none');
        
        const femaleLine = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.female))
            .curve(d3.curveMonotoneX);
        
        const femaleLinePath = svg.append('path')
            .datum(data)
            .attr('class', 'female-line')
            .attr('d', femaleLine)
            .attr('fill', 'none')
            .style('opacity', 0);
        
        svg.selectAll('.male-point')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'male-point')
            .attr('cx', d => xScale(d.year))
            .attr('cy', d => yScale(d.male))
            .attr('r', 3)
            .attr('fill', '#5f4c73')
            .style('opacity', 0)
            .on('mouseover', function(event, d) {
                d3.select(this).style('opacity', 1);
                
                const tooltipContent = `<strong>Year: ${d.year}</strong><br>
                    Male Artists: ${d.male}<br>
                    Female Artists: ${isRevealMode ? d.female : '?'}<br>
                    Total: ${d.male + (isRevealMode ? d.female : 0)}`;
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip.html(tooltipContent)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).style('opacity', 0);
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
        
        let isDrawing = false;
        let isRevealMode = false;
        let userDrawingPoints = [];
        
        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveMonotoneX);
            
        const userLine = svg.append('path')
            .attr('class', 'user-line')
            .attr('fill', 'none')
            .attr('stroke', '#3498db')
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '5,5');
            
        const drawingArea = svg.append('rect')
            .attr('class', 'drawing-area')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair');
            
        drawingArea.on('mousedown', function(event) {
            if (!isRevealMode) {
                isDrawing = true;
                userDrawingPoints = [];
                
                const coords = d3.pointer(event);
                userDrawingPoints.push({x: coords[0], y: coords[1]});
                
                userLine.attr('d', lineGenerator(userDrawingPoints));
            }
        });
        
        drawingArea.on('mousemove', function(event) {
            if (isDrawing && !isRevealMode) {
                const coords = d3.pointer(event);
                userDrawingPoints.push({x: coords[0], y: coords[1]});
                
                userLine.attr('d', lineGenerator(userDrawingPoints));
            }
        });
        
        drawingArea.on('mouseup', function() {
            if (isDrawing && !isRevealMode) {
                isDrawing = false;
                document.getElementById('revealBtn').disabled = userDrawingPoints.length === 0;
            }
        });
        
        drawingArea.on('mouseleave', function() {
            if (isDrawing && !isRevealMode) {
                isDrawing = false;
                document.getElementById('revealBtn').disabled = userDrawingPoints.length === 0;
            }
        });
        
        drawingArea.on('touchstart', function(event) {
            if (!isRevealMode) {
                event.preventDefault();
                isDrawing = true;
                userDrawingPoints = [];
                
                const touch = event.touches[0];
                const svgElement = document.querySelector('#visualization svg');
                const svgRect = svgElement.getBoundingClientRect();
                const x = touch.clientX - svgRect.left - margin.left;
                const y = touch.clientY - svgRect.top - margin.top;
                
                userDrawingPoints.push({x: x, y: y});
                userLine.attr('d', lineGenerator(userDrawingPoints));
            }
        });
        
        drawingArea.on('touchmove', function(event) {
            if (isDrawing && !isRevealMode) {
                event.preventDefault();
                
                const touch = event.touches[0];
                const svgElement = document.querySelector('#visualization svg');
                const svgRect = svgElement.getBoundingClientRect();
                const x = touch.clientX - svgRect.left - margin.left;
                const y = touch.clientY - svgRect.top - margin.top;
                
                userDrawingPoints.push({x: x, y: y});
                
                userLine.attr('d', lineGenerator(userDrawingPoints));
            }
        });
        
        drawingArea.on('touchend', function() {
            if (isDrawing && !isRevealMode) {
                isDrawing = false;
                document.getElementById('revealBtn').disabled = userDrawingPoints.length === 0;
            }
        });
        
        document.getElementById('resetBtn').addEventListener('click', function() {
            userDrawingPoints = [];
            userLine.attr('d', "");
            
            if (isRevealMode) {
                isDrawing = false;
                
                drawingArea.on('mousedown', function(event) {
                    isDrawing = true;
                    userDrawingPoints = [];
                    
                    const coords = d3.pointer(event);
                    userDrawingPoints.push({x: coords[0], y: coords[1]});
                    
                    userLine.attr('d', lineGenerator(userDrawingPoints));
                });
                
                drawingArea.on('mousemove', function(event) {
                    if (isDrawing) {
                        const coords = d3.pointer(event);
                        userDrawingPoints.push({x: coords[0], y: coords[1]});
                        
                        userLine.attr('d', lineGenerator(userDrawingPoints));
                    }
                });
                
                drawingArea.on('mouseup', function() {
                    if (isDrawing) {
                        isDrawing = false;
                    }
                });
                
                drawingArea.on('mouseleave', function() {
                    if (isDrawing) {
                        isDrawing = false;
                    }
                });
            } else {
                document.getElementById('revealBtn').disabled = true;
            }
            
            if (document.getElementById('accuracyFeedback')) {
                document.getElementById('accuracyFeedback').classList.remove('visible');
            }
        });
        
        document.getElementById('revealBtn').addEventListener('click', function() {
            isRevealMode = true;
            document.querySelector('.female-legend').style.display = 'flex';
            
            femaleLinePath.transition()
                .duration(1000)
                .style('opacity', 1);
            
            svg.selectAll('.female-point')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'female-point')
                .attr('cx', d => xScale(d.year))
                .attr('cy', d => yScale(d.female))
                .attr('r', 3)
                .attr('fill', '#ed944d')
                .style('opacity', 0)
                .on('mouseover', function(event, d) {
                    d3.select(this).style('opacity', 1);
                    
                    const tooltipContent = `<strong>Year: ${d.year}</strong><br>
                        Male Artists: ${d.male}<br>
                        Female Artists: ${d.female}<br>
                        Total: ${d.male + d.female}`;
                    
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    tooltip.html(tooltipContent)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this).style('opacity', 0);
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        });
        
        window.addEventListener('resize', function() {
        });
    }
});
