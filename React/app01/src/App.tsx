import { Fragment } from "react/jsx-runtime";
import Header from "./ui/Header";
import Statement from "./ui/Statement";
 
const App = () => (
  <Fragment>
    <Header appTitle="Budget Tracker" />
    <div className="container-fluid p-2">
      <Statement />
    </div>
  </Fragment>
);
 
export default App;