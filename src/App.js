// App.js
import "./App.css";
import React from "react";
import ContactImport from "./components/ContactImport";
import ContactList from "./components/ContactList";

const App = () => {
  return (
    <div>
      <h1 className="head">Contact Management App</h1>
      <ContactImport />
      <ContactList />
    </div>
  );
};

export default App;
