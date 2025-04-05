import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { patientApi } from '../../services/api';
import { Gender } from '../../types';
import { toast } from 'react-toastify';
import { FaUserPlus } from 'react-icons/fa';

// Validation schema for patient registration
const PatientSchema = Yup.object().shape({
  name: Yup.string().required('Full name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  age: Yup.number()
    .required('Age is required')
    .positive('Age must be positive')
    .integer('Age must be a whole number')
    .max(120, 'Age must be less than 120'),
  gender: Yup.mixed<Gender>()
    .oneOf(Object.values(Gender), 'Invalid gender')
    .required('Gender is required'),
});

interface PatientRegistrationFormProps {
  onSuccess?: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);

  // Setup formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      age: '',
      gender: '' as Gender,
    },
    validationSchema: PatientSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);
      setPatientId(null);

      try {
        const response = await patientApi.createPatient({
          name: values.name,
          phone: values.phone,
          age: Number(values.age),
          gender: values.gender,
        });

        if (response.success && response.data) {
          setSuccess(true);
          setPatientId(response.data.id);
          toast.success('Patient registered successfully');
          formik.resetForm();
          if (onSuccess) onSuccess();
        } else {
          setError(response.error || 'Failed to register patient');
          toast.error(response.error || 'Failed to register patient');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0 py-3">
        <div className="d-flex align-items-center">
          <FaUserPlus className="text-primary me-2" size={22} />
          <h5 className="mb-0 fw-bold">Patient Registration</h5>
        </div>
      </Card.Header>
      
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && patientId && (
          <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
            <div className="d-flex flex-column">
              <strong>Registration Successful!</strong>
              <span>Patient ID: {patientId}</span>
            </div>
          </Alert>
        )}
        
        <Form onSubmit={formik.handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter patient's full name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.name && !!formik.errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.phone && !!formik.errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  id="age"
                  name="age"
                  placeholder="Enter patient's age"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.age && !!formik.errors.age}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.age}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.gender && !!formik.errors.gender}
                >
                  <option value="">Select gender</option>
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.gender}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-end mt-3">
            <Button 
              variant="secondary" 
              className="me-2"
              onClick={() => formik.resetForm()}
            >
              Clear
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registering...
                </>
              ) : 'Register Patient'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PatientRegistrationForm; 