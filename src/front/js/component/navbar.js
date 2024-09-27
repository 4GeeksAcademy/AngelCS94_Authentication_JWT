import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const LoginIni = localStorage.getItem("jwt-token");
        if (LoginIni) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwt-token");
        setIsAuthenticated(false);
        navigate("/");
    };

    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container">
                <Link to="/">
                    <span className="navbar-brand mb-0 h1">Home</span>
                </Link>
                <div className="ml-auto d-grid gap-2 d-md-flex justify-content-md-end">
                    {isAuthenticated ? (
                        <>
                            <Link to="/private">
                                <button className="btn btn-info">Private</button>
                            </Link>
                            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="btn btn-success">Login</button>
                            </Link>
                            <Link to="/signup">
                                <button className="btn btn-primary">Signup</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
