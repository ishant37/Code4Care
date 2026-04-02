import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import WardDashboard from "./Pages/WardDashboard";
import EHRSync from "./components/EHRSync";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<WardDashboard />} />
        <Route path="/ehr-sync" element={<EHRSync />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;