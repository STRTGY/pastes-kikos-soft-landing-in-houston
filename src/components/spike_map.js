chart = {

    // Join the geographic shapes and the population data.
    const data = population.map((d) => ({
      ...d,
      county: countymap.get(d.fips),
      state: statemap.get(d.state)
    }))
      .filter(d => d.county)
      .sort((a, b) => d3.descending(a.population, b.population));
  
    // Construct the length scale.
    const length = d3.scaleLinear([0, d3.max(data, d => d.population)], [0, 200]);
  
    // Construct a path generator.
    const path = d3.geoPath();
  
    // Create the SVG container. Its dimensions correspond to the bounding-box
    // of the pre-projected US shapefile. 
    const svg = d3.create("svg")
        .attr("width", 975)
        .attr("height", 610)
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "width: 100%; height: auto; height: intrinsic;");
  
    // Create the cartographic background layers.
    svg.append("path")
        .datum(topojson.feature(us, us.objects.nation))
        .attr("fill", "#ddd")
        .attr("d", path);
  
    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
  
    // Create the legend.
    const legend = svg.append("g")
        .attr("fill", "#777")
        .attr("transform", "translate(886,592)")
        .attr("text-anchor", "middle")
        .style("font", "10px sans-serif")
      .selectAll()
        .data(length.ticks(4).slice(1))
      .join("g")
        .attr("transform", (d, i) => `translate(${20 * i},0)`);
  
    legend.append("path")
        .attr("fill", "red")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "red")
        .attr("stroke-width", 0.5)
        .attr("d", d => spike(length(d)));
  
    legend.append("text")
        .attr("dy", "1em")
        .text(length.tickFormat(4, "s"));
  
    // Add a spike for each county, with a title (tooltip).
    const format = d3.format(",.0f");
    svg.append("g")
        .attr("fill", "red")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "red")
        .attr("stroke-width", 0.5)
      .selectAll()
      .data(data)
      .join("path")
        .attr("transform", d => `translate(${centroid(d.county)})`)
        .attr("d", d => spike(length(d.population)))
      .append("title")
        .text(d => `${d.county.properties.name}, ${d.state.properties.name}
  ${format(d.population)}`);
  
    return svg.node();
  }

  population = FileAttachment("population.json").json()
  .then((data) =>
    data
      .slice(1) // removes a header line
      .map(([p, state, county]) => ({
        state,
        fips: `${state}${county}`,
        population: +p
      }))
  )

  centroid = {
    const path = d3.geoPath();
    return feature => path.centroid(feature);
  }

  us = FileAttachment("counties-albers-10m.json").json()
  nation = topojson.feature(us, us.objects.nation)
  statemap = new Map(topojson.feature(us, us.objects.states).features.map(d => [d.id, d]))
  countymap = new Map(topojson.feature(us, us.objects.counties).features.map(d => [d.id, d]))
  statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
  spike = (length, width = 7) => `M${-width / 2},0L0,${-length}L${width / 2},0`


  Plot.plot({
    width: 975,
    projection: "identity",
    length: {range: [0, 200]},
    marks: [
      Plot.geo(nation, { fill: "#eee" }),
      Plot.geo(statemesh, { stroke: "white" }),
      Plot.spike(population, Plot.centroid({length: "population", geometry: ({fips}) => countymap.get(fips)}))
    ]
  })