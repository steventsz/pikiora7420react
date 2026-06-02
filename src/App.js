import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router";
import Navigation from "./components/Navigation";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <div className="App">
          <Navigation/>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
