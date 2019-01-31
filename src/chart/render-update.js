import * as d3 from 'd3';
import { parseSvg } from 'd3-interpolate/src/transform/parse';

// Update the rendered node positions triggered by zoom
const renderUpdate = (holder, zoomer, widths) => {
  const {
    childrenWidth,
    elemHeight,
    elemWidth,
    marginLeft,
    nodeWidth
  } = widths;

  // let zoomDoneOnce = false,
  //   offset,
  //   currentScale;
  // console.log(widths);
  const zoom = d3
    .zoom()
    .scaleExtent([0.05, 2])
    .on('zoom', zoomed);

  function zoomed() {
    zoomer.attr('transform', d3.event.transform);
    const zoomerPos = parseSvg(zoomer.attr('transform'));
    console.log(zoomerPos);
  }

  const rectangle = holder
    .insert('rect', ':first-child')
    .attr('class', 'rectangleHolder')
    .attr('width', elemWidth + childrenWidth)
    .attr('height', '100%')
    .style('fill', 'none')
    .style('pointer-events', 'all')
    .call(zoom);

  const zoomerPos = parseSvg(zoomer.attr('transform'));
  const transform = d3.zoomIdentity
    .translate(zoomerPos.translateX + 144 / 2, 0)
    .scale(elemWidth / (elemWidth + childrenWidth * 1.25));

  rectangle.call(zoom.transform, transform);
};

export default renderUpdate;
