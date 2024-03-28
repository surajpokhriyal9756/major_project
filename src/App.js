import { Route, Routes } from "react-router-dom";
import "./App.css";
import ResetPasswordPage from "./Components/ResetPasswordPage";
import Login_Page from "./Components/login_page";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login_Page />} />
      <Route path="/resetPass/:token" element={<ResetPasswordPage/>} />
    </Routes>
    // <Login_Page/>
  );
}

export default App;
