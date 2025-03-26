function createBoxPlot(data) {
    
    const margin = { top: 60, right: 50, bottom: 80, left: 90 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    d3.select("#boxplot-chart").html("");
  
    const svg = d3.select("#boxplot-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const filteredData = data.filter(d => d.gender === 'male' || d.gender === 'female');
    
    const genders = ['female', 'male']; // Put female first to match the reference image
  
    const xScale = d3.scaleBand()
      .domain(genders)
      .range([0, width])
      .padding(0.4);
  
    const minArea = 1; // Start at 1 square cm
    const maxArea = Math.max(10000000, d3.max(filteredData, d => d.area) * 2);
    
    const yScale = d3.scaleLog()
      .domain([minArea, maxArea]) // Full range from 1 to 10^7
      .range([height, 0])
      .nice();
  
    yScale.ticks().forEach(d => {
      svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(d))
        .attr("y2", yScale(d))
    });
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("text-anchor", "middle");
  
    const formatAxis = d => {
      if (d === 1) {
        return "1";
      } else {
        const power = Math.log10(d);
        return `1e+${power.toFixed(0)}`;
      }
    };
  
    svg.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(formatAxis)
        .tickValues([1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]) 
      )
      .selectAll("text")
      .style("font-size", "12px");
  
    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .style("font-size", "16px")
      .text("Gender");
  
    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .style("font-size", "16px")
      .text("Area (sq cm, log scale)");
  
    const boxColor = "#333333";
    const pointColors = {
        'male': "#5f4c73",  
        'female': "#ed944d"  
      };
    
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
    
    genders.forEach(gender => {
      const genderData = filteredData.filter(d => d.gender === gender)
        .map(d => d.area)
        .filter(d => d >= 1); 
      
      const sortedData = genderData.sort((a, b) => a - b);
      
      const lowerWhisker = sortedData.find(d => d >= stats[gender].lowerBound) || Math.max(1, stats[gender].min);
      const upperWhisker = [...sortedData].reverse().find(d => d <= stats[gender].upperBound) || stats[gender].upperBound;
      
      const outliers = genderData.filter(d => 
        d < stats[gender].lowerBound || d > stats[gender].upperBound
      );
      
      const lowOutliers = genderData.filter(d => d < stats[gender].lowerBound);
      const highOutliers = genderData.filter(d => d > stats[gender].upperBound);
      
      console.log(`${gender} outliers based on arbitrary bounds:`);
      console.log(`- Below ${stats[gender].lowerBound}: ${lowOutliers.length}`);
      console.log(`- Above ${stats[gender].upperBound}: ${highOutliers.length}`);
      console.log(`- Lower whisker: ${lowerWhisker}`);
      console.log(`- Upper whisker: ${upperWhisker}`);
      
      stats[gender].lowerWhisker = lowerWhisker;
      stats[gender].upperWhisker = upperWhisker;
      stats[gender].outliers = outliers;
      stats[gender].totalCount = genderData.length;
    });
  
    genders.forEach(gender => {
      const stat = stats[gender];
      if (!stat) return; 
      
      const boxWidth = xScale.bandwidth();
      const center = xScale(gender) + boxWidth / 2;
      
      svg.append("rect")
        .attr("x", xScale(gender))
        .attr("y", yScale(stat.q3))
        .attr("width", boxWidth)
        .attr("height", yScale(stat.q1) - yScale(stat.q3))
        .attr("fill", "white")
        .attr("stroke", boxColor)
        .attr("stroke-width", 1.5);
      
      svg.append("line")
        .attr("x1", xScale(gender))
        .attr("x2", xScale(gender) + boxWidth)
        .attr("y1", yScale(stat.median))
        .attr("y2", yScale(stat.median))
        .attr("stroke", pointColors[gender])
        .attr("stroke-width", 2);
        
      svg.append("text")
        .attr("x", xScale(gender) + boxWidth + 5) 
        .attr("y", yScale(stat.median))
        .attr("dy", "0.35em") 
        .attr("text-anchor", "start")
        .attr("fill", pointColors[gender])
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .text(`${stat.median.toFixed(1)}`);

      svg.append("line")
      .attr("x1", xScale(gender))
      .attr("x2", xScale(gender) + boxWidth)
      .attr("y1", yScale(stat.mean))
      .attr("y2", yScale(stat.mean))
      .attr("stroke", pointColors[gender])
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,3"); 
      
        svg.append("text")
        .attr("x", xScale(gender) - 5) 
        .attr("y", yScale(stat.mean))
        .attr("dy", "0.35em") 
        .attr("text-anchor", "end")
        .attr("fill", pointColors[gender])
        .attr("font-size", "11px")
        .text(`Mean: ${stat.mean.toFixed(1)}`);
      
      if (isFinite(stat.lowerWhisker) && isFinite(stat.q1)) {
        svg.append("line")
          .attr("x1", center)
          .attr("x2", center)
          .attr("y1", yScale(stat.lowerWhisker))
          .attr("y2", yScale(stat.q1))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1);
      }
      
      if (isFinite(stat.q3) && isFinite(stat.upperWhisker)) {
        svg.append("line")
          .attr("x1", center)
          .attr("x2", center)
          .attr("y1", yScale(stat.q3))
          .attr("y2", yScale(stat.upperWhisker))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1);
      }
      
      const capWidth = boxWidth / 2;
      
      if (isFinite(stat.lowerWhisker)) {
        svg.append("line")
          .attr("x1", center - capWidth / 2)
          .attr("x2", center + capWidth / 2)
          .attr("y1", yScale(stat.lowerWhisker))
          .attr("y2", yScale(stat.lowerWhisker))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1.5);
      }
      
      if (isFinite(stat.upperWhisker)) {
        svg.append("line")
          .attr("x1", center - capWidth / 2)
          .attr("x2", center + capWidth / 2)
          .attr("y1", yScale(stat.upperWhisker))
          .attr("y2", yScale(stat.upperWhisker))
          .attr("stroke", boxColor)
          .attr("stroke-width", 1.5);
      }
      
      stat.outliers.forEach(d => {
        if (d <= 0) return;
        
        if (d > 100 && stat.outliers.length > 500 && Math.random() > 0.3) return;
        
        let jitterAmount;
        let dotSize;
        
        if (d < 100) {
          jitterAmount = 0.3;
          dotSize = 2;
        } else if (d > 100000) {
          jitterAmount = 0.25;
          dotSize = 2;
        } else {
          jitterAmount = 0.2;
          dotSize = 2;
        }
        
        svg.append("circle")
          .attr("cx", center + (Math.random() * jitterAmount * 2 - jitterAmount) * boxWidth) 
          .attr("cy", yScale(d))
          .attr("r", dotSize)
          .attr("fill", pointColors[gender])
          .attr("opacity", 0.7);
      });
    });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Distribution of Artwork Area by Gender (Log Scale)");
  }
  
  function loadRealData(csvFilePath) {
    return new Promise((resolve, reject) => {
      d3.csv(csvFilePath)
        .then(data => {
          console.log("CSV loaded successfully with", data.length, "rows");
          
          const processedData = data
            .filter(d => {
              
              return d["Height (cm)"] && 
                     d["Width (cm)"] && 
                     d["Gender.y"] &&
                     (d["Gender.y"].toLowerCase() === 'male' || d["Gender.y"].toLowerCase() === 'female') &&
                     !isNaN(parseFloat(d["Height (cm)"])) && 
                     !isNaN(parseFloat(d["Width (cm)"]));
            })
            .map(d => {
              const height = Math.max(1, parseFloat(d["Height (cm)"]));
              const width = Math.max(1, parseFloat(d["Width (cm)"])); 
              const area = height * width;
              
              return {
                gender: d["Gender.y"].toLowerCase(), 
                height: height,
                width: width,
                area: area,
                title: d["Title"] || "",
                artist: d["Artist"] || "",
                date: d["Date"] || ""
              };
            });
            
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

  document.addEventListener('DOMContentLoaded', function() {
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
