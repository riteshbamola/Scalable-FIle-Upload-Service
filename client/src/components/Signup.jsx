import React, { useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";


const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="" />
      </div>

      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="" />
          </div>

          <div className="login-center">
            <h2>Create an account</h2>
            <p>Please enter your details</p>

            <form>
              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email" />

              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>

              <div className="pass-input-div">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                />
                {showConfirmPassword ? (
                  <FaEyeSlash
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                ) : (
                  <FaEye
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                )}
              </div>

              <div className="login-center-buttons">
                <button type="button">Sign Up</button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Already have an account? <Link to="/login">Log In</Link>
         </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;
