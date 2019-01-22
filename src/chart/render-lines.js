const d3 = require("d3");

module.exports = renderLines;

function renderLines(config = {}) {
  const {
    svg,
    links,
    margin,
    nodeWidth,
    nodeHeight,
    borderColor,
    sourceNode,
    treeData,
    lineType,
    animationDuration
  } = config;

  console.log("config in render-lines: ", config);

  const parentNode = sourceNode || treeData;

  console.log("links", links);
  // Select all the links to render the lines
  const link = svg
    .selectAll("path.link")
    .data(links.filter(link => link.data.id), d => d.id);

  // Define the curved line function
  // const curve = d3.svg
  //   .diagonal()
  //   .projection(d => [d.x + nodeWidth / 2, d.y + nodeHeight / 2]);

  const curve = function diagonal(s, d) {
    var path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path;
  };

  // Define the angled line function
  const angle = d3
    .line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinear);

  if (lineType === "angle") {
    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", borderColor)
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.25)
      .attr("d", d => {
        //console.log("d = ", d);
        console.log(d.parent);

        //parent might be the wrong attribute, also it should probably be x0, and y0, that's what it was originally, but it was d.source.x0, but was causing some problems.
        const linePoints = [
          {
            x: d.parent.data.x0 + parseInt(nodeWidth / 2),
            y: d.parent.data.y0 + nodeHeight + 2
          },
          {
            x: d.parent.data.x0 + parseInt(nodeWidth / 2),
            y: d.parent.data.y0 + nodeHeight + 2
          },
          {
            x: d.parent.data.x0 + parseInt(nodeWidth / 2),
            y: d.parent.data.y0 + nodeHeight + 2
          },
          {
            x: d.parent.data.x0 + parseInt(nodeWidth / 2),
            y: d.parent.data.y0 + nodeHeight + 2
          }
        ];

        return angle(linePoints);
      });

    // Transition links to their new position.

    link
      .transition()
      .duration(animationDuration)
      .attr("d", d => {
        const linePoints = [
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight
          },
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.y - margin.top / 2
          },
          {
            x: d.x + parseInt(nodeWidth / 2),
            y: d.y - margin.top / 2
          },
          {
            x: d.x + parseInt(nodeWidth / 2),
            y: d.y
          }
          //original
          // {
          //   x: d.source.x + parseInt(nodeWidth / 2),
          //   y: d.source.y + nodeHeight
          // },
          // {
          //   x: d.source.x + parseInt(nodeWidth / 2),
          //   y: d.target.y - margin.top / 2
          // },
          // {
          //   x: d.target.x + parseInt(nodeWidth / 2),
          //   y: d.target.y - margin.top / 2
          // },
          // {
          //   x: d.target.x + parseInt(nodeWidth / 2),
          //   y: d.target.y
          // }
        ];

        return angle(linePoints);
      });

    // Animate the existing links to the parent's new position
    console.log("config.callerNode", config.callerNode);
    link
      .exit()
      .transition()
      .duration(animationDuration)
      .attr("d", d => {
        const linePoints = [
          {
            x: config.callerNode.x + parseInt(nodeWidth / 2),
            y: config.callerNode.y + nodeHeight + 2
          },
          {
            x: config.callerNode.x + parseInt(nodeWidth / 2),
            y: config.callerNode.y + nodeHeight + 2
          },
          {
            x: config.callerNode.x + parseInt(nodeWidth / 2),
            y: config.callerNode.y + nodeHeight + 2
          },
          {
            x: config.callerNode.x + parseInt(nodeWidth / 2),
            y: config.callerNode.y + nodeHeight + 2
          }
        ];

        return angle(linePoints);
      })
      .on("end", () => {
        config.callerNode = null;
      });
  } else if (lineType === "curve") {
    link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("stroke", borderColor)
      .attr("fill", "none")
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 2)
      .attr("d", d => {
        const source = {
          x: parentNode.x0,
          y: parentNode.y0
        };

        return curve({
          source,
          target: source
        });
      });

    // Transition links to their new position.
    link
      .transition()
      .duration(animationDuration)
      .attr("d", curve);

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition()
      .duration(animationDuration)
      .attr("d", function(d) {
        const source = {
          x: parentNode.x,
          y: parentNode.y
        };
        return curve({
          source,
          target: source
        });
      })
      .remove();
  }
}
