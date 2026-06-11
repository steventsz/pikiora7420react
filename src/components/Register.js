import React, {useState} from 'react';
import axios from "axios";
import base_url from "../constraints";

function Register(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirm, setPasswordConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    function usernameHandler(e) {
        setUsername(e.target.value);
    }

    function passwordHandler(e) {
        setPassword(e.target.value);
    }

    function passwordConfirmHandler(e) {
        setPasswordConfirm(e.target.value);
    }

    function emailHandler(e) {
        setEmail(e.target.value);
    }

    function register() {
        let data = JSON.stringify({
            "username": username,
            "email": email,
            "password": password,
            "password_confirm": password_confirm
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: base_url + "/auth/register/",
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));

                if (response.data.user && response.data.user.is_staff) {
                    window.location.href = "/admin";
                } else {
                    window.location.href = "/";
                }
            })
            .catch((error) => {
                setError("Registration failed. Please check your details.");
            });
    }

    return (
        <div>
            <h1>Register</h1>
            <p>Username: <input type="text" value={username} onChange={usernameHandler}/></p>
            <p>Email: <input type="email" value={email} onChange={emailHandler}/></p>
            <p>Password: <input type="password" value={password} onChange={passwordHandler}/></p>
            <p>Confirm Password: <input type="password" value={password_confirm} onChange={passwordConfirmHandler}/></p>
            <p>{error}</p>
            <button type="submit" onClick={register}>Register</button>
        </div>
    );
}

export default Register;
