import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const Login = () => {
  const { store, actions } = useContext(Context);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const navigate = useNavigate();
  const handleSubmit = (event) => {
    event.preventDefault();
    
    fetch(process.env.BACKEND_URL +"/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        if (data.Msg === "Todos los datos estan ok"){
          navigate("/");
          localStorage.setItem("jwt-token", data.token);
        } else {
          alert('Usuario, email o contraseña incorrecta');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container d-flex justify-content-center">
      <div className="card p-4 shadow mt-5" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              id="username"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Tu email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              id="email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Tu contraseña"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              id="password"
              required
            />
          </div>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-success" type="submit">Submit</button>
            <Link to="/">
              <button className="btn btn-danger" type="button">Cancel</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
