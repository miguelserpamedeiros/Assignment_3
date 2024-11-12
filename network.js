
function simulate(data,svg)
{
    const width = parseInt(svg.attr("viewBox").split(' ')[2])
    const height = parseInt(svg.attr("viewBox").split(' ')[3])
    const main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

   //calculate degree of the nodes:
    let node_degree={}; //initiate an object
   d3.map(data.links, function (d){
       if(node_degree.hasOwnProperty(d.source))
       {
           node_degree[d.source]++
       }
       else {
           node_degree[d.source]=0
       }
       if(node_degree.hasOwnProperty(d.target))
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

 //  let publishers_dict = {}
  // const publishers = [...new Set(data.nodes.map(d=>d.Publisher.toString()))].map((d,i : number)=>{

    const scale_radius = d3.scaleSqrt()
        .domain(d3.extent(Object.values(node_degree)))
        .range([3,12])

        const countryCounts = {};
        
        data.nodes.forEach(node => {
            const countries = node["Affiliation Countries"];
            if (countries) {
                countries.forEach(country => {
                    if (country in countryCounts) {
                        countryCounts[country]++;
                    } else {
                        countryCounts[country] = 1;
                    }
                });
            }
        });
        
        
        //console.log(countryCounts)
        
    const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
    
    //console.log("Top Countries:", topCountries);
    

    
    
    // let colorScale = d3.scaleSequential(d3.interpolateViridis)
    //      .domain([0, countryCounts[topCountries[0]]]);
        
    // colorScale = d3.scaleOrdinal()
    //      .domain(topCountries)
    //      .range(d3.schemeCategory10); // or
        
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain([0, topCountries.length - 1]);

// Assign a specific color (#A9A9A9) for the rest of the countries
const getColorByCountry = (countries) => {
    if (countries) {
        let maxCount = -1;
        let selectedCountry = null;
        //console.log("Countries:", countries);
        for (const country of countries) {
            const index = topCountries.indexOf(country);
            if (index !== -1 && countryCounts[country] > maxCount) {  //index = -1 means the country is not in the top countries
                maxCount = countryCounts[country];
                selectedCountry = country;
            }
        }
        //console.log("Selected Country:", selectedCountry);
        if (selectedCountry !== null) {
            return colorScale(topCountries.indexOf(selectedCountry));
        }
    }
    return "#A9A9A9";
};


    
    // // Assign a specific color (#A9A9A9) for the rest of the countries
    // const getColorByCountry = (countries) => {
    //     if (countries) {
    //         for (const country of countries) {
    //             if (topCountries.includes(country)) {
    //                 return colorScale(countryCounts[country]);
    //             }
    //         }
    // //     }
    //     return "#A9A9A9";
    // };

    const link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke","grey")

    const treatPublishersClass=(Publisher)=>{
        let temp = Publisher.toString().split(' ').join('');
        temp = temp.split('.').join('');
        temp = temp.split(',').join('');
        temp = temp.split('/').join('');
        return "gr"+temp
    }

    

    const node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){return treatPublishersClass(d.Publisher)})
        .on("mouseover", function (event, data) {
            const affiliations = data["Affiliation"];
            console.log("Hovered Node Affiliations:", affiliations);
            node_elements.selectAll("circle")
                .style("opacity", function(d) {
                    console.log("Node Affiliation:", d["Affiliation"]);
                    console.log(d)
                    // Check if there is at least one common affiliation
                    if (d["Affiliation"]) {
                        for (const affiliation of affiliations) {
                            if (d["Affiliation"].includes(affiliation)) {
                                
                                return 1;
                            }
                        }
                    }
                    return 0.2;
                });
        })
        .on("mouseout", function () {
            node_elements.selectAll("circle").style("opacity", 1);
        })
        

        // Inside the click event handler
        .on("click", function (event, data) {
            const tooltip = d3.select(".tooltip");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Author: ${data.Authors}<br>Affiliation: ${data.Affiliation.join(", ")}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
    
            // Hide the tooltip after 20 seconds
            tooltip.transition()
                .delay(10000) // 20 seconds in milliseconds
                .duration(200)
                .style("opacity", 0);
        });



    node_elements.append("circle")
        .attr("r",  (d,i)=>{
            if(node_degree[d.id]!==undefined){
                return scale_radius(node_degree[d.id])
            }
            else{
                return scale_radius(0)
            }
        })
        .attr("fill",d=>getColorByCountry(d["Affiliation Countries"]))


    // node_elements.append("text")
    //     .attr("class","label")
    //     .attr("text-anchor","middle")
    //     .text(d=>d.name)

       
    // let ForceSimulation = d3.forceSimulation(data.nodes)
    //     .force("collide",
    //         d3.forceCollide().radius(function (d,i){return scale_radius(node_degree[d.id])*1.2}))
    //     .force("x", d3.forceX())
    //     .force("y", d3.forceY())
    //     .force("charge", d3.forceManyBody())
    //     .force("link",d3.forceLink(data.links)
    //         .id(function (d){return d.id})
    //         .strength(0.2)
            
            
            
    //     )
    //     .on("tick", ticked);

    // function ticked()
    // {
    // node_elements
    //     .attr('transform', function(d) { return `translate(${d.x},${d.y})`})
    //     link_elements
    //         .attr("x1",d=>d.source.x)
    //         .attr("x2",d=>d.target.x)
    //         .attr("y1",d=>d.source.y)
    //         .attr("y2",d=>d.target.y)

    //     }

    // svg.call(d3.zoom()
    //     .extent([[0, 0], [width, height]])
    //     .scaleExtent([1, 8])
    //     .on("zoom", zoomed));
    // function zoomed({transform}) {
    //     main_group.attr("transform", transform);
    // }
       
    let chargeForce = d3.forceManyBody().strength(-30);
    let collideForce = d3.forceCollide().radius(d => scale_radius(node_degree[d.id]) * 1.2);
    let linkForce = d3.forceLink(data.links).id(d => d.id).strength(0.2);
    
    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide", collideForce)
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", chargeForce)
        .force("link", linkForce)
        .on("tick", ticked);
    
    document.getElementById('charge').addEventListener('input', function() {
        chargeForce.strength(+this.value);
        ForceSimulation.alpha(1).restart();
    });
    
    document.getElementById('collide').addEventListener('input', function() {
        collideForce.radius(d => scale_radius(node_degree[d.id]) * (+this.value/12));
        ForceSimulation.alpha(1).restart();
    });
    
    document.getElementById('linkStrength').addEventListener('input', function() {
        linkForce.strength(+this.value);
        ForceSimulation.alpha(1).restart();
    });
    
    function ticked() {
        node_elements
            .attr('transform', function(d) { return `translate(${d.x},${d.y})`});
        link_elements
            .attr("x1",d=>d.source.x)
            .attr("x2",d=>d.target.x)
            .attr("y1",d=>d.source.y)
            .attr("y2",d=>d.target.y);
    }
    
    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }
    




}
