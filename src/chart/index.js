import renderUpdate from './render-update';
import render from './render';
const d3 = require('d3');
const { collapse, wrapText, helpers } = require('../utils');
const defineBoxShadow = require('../defs/box-shadow');
const defineAvatarClip = require('../defs/avatar-clip');
const defaultConfig = require('./config');
const CHART_NODE_CLASS = 'org-chart-node';
const PERSON_LINK_CLASS = 'org-chart-person-link';
const PERSON_NAME_CLASS = 'org-chart-person-name';
const PERSON_TITLE_CLASS = 'org-chart-person-title';
const PERSON_DEPARTMENT_CLASS = 'org-chart-person-dept';
const PERSON_REPORTS_CLASS = 'org-chart-person-reports';

function getDepartmentClass(d) {
  const { folder } = d.data;
  const deptClass = folder.department ? folder.department.toLowerCase() : '';

  return [PERSON_DEPARTMENT_CLASS, deptClass].join(' ');
}

export const updateDataForRender = (options) => {
  console.log('OrgChart Init Run');
  // Merge options with the default config
  const config = {
    ...defaultConfig,
    ...options,
    treeData: options.data
  };
  console.log('options = ', options);
  console.log('config =', config);
  if (!config.id) {
    console.error('react-org-chart: missing id for svg root');
    return;
  }

  const {
    id,
    lineType,
    margin,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    recordZoomTranslate,
    treeData,
    zoomTranslate
  } = config;

  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered
  if (lineType == 'angle') {
    config.lineDepthY = nodeHeight + 40;
  } else {
    config.lineDepthY = nodeHeight + 60;
  }

  // Get the root element
  const elem = document.querySelector(id);

  // Set the dimensions and margins of the diagram

  // Set the dimensions
  console.log(treeData);
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
  d3.select(`${id} svg`).remove();
  const svg = d3
    .select(id)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  const mainG = svg
    .append('g')
    .attr(
      'transform',
      'translate('
        + parseInt((elemWidth - nodeWidth) / 2)
        + ','
        + 20
        + ') scale(1)'
    );
  renderUpdate(svg, mainG, widths, recordZoomTranslate, zoomTranslate);

  // declares a tree layout and assigns the size
  const treeMap = d3
    .tree()
    .nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing]);

  // Assigns parent, children, height, depth
  const root = d3.hierarchy(treeData, function(d) {
    console.log(d);
    return d.children;
  });
  root.x0 = 0;
  root.y0 = elemHeight;

  // Collapse after the second level
  console.log(root);
  // if (root.children) {
  //   root.children.forEach(collapse);
  // }

  config.treeMapLocal = treeMap;
  config.mainGLocal = mainG;
  config.rootLocal = root;

  render(root)(config);

  // updateDataForRender(root)(config);

  // Collapse the node and all it's children
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
};

export const init = (options) => {
  console.log('OrgChart Init Run');
  // Merge options with the default config
  const config = {
    ...defaultConfig,
    ...options,
    treeData: options.data
  };
  console.log('options = ', options);
  console.log('config =', config);
  if (!config.id) {
    console.error('react-org-chart: missing id for svg root');
    return;
  }

  const {
    id,
    lineType,
    margin,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    recordZoomTranslate,
    treeData,
    zoomTranslate
  } = config;

  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered
  if (lineType == 'angle') {
    config.lineDepthY = nodeHeight + 40;
  } else {
    config.lineDepthY = nodeHeight + 60;
  }

  // Get the root element
  const elem = document.querySelector(id);

  // Set the dimensions and margins of the diagram

  // Set the dimensions
  console.log(treeData);
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
    nodeWidth,
    marginLeft: margin.left
  };
  d3.select(`${id} svg`).remove();
  const svg = d3
    .select(id)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  const mainG = svg
    .append('g')
    .attr(
      'transform',
      'translate('
        + parseInt((elemWidth - nodeWidth) / 2)
        + ','
        + 20
        + ') scale(1)'
    );
  renderUpdate(svg, mainG, widths);

  // declares a tree layout and assigns the size
  const treeMap = d3
    .tree()
    .nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing]);

  treeMap.separation(function separation(a, b) {
    console.log('separation');
    console.log(a);
    console.log(b);
    return 1.25;
  });
  // Assigns parent, children, height, depth
  const root = d3.hierarchy(treeData, function(d) {
    console.log(d);
    return d.children;
  });
  root.x0 = 0;
  root.y0 = elemHeight;

  // Collapse after the second level
  console.log(root);
  // if (root.children) {
  //   root.children.forEach(collapse);
  // }

  config.treeMapLocal = treeMap;
  config.mainGLocal = mainG;
  config.rootLocal = root;

  render(root)(config);

  // updateDataForRender(root)(config);

  // Collapse the node and all it's children
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
};
