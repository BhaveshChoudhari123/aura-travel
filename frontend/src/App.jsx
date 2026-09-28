import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Planner from "./pages/Planner";
import TripResult from "./pages/TripResult";
import Explore from "./pages/Explore";
import RecentTrips from "./pages/RecentTrips";
import SharedTrip from "./pages/SharedTrip";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/trip" element={<TripResult />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/recent" element={<RecentTrips />} />
          <Route path="/shared/:ref" element={<SharedTrip />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<div className="container page"><div className="card">Page not found. <a href="/" style={{ color: "var(--primary)", fontWeight: 700 }}>Go home</a></div></div>} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
