import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SavedProfiles from "./pages/SavedProfiles";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/saved-profiles"
        element={<SavedProfiles />}
      />
    </Routes>
  );
}

export default App;