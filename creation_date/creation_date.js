document.addEventListener('DOMContentLoaded', function() {
    const margin = { top: 40, right: 80, bottom: 60, left: 80 };
    const width = 1100 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
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
    
    d3.csv('../MoMA_merged_final.csv').then(function(data) {
        function extractYear(dateString) {
            if (!dateString) return null;
            // Try to extract a 4-digit year
            const yearMatch = dateString.match(/\b(1\d{3}|20\d{2})\b/);
            return yearMatch ? parseInt(yearMatch[0]) : null;
        }
        
        const countsByYearAndGender = {};
        
        data.forEach(row => {
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
        
        updateVisualization(yearlyData);
                
        function updateVisualization(data) {
            svg.selectAll('*').remove();
            
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
                .text('Year of Artwork Creation');
            
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', -50)
                .style('font-size', '14px')
                .text('Number of Artworks');
            
            const maleLine = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.male))
                .curve(d3.curveMonotoneX);
            
            const femaleLine = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.female))
                .curve(d3.curveMonotoneX);
            
            svg.append('path')
                .datum(data)
                .attr('class', 'male-line')
                .attr('d', maleLine)
                .attr('fill', 'none');
            
            svg.append('path')
                .datum(data)
                .attr('class', 'female-line')
                .attr('d', femaleLine)
                .attr('fill', 'none');
            
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
                        Female Artists: ${d.female}<br>
                        Total: ${d.total}`;
                    
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
            
            svg.selectAll('.female-point')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'female-point')
                .attr('cx', d => xScale(d.year))
                .attr('cy', d => yScale(d.female))
                .attr('r', 3)
                .attr('fill', '#ed944d')
                .style('opacity', 0) // Hide by default
                .on('mouseover', function(event, d) {
                    d3.select(this).style('opacity', 1);
                    
                    const tooltipContent = `<strong>Year: ${d.year}</strong><br>
                        Male Artists: ${d.male}<br>
                        Female Artists: ${d.female}<br>
                        Total: ${d.total}`;
                    
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
        }
    }).catch(function(error) {
        console.log('Error loading or processing data:', error);
        d3.select('#visualization')
            .append('div')
            .style('color', 'red')
            .style('text-align', 'center')
            .style('padding', '50px')
            .html(`<h3>Error Loading Data</h3><p>Please make sure the file 'MoMA_merged_final.csv' is in the same folder as this HTML file.</p><p>Technical details: ${error.message}</p>`);
    });
});
