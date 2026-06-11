import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import {Container} from "react-bootstrap";
import Navigation from "./components/Navigation";
import Login from "./components/Login";
import Register from "./components/Register";
import Appointments from "./components/Appointments";
import AdminDashboard from "./components/AdminDashboard";
import Doctors from "./components/Doctors";
import Slots from "./components/Slots";

function Home() {
    return (
        <Container>
            <h1>Piki Ora Clinic</h1>
            <p className="page-intro">
                Piki Ora Clinic is a professional community healthcare clinic founded in 2018 and located in
                Auckland, New Zealand. The clinic focuses on patient-centred care, friendly service, and reliable
                appointment support for everyday health needs. Patients can browse doctors, view available
                appointment slots, and manage their bookings online.
            </p>
        </Container>
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
