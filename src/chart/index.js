const d3 = require("d3");
const { collapse, wrapText, helpers } = require("../utils");
const defineBoxShadow = require("../defs/box-shadow");
const defineAvatarClip = require("../defs/avatar-clip");
const render = require("./render");
const renderUpdate = require("./render-update");
const defaultConfig = require("./config");
const CHART_NODE_CLASS = "org-chart-node";
const PERSON_LINK_CLASS = "org-chart-person-link";
const PERSON_NAME_CLASS = "org-chart-person-name";
const PERSON_TITLE_CLASS = "org-chart-person-title";
const PERSON_DEPARTMENT_CLASS = "org-chart-person-dept";
const PERSON_REPORTS_CLASS = "org-chart-person-reports";

module.exports = {
  init
};

function getDepartmentClass(d) {
  const { person } = d.data;
  const deptClass = person.department ? person.department.toLowerCase() : "";

  return [PERSON_DEPARTMENT_CLASS, deptClass].join(" ");
}

function init(options) {
  // Merge options with the default config
  const config = {
    ...defaultConfig,
    ...options,
    treeData: options.data
  };

  if (!config.id) {
    console.error("react-org-chart: missing id for svg root");
    return;
  }

  const {
    animationDuration,
    animationDurationClose,
    folderColor,
    id,
    treeData,
    lineType,
    margin,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    shouldResize,
    backgroundColor,
    borderColor,
    nodeBorderRadius,
    nodePaddingX,
    nodePaddingY,
    avatarWidth,
    nameColor,
    titleColor,
    reportsColor
  } = config;
  console.log("avatarWidth", avatarWidth);
  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered
  if (lineType == "angle") {
    config.lineDepthY = nodeHeight + 40;
  } else {
    config.lineDepthY = nodeHeight + 60;
  }

  // Get the root element
  const elem = document.querySelector(id);

  // Set the dimensions and margins of the diagram

  // Set the dimensions
  const elemWidth = elem.offsetWidth;
  const elemHeight = elem.offsetHeight;
  const childrenWidth = parseInt((treeData.children.length * nodeWidth) / 2);
  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const widths = {
    elemWidth,
    elemHeight,
    childrenWidth,
    marginLeft: margin.left
  };
  var svg = d3
    .select(id)
    .append("svg")
    .attr("width", "100%")
    .attr("height", elemHeight);

  const mainG = svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        parseInt(
          childrenWidth + (elemWidth - childrenWidth * 2) / 2 - margin.left / 2
        ) +
        "," +
        20 +
        ") scale(1)"
    );
  renderUpdate(svg, mainG, widths);

  var i = 0,
    root;

  // declares a tree layout and assigns the size
  var treemap = d3
    .tree()
    .nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing]);

  // Assigns parent, children, height, depth
  root = d3.hierarchy(treeData, function(d) {
    return d.children;
  });
  root.x0 = elemHeight / 2;
  root.y0 = 0;

  // Collapse after the second level
  root.children.forEach(collapse);

  update(root);

  // Collapse the node and all it's children
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function update(source) {
    console.log("animationDuration", animationDuration);
    console.log("animationDurationClose", animationDuration);
    // Assigns the x and y position for the nodes
    console.log("source  = ", source);
    var treeData = treemap(root);
    console.log("treeData", treeData);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      d.y = d.depth * (nodeHeight * 1.5);
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = mainG
      .selectAll(`g.${CHART_NODE_CLASS}`)
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node
      .enter()
      .append("g")
      .attr("class", CHART_NODE_CLASS)
      .attr("transform", function(d) {
        return "translate(" + source.x + "," + source.y + ")";
      })
      .on("click", click);

    // Add Circle for the nodes
    // nodeEnter
    //   .append("rect")
    //   .attr("width", nodeWidth)
    //   .attr("height", nodeHeight)
    //   .attr("fill", backgroundColor)
    //   .attr("stroke", borderColor)
    //   .attr("rx", nodeBorderRadius)
    //   .attr("ry", nodeBorderRadius)
    //   .attr("fill-opacity", 1)
    //   .attr("stroke-opacity", 1);

    nodeEnter
      .append("polygon")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", folderColor)
      .attr("stroke", borderColor)
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1)
      .attr(
        "points",
        "110.000 50.000, 240.000 50.000, 240.000 220.000, 0.000 220.000, 0.000 20.000, 80.000 20.000, 110.000 50.000"
      )
      .attr("transform", "scale(.6, .6)");

    // Add labels for the nodes
    const namePos = {
      x: nodePaddingX / 2,
      y: nodePaddingY * 2 + avatarWidth
    };
    // nodeEnter
    //   .append("polygon")
    //   .attr(
    //     "points",
    //     "11.000 5.000, 24.000 5.000, 24.000 22.000, 0.000 22.000, 0.000 2.000, 8.000 2.000, 11.000 5.000"
    //   )
    //   .attr("width", nodeWidth)
    //   .attr("height", nodeHeight)
    //   .attr("transform", "scale(4,4)")
    //   .attr("fill", folderColor);
    // Person's Name
    nodeEnter
      .append("text")
      .attr("class", PERSON_NAME_CLASS)
      .attr("textLength", "100px")
      .attr("x", namePos.x)
      .attr("y", namePos.y)
      .attr("dy", ".3em")
      .style("cursor", "pointer")
      .style("fill", nameColor)
      .style("font-size", 14)
      .text(d => d.data.person.name);

    // Person's Title
    nodeEnter
      .append("text")
      .attr("class", PERSON_TITLE_CLASS + " unedited")
      .attr("x", namePos.x)
      .attr("y", namePos.y + nodePaddingY)
      .attr("dy", "0.1em")
      .attr("textLength", nodeWidth - nodePaddingX * 4)
      .style("font-size", 12)
      .style("cursor", "pointer")
      .style("fill", titleColor)
      .text(d => d.data.person.title);

    const heightForTitle = 45; // getHeightForText(d.data.person.title)

    // Person's Reports
    nodeEnter
      .append("text")
      .attr("class", PERSON_REPORTS_CLASS)
      .attr("x", namePos.x)
      .attr("y", namePos.y + nodePaddingY + heightForTitle)
      .attr("dy", ".9em")
      .style("font-size", 14)
      .style("font-weight", 500)
      .style("cursor", "pointer")
      .style("fill", reportsColor)
      .text(helpers.getTextForTitle);

    // Person's Avatar
    nodeEnter
      .append("image")
      .attr("width", avatarWidth)
      .attr("height", avatarWidth)
      .attr("x", nodePaddingX / 2.2)
      .attr("y", nodePaddingY)
      .attr("stroke", borderColor)
      .attr("src", d => d.data.person.avatar)
      .attr("xlink:href", d => d.data.person.avatar)
      .attr("clip-path", "url(#avatarClip)");

    // Person's Department
    nodeEnter
      .append("text")
      .attr("class", getDepartmentClass)
      .attr("x", 34)
      .attr("y", avatarWidth + nodePaddingY * 1.2)
      .attr("dy", ".9em")
      .style("cursor", "pointer")
      .style("fill", titleColor)
      .style("font-weight", 600)
      .style("font-size", 8)
      .attr("text-anchor", "middle")
      .text(helpers.getTextForDepartment);

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(animationDuration)
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // Update the node attributes and style
    nodeUpdate
      .select("circle.node")
      .attr("r", 10)
      .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
      })
      .attr("cursor", "pointer");

    // Remove any exiting nodes
    var nodeExit = node
      .exit()
      .transition()
      .duration(parseInt(animationDurationClose))
      .attr("transform", function(d) {
        return "translate(" + source.x + "," + source.y + ")";
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select("circle").attr("r", 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // ****************** links section ***************************

    // Update the links...
    // var link = svg.selectAll("path.link").data(links, function(d) {
    //   return d.id;
    // });

    // // Enter any new links at the parent's previous position.
    // var linkEnter = link
    //   .enter()
    //   .insert("path", "g")
    //   .attr("class", "link")
    //   .attr("d", function(d) {
    //     var o = { x: source.x0, y: source.y0 };
    //     return diagonal(o, o);
    //   });

    // // UPDATE
    // var linkUpdate = linkEnter.merge(link);

    // // Transition back to the parent element position
    // linkUpdate
    //   .transition()
    //   .duration(duration)
    //   .attr("d", function(d) {
    //     return diagonal(d, d.parent);
    //   });

    // // Remove any exiting links
    // var linkExit = link
    //   .exit()
    //   .transition()
    //   .duration(duration)
    //   .attr("d", function(d) {
    //     var o = { x: source.x, y: source.y };
    //     return diagonal(o, o);
    //   })
    //   .remove();

    const angle = d3
      .line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveLinear);

    const link = mainG
      .selectAll("path.link")
      .data(links.filter(link => link.data.id), d => d.id);

    console.log("link =", link);
    // Define the curved line function
    // const curve = d3.svg
    //   .diagonal()
    //   .projection(d => [d.x + nodeWidth / 2, d.y + nodeHeight / 2]);

    // Define the angled line function

    if (lineType === "angle") {
      // Enter any new links at the parent's previous position.
      link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", borderColor)
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width", 1.25)
        .attr("d", d => {
          //console.log("d = ", d);
          console.log(d.parent);
          console.log(d.parent.x0);
          //parent might be the wrong attribute, also it should probably be x0, and y0, that's what it was originally, but it was d.source.x0, but was causing some problems.
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
          ];
          console.log("first link angle =", angle(linePoints));
          return angle(linePoints);
        });

      // Transition links to their new position.
      console.log("here");
      link
        .transition()
        .duration(animationDuration)
        .attr("d", d => {
          console.log(d);
          console.log(d.parent);
          console.log(d.parent.x);
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
          console.log("second link angle =", angle(linePoints));
          return angle(linePoints);
        });

      // Animate the existing links to the parent's new position
      console.log("config.callerNode", config.callerNode);
      link
        .exit()
        .transition()
        .duration(parseInt(animationDurationClose))
        .attr("d", d => {
          const linePoints = [
            {
              x: source.x + parseInt(nodeWidth / 2),
              y: source.y + nodeHeight + 2
            },
            {
              x: source.x + parseInt(nodeWidth / 2),
              y: source.y + nodeHeight + 2
            },
            {
              x: source.x + parseInt(nodeWidth / 2),
              y: source.y + nodeHeight + 2
            },
            {
              x: source.x + parseInt(nodeWidth / 2),
              y: source.y + nodeHeight + 2
            }
          ];
          console.log("third link angle =", angle(linePoints));
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
        .duration(parseInt(animationDurationClose))
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

    // Store the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      var path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

      return path;
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
  }
}
