import * as d3 from "d3";
import { parseSvg } from "d3-interpolate/src/transform/parse";

module.exports = renderUpdate;

// Update the rendered node positions triggered by zoom
function renderUpdate(holder, zoomer, widths) {
  const { childrenWidth, elemHeight, elemWidth, marginLeft } = widths;

  let zoomDoneOnce = false;

  const rectangle = holder
    .insert("rect", ":first-child")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(
      d3
        .zoom()
        .on("start", zoomStart)
        .on("zoom", zoomZoom)
        .on("end", zoomEnd)
    );

  function zoomStart() {
    if (!zoomDoneOnce) {
      const zoomerPos = parseSvg(zoomer.attr("transform"));

      rectangle.attr(
        "transform",
        `translate(${-zoomerPos.translateX},-17) scale(1)`
      );
    }
  }

  function zoomZoom() {
    zoomer.attr("transform", d3.event.transform);
  }

  function zoomEnd() {
    if (!zoomDoneOnce) {
      rectangle.attr("transform", "translate(0,0) scale(1)");
      zoomDoneOnce = true;
    }
  }
}
