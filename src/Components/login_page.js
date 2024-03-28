import { useState } from 'react';
import './login_page.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'; // Import axios for making HTTP requests
import {useNavigate}  from 'react-router-dom';

function Login_page() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      // Make a POST request to your backend forgot password endpoint
      const response = await axios.post('http://localhost:4000/users/forgetPass', { email: formData.email });
      console.log('Forgot Password request sent successfully');
      // Optionally, you can show a success message to the user
  
      // Navigate to the reset password page with the token received from the backend
      navigate(`/resetPass/${response.data.resetToken}`);
    } catch (error) {
      console.error('Forgot Password request failed:', error.response.data);
      // Handle error response from the backend
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make a POST request to your backend login endpoint
      const response = await axios.post('http://localhost:4000/users/login', formData);
      console.log('Login successful:', response.data);
      // You can handle the successful login response here
    } catch (error) {
      console.error('Login failed:', error.response.data);
      // You can handle the login failure here
    }
  };

  return (
    <section className="background-radial-gradient overflow-hidden vh-100">
      <style>
        {`.background-radial-gradient {
          background-color: hsl(218, 41%, 15%);
          background-image: radial-gradient(650px circle at 0% 0%,
            hsl(218, 41%, 35%) 15%,
            hsl(218, 41%, 30%) 35%,
            hsl(218, 41%, 20%) 75%,
            hsl(218, 41%, 19%) 80%,
            transparent 100%),
          radial-gradient(1250px circle at 100% 100%,
            hsl(218, 41%, 45%) 15%,
            hsl(218, 41%, 30%) 35%,
            hsl(218, 41%, 20%) 75%,
            hsl(218, 41%, 19%) 80%,
            transparent 100%);
        }`}
      </style>

      <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
        <div className="row gx-lg-5 align-items-center mb-5">
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1 className="my-5 display-5 fw-bold ls-tight" style={{ color: 'hsl(218, 81%, 95%)' }}>
              The best offer <br />
              <span style={{ color: 'hsl(218, 81%, 75%)' }}>for your business</span>
            </h1>
            <p className="mb-4 opacity-70" style={{ color: 'hsl(218, 81%, 85%)' }}>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Temporibus, expedita iusto veniam atque, magni tempora mollitia
              dolorum consequatur nulla, neque debitis eos reprehenderit quasi
              ab ipsum nisi dolorem modi. Quos?
            </p>
          </div>

          <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
            <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
            <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5">
                <form onSubmit={handleSubmit}>

                  <div className="form-outline mb-4">
                    <input
                      type="email"
                      id="form3Example3"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <label className="form-label" htmlFor="form3Example3">Email address</label>
                  </div>

                  <div className="form-outline mb-4">
                    <input
                      type="password"
                      id="form3Example4"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <label className="form-label" htmlFor="form3Example4">Password</label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block mb-4">Log In</button>

                  <div className="text-center mb-3">
                    <button type="button" className="btn btn-link" onClick={handleForgotPassword}>
                      Forgot Password?
                    </button>
                    
                  </div>
                  
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
  );
}

export default Login_page;
