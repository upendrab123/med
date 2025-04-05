import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FaUserMd, FaLock } from 'react-icons/fa';

// Validation schema for login form
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loading, error } = useAuth();
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  // Setup formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setFormSubmitting(true);
      await login(values.username, values.password);
      setFormSubmitting(false);
    },
  });
  
  return (
    <Container fluid className="bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-0 shadow-sm overflow-hidden slide-in">
            <div className="bg-primary text-white p-4 text-center">
              <h2 className="mb-0 fw-bold">MedClinic</h2>
              <p className="mb-0">Healthcare Management System</p>
            </div>
            
            <Card.Body className="p-4">
              <h4 className="text-center mb-4 text-secondary">Sign In</h4>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaUserMd />
                    </span>
                    <Form.Control
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={formik.touched.username && !!formik.errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.username}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={formik.touched.password && !!formik.errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2"
                  disabled={formSubmitting || loading}
                >
                  {(formSubmitting || loading) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
              </Form>
            </Card.Body>
            
            <Card.Footer className="bg-white text-center p-3 border-0">
              <small className="text-muted">
                For demo: Username: doctor / Password: password
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage; 