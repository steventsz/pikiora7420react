import React, {useEffect, useState} from 'react';
import axios from "axios";
import base_url from "../constraints";

function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            setIsLogin(true);
            getCurrentUser(localStorage.getItem("token"));
        }
    }, []);

    function usernameHandler(e) {
        setUsername(e.target.value);
    }

    function passwordHandler(e) {
        setPassword(e.target.value);
    }

    function getCurrentUser(authToken) {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: base_url + "/auth/me/",
            headers: {
                'Authorization': 'Token ' + authToken
            }
        };

        axios.request(config)
            .then((response) => {
                setUser(response.data);
                localStorage.setItem("user", JSON.stringify(response.data));
            })
            .catch((error) => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setIsLogin(false);
            });
    }

    function login() {
        let data = JSON.stringify({
            "username": username,
            "password": password
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: base_url + "/auth/login/",
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setUser(response.data.user);
                setIsLogin(true);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));

                if (response.data.user && response.data.user.is_staff) {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/";
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    setError("Wrong username or password");
                } else if (error.request) {
                    setError("Backend server is not running. Please start Django on port 8000.");
                } else {
                    setError("Login failed. Please try again.");
                }
            });
    }

    function logout() {
        setUser(null);
        setIsLogin(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    return (
        isLogin ?
            <div>
                <h1>Login</h1>
                {user && <p>You are logged in as {user.username}</p>}
                <button onClick={logout}>Logout</button>
            </div> :
            <div>
                <h1>Login</h1>
                <p>Username: <input type="text" value={username} onChange={usernameHandler}/></p>
                <p>Password: <input type="password" value={password} onChange={passwordHandler}/></p>
                <p>{error}</p>
                <button onClick={login}>Login</button>
            </div>
    );
}

export default Login;
