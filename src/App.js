import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import Navigation from "./components/Navigation";
import Login from "./components/Login";
import Register from "./components/Register";
import Appointments from "./components/Appointments";
import AdminDashboard from "./components/AdminDashboard";
import Doctors from "./components/Doctors";
import Slots from "./components/Slots";

function Home() {
    return (
        <div>
            <h1>Piki Ora 7420</h1>
            <p>Welcome to the Piki Ora appointment booking frontend.</p>
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Navigation/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/doctors" element={<Doctors/>}/>
                    <Route path="/slots" element={<Slots/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/appointments" element={<Appointments/>}/>
                    <Route path="/admin" element={<AdminDashboard/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
