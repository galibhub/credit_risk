import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";
import HomePage from "./pages/public/HomePage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}