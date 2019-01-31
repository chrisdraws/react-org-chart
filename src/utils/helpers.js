module.exports = {
  getTextForTitle,
  getTextForDepartment,
  getCursorForNode
};

function getTextForTitle(datum) {
  if (!datum.folder || !datum.folder.totalReports) {
    return '';
  }

  const {
    person: { totalReports }
  } = datum;
  const pluralEnding = totalReports > 1 ? 's' : '';

  return `${totalReports} report${pluralEnding}`;
}

const departmentAbbrMap = {
  Marketing: 'mktg',
  Operations: 'ops',
  Growth: 'gwth',
  Branding: 'brand',
  Assurance: 'fin',
  Data: 'data',
  Design: 'design',
  Communications: 'comms',
  Product: 'prod',
  People: 'people',
  Sales: 'sales'
};

function getTextForDepartment(datum) {
  if (!datum.data.folder.department) {
    return '';
  }

  const { department } = datum.data.folder;

  if (departmentAbbrMap[department]) {
    return departmentAbbrMap[department].toUpperCase();
  }

  return datum.data.folder.department.substring(0, 3).toUpperCase();
}

function getCursorForNode(datum) {
  return datum.children || datum._children || datum.hasChild
    ? 'pointer'
    : 'default';
}
