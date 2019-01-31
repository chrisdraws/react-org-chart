const fakeData = require("../utils/fake-data");
import init from "../chart";
const data = fakeData();

init({ id: "#root", data, lineType: "angle" });
