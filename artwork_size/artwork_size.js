// Main function to create the box plot
function createBoxPlot(data) {
    // Set up the dimensions for the visualization
    const margin = { top: 60, right: 50, bottom: 80, left: 90 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    // Clear any existing SVG
    d3.select("#boxplot-chart").html("");
  
    // Create the SVG element
    const svg = d3.select("#boxplot-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Filter data to include only male and female
    const filteredData = data.filter(d => d.gender === 'male' || d.gender === 'female');
    
    // Use only male and female categories
    const genders = ['female', 'male']; // Put female first to match the reference image
  
    // Create scales
    const xScale = d3.scaleBand()
      .domain(genders)
      .range([0, width])
      .padding(0.4);
  
    // Set the min and max area for y-scale
    // Using 1 as the minimum for the log scale (can't use 0 with log scale)
    const minArea = 1; // Start at 1 square cm
    const maxArea = Math.max(10000000, d3.max(filteredData, d => d.area) * 2); // Ensure we go up to at least 10^7
    
    // Use a log scale for better visualization of large range values
    const yScale = d3.scaleLog()
      .domain([minArea, maxArea]) // Full range from 1 to 10^7
      .range([height, 0])
      .nice();
  
    // Add horizontal grid lines for every tick
    yScale.ticks().forEach(d => {
      svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(d))
        .attr("y2", yScale(d))
    });
  
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("text-anchor", "middle");
  
    // Format y-axis with consistent scientific notation
    const formatAxis = d => {
      if (d === 1) {
        return "1";
      } else {
        const power = Math.log10(d);
        return `1e+${power.toFixed(0)}`;
      }
    };
  
    // Add Y axis with log scale notation
    svg.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(formatAxis)
        .tickValues([1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]) // Log scale tick values - standard powers of 10
      )
      .selectAll("text")
      .style("font-size", "12px");
  
    // Add X axis label
    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .style("font-size", "16px")
      .text("Gender");
  
    // Add Y axis label
    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .style("font-size", "16px")
      .text("Area (sq cm, log scale)");
  
    // Define color scheme - black for boxes, points
    const boxColor = "#333333";
    const pointColors = {
        'male': "#5f4c73",   // Dark purple for male
        'female': "#ed944d"  // Orange for female
      };
    
    // Calculate statistics for each gender using the provided arbitrary values
    const stats = {
        'male': {
          min: 0.3,
          max: 10033711.2,
          median: 696.9,
          mean: 2718.150,
          q1: 347.115,
          q3: 1898.392,
          iqr: 1898.392 - 347.115,
          lowerBound: 27.13967,
          upperBound: 24280.344
        },
        'female': {
          min: 1.6,
          max: 6000000,
          median: 870.25,
          mean: 7073.337,
          q1: 397.79,
          q3: 2423.272,
          iqr: 2423.272 - 397.79,
          lowerBound: 26.45643,
          upperBound: 36435.507
        }
    };
    
    // Add whisker endpoints based on the arbitrary bounds
    genders.forEach(gender => {
      const genderData = filteredData.filter(d => d.gender === gender)
        .map(d => d.area)
        .filter(d => d >= 1); // Ensure values are at least 1 for log scale
      
      // Sort the data for finding whisker endpoints
      const sortedData = genderData.sort((a, b) => a - b);
      
      // Find the whisker endpoints (non-outlier min and max)
      // Lower whisker is the smallest data point >= lowerBound
      // Upper whisker is the largest data point <= upperBound
      const lowerWhisker = sortedData.find(d => d >= stats[gender].lowerBound) || Math.max(1, stats[gender].min);
      const upperWhisker = [...sortedData].reverse().find(d => d <= stats[gender].upperBound) || stats[gender].upperBound;
      
      // Store the outliers (data points beyond the specified bounds)
      const outliers = genderData.filter(d => 
        d < stats[gender].lowerBound || d > stats[gender].upperBound
      );
      
      // Log counts of outliers
      const lowOutliers = genderData.filter(d => d < stats[gender].lowerBound);
      const highOutliers = genderData.filter(d => d > stats[gender].upperBound);
      
      console.log(`${gender} outliers based on arbitrary bounds:`);
      console.log(`- Below ${stats[gender].lowerBound}: ${lowOutliers.length}`);
      console.log(`- Above ${stats[gender].upperBound}: ${highOutliers.length}`);
      console.log(`- Lower whisker: ${lowerWhisker}`);
      console.log(`- Upper whisker: ${upperWhisker}`);
      
      // Add the whisker endpoints and outliers to the stats object
      stats[gender].lowerWhisker = lowerWhisker;
      stats[gender].upperWhisker = upperWhisker;
      stats[gender].outliers = outliers;
      stats[gender].totalCount = genderData.length;
    });
  
    // Draw box plots for each gender
    genders.forEach(gender => {
      const stat = stats[gender];
      if (!stat) return; // Skip if no data
      
      const boxWidth = xScale.bandwidth();
      const center = xScale(gender) + boxWidth / 2;
      
      // Draw the box (IQR) - make it thinner for cleaner appearance
      svg.append("rect")
        .attr("x", xScale(gender))
        .attr("y", yScale(stat.q3))
        .attr("width", boxWidth)
        .attr("height", yScale(stat.q1) - yScale(stat.q3))
        .attr("fill", "white")
        .attr("stroke", boxColor)
        .attr("stroke-width", 1.5);
      
      // Draw the median line
      svg.append("line")
        .attr("x1", xScale(gender))
        .attr("x2", xScale(gender) + boxWidth)
        .attr("y1", yScale(stat.median))
        .attr("y2", yScale(stat.median))
        .attr("stroke", pointColors[gender])
        .attr("stroke-width", 2);
        
      // Add median value label
      svg.append("text")
        .attr("x", xScale(gender) + boxWidth + 5) // Position it to the right of the box
        .attr("y", yScale(stat.median))
        .attr("dy", "0.35em") // Vertical centering adjustment
        .attr("text-anchor", "start")
        .attr("fill", pointColors[gender])
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(`${stat.median.toFixed(1)}`);

      // Draw the mean line as a dashed line
      svg.append("line")
      .attr("x1", xScale(gender))
      .attr("x2", xScale(gender) + boxWidth)
      .attr("y1", yScale(stat.mean))
      .attr("y2", yScale(stat.mean))
      .attr("stroke", pointColors[gender])
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,3"); // Create a dashed line
      
        // Add mean value label
        svg.append("text")
        .attr("x", xScale(gender) - 5) // Position it to the left of the box
        .attr("y", yScale(stat.mean))
        .attr("dy", "0.35em") // Vertical centering adjustment
        .attr("text-anchor", "end")
        .attr("fill", pointColors[gender])
        .attr("font-size", "11px")
        .text(`Mean: ${stat.mean.toFixed(1)}`);
      
      // Draw the whiskers (lines from lowerWhisker to q1 and q3 to upperWhisker)
      // Check for valid values before drawing to avoid NaN errors
      if (isFinite(stat.lowerWhisker) && isFinite(stat.q1)) {
        // Lower whisker
        svg.append("line")
          .attr("x1", center)
          .attr("x2", center)
          .attr("y1", yScale(stat.lowerWhisker))
          .attr("y2", yScale(stat.q1))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1);
      }
      
      if (isFinite(stat.q3) && isFinite(stat.upperWhisker)) {
        // Upper whisker
        svg.append("line")
          .attr("x1", center)
          .attr("x2", center)
          .attr("y1", yScale(stat.q3))
          .attr("y2", yScale(stat.upperWhisker))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1);
      }
      
      // Draw horizontal caps on the whiskers
      const capWidth = boxWidth / 2;
      
      // Lower whisker cap - only if lowerWhisker is valid
      if (isFinite(stat.lowerWhisker)) {
        svg.append("line")
          .attr("x1", center - capWidth / 2)
          .attr("x2", center + capWidth / 2)
          .attr("y1", yScale(stat.lowerWhisker))
          .attr("y2", yScale(stat.lowerWhisker))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1.5);
      }
      
      // Upper whisker cap - only if upperWhisker is valid
      if (isFinite(stat.upperWhisker)) {
        svg.append("line")
          .attr("x1", center - capWidth / 2)
          .attr("x2", center + capWidth / 2)
          .attr("y1", yScale(stat.upperWhisker))
          .attr("y2", yScale(stat.upperWhisker))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1.5);
      }
      
      // Draw outliers as circles
      stat.outliers.forEach(d => {
        // Skip invalid values that would cause NaN errors with the log scale
        if (d <= 0) return;
        
        // For large datasets, sample the outliers to prevent overcrowding
        // Always show more of the small outliers to match reference image 
        if (d > 100 && stat.outliers.length > 500 && Math.random() > 0.3) return;
        
        // For outliers in different ranges, adjust the jittering
        let jitterAmount;
        let dotSize;
        
        if (d < 100) {
          // Small outliers - more spread to be visible
          jitterAmount = 0.3;
          dotSize = 2;
        } else if (d > 100000) {
          // Large outliers
          jitterAmount = 0.25;
          dotSize = 2;
        } else {
          // Medium outliers
          jitterAmount = 0.2;
          dotSize = 2;
        }
        
        svg.append("circle")
          .attr("cx", center + (Math.random() * jitterAmount * 2 - jitterAmount) * boxWidth) // Add jittering
          .attr("cy", yScale(d))
          .attr("r", dotSize)
          .attr("fill", pointColors[gender])
          .attr("opacity", 0.7);
      });
    });
  
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Distribution of Artwork Area by Gender (Log Scale)");
  }
  
  // Function to load and process the actual MoMA CSV data
  function loadRealData(csvFilePath) {
    return new Promise((resolve, reject) => {
      d3.csv(csvFilePath)
        .then(data => {
          console.log("CSV loaded successfully with", data.length, "rows");
          // Process the data
          const processedData = data
            .filter(d => {
              // Filter out rows with missing data and keep only male and female
              return d["Height (cm)"] && 
                     d["Width (cm)"] && 
                     d["Gender.y"] &&
                     (d["Gender.y"].toLowerCase() === 'male' || d["Gender.y"].toLowerCase() === 'female') &&
                     !isNaN(parseFloat(d["Height (cm)"])) && 
                     !isNaN(parseFloat(d["Width (cm)"]));
            })
            .map(d => {
              // Convert to appropriate data structure
              const height = Math.max(1, parseFloat(d["Height (cm)"])); // Ensure at least 1
              const width = Math.max(1, parseFloat(d["Width (cm)"]));   // Ensure at least 1
              const area = height * width;
              
              return {
                gender: d["Gender.y"].toLowerCase(), // Normalize to lowercase for consistency
                height: height,
                width: width,
                area: area,
                title: d["Title"] || "",
                artist: d["Artist"] || "",
                date: d["Date"] || ""
              };
            });
            
          // Log some information about the data
          console.log("Data processing complete:");
          console.log("- Total valid records:", processedData.length);
          
          // Find and log extremely small areas
          const tinyAreas = processedData.filter(d => d.area < 5);
          console.log("- Records with area < 5 sq cm:", tinyAreas.length);
          if (tinyAreas.length > 0) {
            console.log("- Sample of tiny artworks:", tinyAreas.slice(0, 5));
          }
            
          resolve(processedData);
        })
        .catch(error => {
          console.error("Error loading CSV:", error);
          reject(error);
        });
    });
  }
  
  // Initialize the visualization when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    // Load the real data
    loadRealData('../MoMA_merged_final.csv')
      .then(data => {
        createBoxPlot(data);
      })
      .catch(error => {
        console.error('Failed to load real data:', error);
        document.getElementById("boxplot-chart").innerHTML = 
          "<p>Error loading data. Please check the console for details.</p>";
      });
  });
