import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Simple App component directly embedded
const SimpleApp: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">MedClinic</h3>
            </div>
            <div className="card-body">
              <h5 className="card-title">Welcome to MedClinic</h5>
              <p className="card-text">
                A comprehensive healthcare management system for clinics and hospitals.
              </p>
              <hr />
              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-primary">Login</button>
                <button className="btn btn-primary">Get Started</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);
