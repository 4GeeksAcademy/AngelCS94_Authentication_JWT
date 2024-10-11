import React, { useEffect } from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";

const Private = () => {
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem("jwt-token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate])
  return (
    <div>Esta es una vista privada</div>
  )
}

export default Private