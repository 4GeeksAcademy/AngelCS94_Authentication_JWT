import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const Signup = () => {
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

    fetch(process.env.BACKEND_URL +"/signup", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        if (data.Msg === "Tu usuario a sido creado!"){
          navigate("/");
          localStorage.setItem("jwt-token", data.token);
        }else alert('Usuario, email o contraseña incorrecta')
        })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon1">Username</span>
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            aria-label="username"
            aria-describedby="basic-addon1"
            required
          />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon2">Email</span>
          <input
            type="email"
            className="form-control"
            placeholder="Tu email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            aria-label="email"
            aria-describedby="basic-addon2"
            required
          />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="basic-addon2">Password</span>
          <input
            type="password"
            className="form-control"
            placeholder="Tu contraseña"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            aria-label="password"
            aria-describedby="basic-addon2"
            required
          />
        </div>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
         
          <button className="btn btn-success"  type="submit">Submit</button>
         
          <Link to="/">
            <button className="btn btn-danger" type="button">Cancel</button>
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Signup