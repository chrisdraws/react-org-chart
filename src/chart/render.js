import { hierarchy, tree as newTree } from 'd3-hierarchy';
import * as d3 from 'd3';
import 'd3-selection-multi';
const renderLines = require('./render-lines');
const onClick = require('./on-click');
const iconLink = require('./components/icon-link');
const { wrapText, helpers } = require('../utils');

const CHART_NODE_CLASS = 'org-chart-node';
const PERSON_LINK_CLASS = 'org-chart-person-link';
const PERSON_NAME_CLASS = 'org-chart-person-name';
const PERSON_TITLE_CLASS = 'org-chart-person-title';
const PERSON_DEPARTMENT_CLASS = 'org-chart-person-dept';
const PERSON_REPORTS_CLASS = 'org-chart-person-reports';

let idCounter = 0;

const render = (source) => (config) => {
  console.log('rendered');
  console.log('source = ', source);
  console.log('render config =', config);
  const {
    animationDuration,
    animationDurationClose,
    folderColor,
    id,
    lineType,
    mainGLocal,
    margin,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    onDrop,
    rootLocal,
    shouldResize,
    treeMapLocal,
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

  console.log(treeMapLocal);

  const treeData = treeMapLocal(rootLocal);
  console.log('treeData = ', treeData);
  // if (treeData.data.children.length > 0) {
  console.log('inside if');
  // Compute the new tree layout.
  let nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);
  console.log('nodes =', nodes);
  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * (nodeHeight * 1.75);
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  const node = mainGLocal
    .selectAll(`g.${CHART_NODE_CLASS}`)
    .data(nodes, function(d) {
      return d.id || (d.id = ++idCounter);
    });

  // Enter any new modes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .append('g')
    .attr('class', CHART_NODE_CLASS)
    .attr('transform', `translate(${source.x},${source.y})`)
    .on('click', click)
    .on('mouseover', (d) => {
      console.log('hovering on = ', d);
      onDrop(d.data.id);
    });

  // add folder polygon for the nodes
  nodeEnter
    .append('polygon')
    .attrs({
      width: nodeWidth,
      height: nodeHeight,
      fill: folderColor,
      stroke: borderColor,
      'fill-opacity': 1,
      'stroke-opacity': 1,
      points:
        '110.000 50.000, 240.000 50.000, 240.000 220.000, 0.000 220.000, 0.000 20.000, 80.000 20.000, 110.000 50.000',
      transform: 'scale(.6, .6)'
    })
    .style('cursor', 'pointer');

  // Add labels for the nodes
  const namePos = {
    x: nodePaddingX / 2,
    y: nodePaddingY * 2 + avatarWidth
  };
  console.log(node);
  // Person's Name

  nodeEnter
    .append('text')
    .attrs({
      class: PERSON_NAME_CLASS,
      textLength: '100px',
      x: namePos.x,
      y: namePos.y,
      dy: '.3em'
    })
    .styles({ cursor: 'pointer', fill: nameColor, 'font-size': 14 })
    .text((d) => d.data.folder.name);

  // Person's Title
  nodeEnter
    .append('text')
    .attrs({
      class: PERSON_TITLE_CLASS + ' unedited',
      x: namePos.x,
      y: namePos.y + nodePaddingY,
      dy: '0.1em',
      textLength: nodeWidth - nodePaddingX * 4
    })
    .styles({ 'font-size': 12, cursor: 'pointer', fill: titleColor })
    .text((d) => d.data.folder.title);

  const heightForTitle = 45; // getHeightForText(d.data.folder.title)

  // Person's Reports
  nodeEnter
    .append('text')
    .attrs({
      class: PERSON_REPORTS_CLASS,
      x: namePos.x,
      y: namePos.y + nodePaddingY + heightForTitle,
      dy: '.9em'
    })
    .styles({
      'font-size': 14,
      'font-weight': 500,
      cursor: 'pointer',
      fill: reportsColor
    })
    .text(helpers.getTextForTitle);

  // Person's Avatar
  nodeEnter
    .append('image')
    .attrs({
      width: avatarWidth,
      height: avatarWidth,
      x: nodePaddingX / 2.2,
      y: nodePaddingY,
      stroke: borderColor,
      src: (d) => d.data.folder.avatar,
      'xlink:href': (d) => d.data.folder.avatar,
      'clip-path': 'url(#avatarClip)'
    })
    .style('cursor', 'pointer');

  // Person's Department
  nodeEnter
    .append('text')
    .attrs({
      class: getDepartmentClass,
      x: 34,
      y: avatarWidth + nodePaddingY * 1.2,
      dy: '.9em',
      'text-anchor': 'middle'
    })
    .styles({
      cursor: 'pointer',
      fill: titleColor,
      'font-weight': 600,
      'font-size': 8
    })
    .text(helpers.getTextForDepartment);

  // UPDATE
  const nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(animationDuration)
    .attr('transform', function(d) {
      return `translate(${d.x},${d.y})`;
    });

  // Update the node attributes and style
  nodeUpdate
    .select(CHART_NODE_CLASS)
    .attr('r', 10)
    .styles({
      fill(d) {
        return d._children ? 'lightsteelblue' : '#fff';
      },
      cursor: 'pointer'
    });

  // Remove any exiting nodes
  const nodeExit = node
    .exit()
    .transition()
    .duration(parseInt(animationDurationClose))
    .attr('transform', `translate(${source.x},${source.y})`)
    .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select(CHART_NODE_CLASS).attr('transform', 'scale(0,0)');

  // On exit reduce the opacity of text labels
  nodeExit.select('text').style('fill-opacity', 1e-6);

  const angle = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveLinear);

  const link = mainGLocal
    .selectAll('path.link')
    .data(links.filter((link) => link.data.id), (d) => d.id);

  if (lineType === 'angle') {
    // Enter any new links at the parent's previous position.
    link
      .enter()
      .insert('path', 'g')
      .attrs({
        class: 'link',
        fill: 'none',
        stroke: borderColor,
        'stroke-opacity': 0.9,
        'stroke-width': 1.25,
        d: (d) => {
          const linePoints = [
            {
              x: d.parent.x + parseInt(nodeWidth / 2),
              y: d.parent.y + nodeHeight * 1.5
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
              y: d.y + margin.top / 1.8
            }
          ];
          console.log('first link angle =', angle(linePoints));
          return angle(linePoints);
        }
      });

    // Transition links to their new position.

    link
      .transition()
      .duration(animationDuration)
      .attr('d', (d) => {
        const linePoints = [
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight * 1.5
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
            y: d.y + margin.top / 1.8
          }
        ];

        return angle(linePoints);
      });

    // Animate the existing links to the parent's new position

    link
      .exit()
      .transition()
      .duration(parseInt(animationDurationClose))
      .attr('d', (d) => {
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

        return angle(linePoints);
      })
      .on('end', () => {
        // this is leftover from transforming the code from v3 of d3
        // config.callerNode = null;
        // could be
        // source = null? or d?  doesn't seem neccesary to do that here
      });
  } else if (lineType === 'curve') {
    link
      .enter()
      .insert('path', 'g')
      .attrs({
        class: 'link',
        stroke: borderColor,
        fill: 'none',
        x: nodeWidth / 2,
        y: nodeHeight / 2,
        d: (d) => {
          const source = {
            x: parentNode.x0,
            y: parentNode.y0
          };

          return curve({
            source,
            target: source
          });
        }
      });

    // Transition links to their new position.
    link
      .transition()
      .duration(animationDuration)
      .attr('d', curve);

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      .transition()
      .duration(parseInt(animationDurationClose))
      .attr('d', function(d) {
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
    const path = `M ${s.y} ${s.x}
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
    if (d.children || d._children) {
      render(d)(config);
    }
  }
  // }
};

function getDepartmentClass(d) {
  const { folder } = d.data;
  const deptClass = folder.department ? folder.department.toLowerCase() : '';

  return [PERSON_DEPARTMENT_CLASS, deptClass].join(' ');
}

export default render;
