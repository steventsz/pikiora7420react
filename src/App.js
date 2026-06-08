import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import Navigation from "./components/Navigation";

function Home() {
    return (
        <div>
            <h1>Piki Ora 7420</h1>
            <p>Welcome to the Piki Ora appointment booking frontend.</p>
        </div>
    );
}

function Doctors() {
    return (
        <div>
            <h1>Doctors</h1>
            <p>Doctor list page will be added here.</p>
        </div>
    );
}

function Slots() {
    return (
        <div>
            <h1>Appointment Slots</h1>
            <p>Available appointment slots will be added here.</p>
        </div>
    );
}

function Login() {
    return (
        <div>
            <h1>Login</h1>
            <p>Login form will be added here.</p>
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
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
