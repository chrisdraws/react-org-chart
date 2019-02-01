const animationDuration = 500;
const animationDurationClose = 300;
const shouldResize = true;

// Nodes
const nodeWidth = 150;
const nodeHeight = 100;
const nodeSpacing = 12;
const nodePaddingX = 16;
const nodePaddingY = 16;
const avatarWidth = 40;
const nodeBorderRadius = 4;
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

// Lines
const lineType = 'angle';
const lineDepthY = 120; /* Height of the line for child nodes */

// Colors
const backgroundColor = '#fff';
const folderColor = '#f7e1b1';
// const borderColor = '#e6e8e9'
const borderColor = '#bbbbbb';
const nameColor = '#222d38';
const titleColor = '#617080';
const reportsColor = '#92A0AD';

const config = {
  animationDuration,
  animationDurationClose,
  folderColor,
  margin,
  nodeWidth,
  nodeHeight,
  nodeSpacing,
  nodePaddingX,
  nodePaddingY,
  nodeBorderRadius,
  avatarWidth,
  lineType,
  lineDepthY,
  backgroundColor,
  borderColor,
  nameColor,
  titleColor,
  reportsColor,
  shouldResize
};

module.exports = config;
