import React, { Component, createElement } from 'react';
import fakeData from '../../utils/fake-data';
import { init, updateDataForRender } from '../../chart';

const data = fakeData();
console.log('fakeData = ', data);
class OrgChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { id, tree, ...options } = this.props;

    init({
      id: `#${id}`,
      data: tree,
      ...options
    });
  }

  componentDidUpdate() {
    const { id, tree, ...options } = this.props;

    init({
      id: `#${id}`,
      data: tree,
      ...options
    });
  }

  render() {
    console.log('orgChartRendered');
    const { id } = this.props;
    const styles = {
      height: '100%',
      width: '100%'
    };
    return createElement('div', {
      id,
      style: styles
    });
  }
}

OrgChart.defaultProps = {
  id: 'react-org-chart',
  tree: data,
  onDrop: () => {}
};

export default OrgChart;
