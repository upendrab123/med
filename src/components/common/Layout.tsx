import React, { ReactNode } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-grow-1 bg-light" style={{ minHeight: '100vh' }}>
        <Container fluid className="py-4">
          {title && (
            <Row className="mb-4">
              <Col>
                <h1 className="fw-bold">{title}</h1>
              </Col>
            </Row>
          )}
          
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout; 