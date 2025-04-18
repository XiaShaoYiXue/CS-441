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
  
  const genders = ['female', 'male'];

  const xScale = d3.scaleBand()
    .domain(genders)
    .range([0, width])
    .padding(0.4);

  const minArea = 1; 
  const maxArea = Math.max(10000000, d3.max(filteredData, d => d.area) * 2);
  
  const yScale = d3.scaleLog()
    .domain([minArea, maxArea])
    .range([height, 0])
    .nice();

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("font-size", "14px")
    .style("text-anchor", "middle")
    .style("fill", "white");
  
  svg.selectAll(".domain")
    .style("stroke", "white");
  
  svg.selectAll(".tick line")
    .style("stroke", "white");

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
    .style("font-size", "12px")
    .style("fill", "white");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
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
    .attr("fill", "white")
    .style("font-size", "16px")
    .text("Area (sq cm, log scale)");

  const boxColor = "#ffffff";
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
  
  let delayCounter = 0;
  
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

  genders.forEach((gender, i) => {
    const stat = stats[gender];
    if (!stat) return; 
    
    const boxWidth = xScale.bandwidth();
    const center = xScale(gender) + boxWidth / 2;
    
    const initialQ1 = height; 
    const initialQ3 = height; 
    const finalQ1 = yScale(stat.q1);
    const finalQ3 = yScale(stat.q3);
    
    svg.append("rect")
      .attr("x", xScale(gender))
      .attr("y", initialQ3)
      .attr("width", boxWidth)
      .attr("height", 0) 
      .attr("fill", "rgba(255, 255, 255, 0.2)")
      .attr("stroke", boxColor)
      .attr("stroke-width", 1.5)
      .transition()
      .duration(1000)
      .delay(i * 400) 
      .attr("y", finalQ3)
      .attr("height", finalQ1 - finalQ3);
    
    svg.append("line")
      .attr("x1", xScale(gender))
      .attr("x2", xScale(gender) + boxWidth)
      .attr("y1", height) 
      .attr("y2", height) 
      .attr("stroke", pointColors[gender])
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(i * 400 + 700) 
      .attr("y1", yScale(stat.median))
      .attr("y2", yScale(stat.median))
      .attr("opacity", 1);
      
    svg.append("text")
      .attr("x", xScale(gender) + boxWidth + 5) 
      .attr("y", yScale(stat.median))
      .attr("dy", "0.35em") 
      .attr("text-anchor", "start")
      .attr("fill", pointColors[gender])
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(i * 400 + 800) 
      .attr("opacity", 1)
      .text(`${stat.median.toFixed(1)}`);

    svg.append("line")
      .attr("x1", xScale(gender))
      .attr("x2", xScale(gender) + boxWidth)
      .attr("y1", height) 
      .attr("y2", height) 
      .attr("stroke", pointColors[gender])
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,3")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(i * 400 + 900) 
      .attr("y1", yScale(stat.mean))
      .attr("y2", yScale(stat.mean))
      .attr("opacity", 1);
    
    svg.append("text")
      .attr("x", xScale(gender) - 5) 
      .attr("y", yScale(stat.mean))
      .attr("dy", "0.35em") 
      .attr("text-anchor", "end")
      .attr("fill", pointColors[gender])
      .attr("font-size", "11px")
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay(i * 400 + 1000) 
      .attr("opacity", 1)
      .text(`Mean: ${stat.mean.toFixed(1)}`);
    
    if (isFinite(stat.lowerWhisker) && isFinite(stat.q1)) {
      svg.append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", yScale(stat.q1))
        .attr("y2", yScale(stat.q1))
        .attr("stroke", boxColor)
        .attr("stroke-width", 1)
        .transition()
        .duration(600)
        .delay(i * 400 + 1100) 
        .attr("y2", yScale(stat.lowerWhisker));
    }
    
    if (isFinite(stat.q3) && isFinite(stat.upperWhisker)) {
      svg.append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", yScale(stat.q3))
        .attr("y2", yScale(stat.q3))
        .attr("stroke", boxColor)
        .attr("stroke-width", 1)
        .transition()
        .duration(600)
        .delay(i * 400 + 1100) 
        .attr("y2", yScale(stat.upperWhisker));
    }
    
    const capWidth = boxWidth / 2;
    
    if (isFinite(stat.lowerWhisker)) {
      svg.append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", yScale(stat.lowerWhisker))
        .attr("y2", yScale(stat.lowerWhisker))
        .attr("stroke", boxColor)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .transition()
        .duration(400)
        .delay(i * 400 + 1300) 
        .attr("x1", center - capWidth / 2)
        .attr("x2", center + capWidth / 2)
        .attr("opacity", 1);
    }
    
    if (isFinite(stat.upperWhisker)) {
      svg.append("line")
        .attr("x1", center)
        .attr("x2", center)
        .attr("y1", yScale(stat.upperWhisker))
        .attr("y2", yScale(stat.upperWhisker))
        .attr("stroke", boxColor)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .transition()
        .duration(400)
        .delay(i * 400 + 1300) 
        .attr("x1", center - capWidth / 2)
        .attr("x2", center + capWidth / 2)
        .attr("opacity", 1);
    }

    stat.outliers.forEach((d, j) => {
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
      
      const shouldAnimate = j < 100; 
      const animationDelay = shouldAnimate ? 
        i * 400 + 1400 + Math.min(j, 20) * 10 : 
        i * 400 + 1600;
      
      svg.append("circle")
        .attr("cx", center + (Math.random() * jitterAmount * 2 - jitterAmount) * boxWidth) 
        .attr("cy", yScale(d))
        .attr("r", 0) 
        .attr("fill", pointColors[gender])
        .attr("opacity", 0)
        .transition()
        .duration(shouldAnimate ? 400 : 100)
        .delay(animationDelay)
        .attr("r", dotSize)
        .attr("opacity", 0.7);
    });
  });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .attr("opacity", 0)
    .transition()
    .duration(800)
    .delay(300)
    .attr("opacity", 1)
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
        "<p style='color: white;'>Error loading data. Please check the console for details.</p>";
    });
});
