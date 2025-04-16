// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import UserDashboardLayout from './User/components/Header';
import { Outlet } from 'react-router-dom'; // Add this import

function App() {

  return (
    <>
            {/* Global elements that appear on every page */}
            <Outlet /> {/* This renders the matched child route */}
    </>
  )
}

export default App

