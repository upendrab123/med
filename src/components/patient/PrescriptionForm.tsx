import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { Formik, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { prescriptionApi } from '../../services/api';
import { Prescription, PrescriptionStatus } from '../../types';
import { toast } from 'react-toastify';
import { FaPlus, FaMinus, FaFilePrescription } from 'react-icons/fa';

// Validation schema for prescription form
const PrescriptionSchema = Yup.object().shape({
  diagnosis: Yup.string().required('Diagnosis is required'),
  symptoms: Yup.array().of(Yup.string()).min(1, 'At least one symptom is required'),
  medicines: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Medicine name is required'),
      dosage: Yup.string().required('Dosage is required'),
      frequency: Yup.string().required('Frequency is required'),
      duration: Yup.string().required('Duration is required'),
      notes: Yup.string(),
    })
  ),
  labReports: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Test name is required'),
      notes: Yup.string(),
    })
  ),
});

interface PrescriptionFormProps {
  patientId: string;
  doctorId: string;
  onSuccess?: (prescription: Prescription) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ 
  patientId, 
  doctorId, 
  onSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initial form values
  const initialValues = {
    diagnosis: '',
    symptoms: [''],
    medicines: [
      { name: '', dosage: '', frequency: '', duration: '', notes: '' }
    ],
    labReports: [
      { name: '', notes: '' }
    ],
  };
  
  // Handle form submission
  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Filter out empty items
      const symptoms = values.symptoms.filter(symptom => symptom.trim() !== '');
      const medicines = values.medicines.filter(med => med.name.trim() !== '');
      const labReports = values.labReports.filter(report => report.name.trim() !== '');
      
      const prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'> = {
        patientId,
        doctorId,
        diagnosis: values.diagnosis,
        symptoms,
        medicines: medicines.map(med => ({
          ...med,
          id: Math.random().toString(36).substring(2, 15),
          status: 'PENDING',
        })),
        labReports: labReports.map(report => ({
          ...report,
          id: Math.random().toString(36).substring(2, 15),
          status: 'PENDING',
        })),
        status: PrescriptionStatus.PENDING,
      };
      
      const response = await prescriptionApi.createPrescription(prescriptionData);
      
      if (response.success && response.data) {
        toast.success('Prescription created successfully');
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setError(response.error || 'Failed to create prescription');
        toast.error(response.error || 'Failed to create prescription');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white border-0 py-3">
        <div className="d-flex align-items-center">
          <FaFilePrescription className="text-primary me-2" size={22} />
          <h5 className="mb-0 fw-bold">New Prescription</h5>
        </div>
      </Card.Header>
      
      <Card.Body className="p-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={PrescriptionSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleSubmit, handleChange, handleBlur }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Diagnosis</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="diagnosis"
                  placeholder="Enter diagnosis details"
                  value={values.diagnosis}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.diagnosis && !!errors.diagnosis}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.diagnosis}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Symptoms</Form.Label>
                <FieldArray name="symptoms">
                  {({ push, remove }) => (
                    <>
                      {values.symptoms.map((_, index) => (
                        <InputGroup key={index} className="mb-2">
                          <Form.Control
                            name={`symptoms.${index}`}
                            placeholder="Enter symptom"
                            value={values.symptoms[index]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={
                              touched.symptoms && 
                              touched.symptoms[index] && 
                              Array.isArray(errors.symptoms) && 
                              !!errors.symptoms[index]
                            }
                          />
                          <Button 
                            variant="outline-danger" 
                            onClick={() => values.symptoms.length > 1 && remove(index)}
                          >
                            <FaMinus />
                          </Button>
                        </InputGroup>
                      ))}
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => push('')}
                        className="mt-2"
                      >
                        <FaPlus className="me-1" /> Add Symptom
                      </Button>
                      {Array.isArray(errors.symptoms) && typeof errors.symptoms !== 'string' && errors.symptoms.length === 0 && touched.symptoms && (
                        <div className="text-danger mt-1">
                          At least one symptom is required
                        </div>
                      )}
                    </>
                  )}
                </FieldArray>
              </Form.Group>
              
              <hr className="my-4" />
              
              <h6 className="mb-3">Medicines</h6>
              <FieldArray name="medicines">
                {({ push, remove }) => (
                  <>
                    {values.medicines.map((_, index) => (
                      <Card key={index} className="mb-3 border">
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <h6 className="mb-0">Medicine #{index + 1}</h6>
                            {values.medicines.length > 1 && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <FaMinus className="me-1" /> Remove
                              </Button>
                            )}
                          </div>
                          
                          <Row>
                            <Col md={12} className="mb-3">
                              <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                  name={`medicines.${index}.name`}
                                  placeholder="Enter medicine name"
                                  value={values.medicines[index].name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={
                                    touched.medicines && 
                                    touched.medicines[index] && 
                                    touched.medicines[index]?.name && 
                                    Array.isArray(errors.medicines) && 
                                    errors.medicines[index]?.name
                                  }
                                />
                                <ErrorMessage 
                                  name={`medicines.${index}.name`} 
                                  component="div" 
                                  className="text-danger" 
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={4} className="mb-3">
                              <Form.Group>
                                <Form.Label>Dosage</Form.Label>
                                <Form.Control
                                  name={`medicines.${index}.dosage`}
                                  placeholder="e.g., 500mg"
                                  value={values.medicines[index].dosage}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={
                                    touched.medicines && 
                                    touched.medicines[index] && 
                                    touched.medicines[index]?.dosage && 
                                    Array.isArray(errors.medicines) && 
                                    errors.medicines[index]?.dosage
                                  }
                                />
                                <ErrorMessage 
                                  name={`medicines.${index}.dosage`} 
                                  component="div" 
                                  className="text-danger" 
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={4} className="mb-3">
                              <Form.Group>
                                <Form.Label>Frequency</Form.Label>
                                <Form.Control
                                  name={`medicines.${index}.frequency`}
                                  placeholder="e.g., Twice a day"
                                  value={values.medicines[index].frequency}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={
                                    touched.medicines && 
                                    touched.medicines[index] && 
                                    touched.medicines[index]?.frequency && 
                                    Array.isArray(errors.medicines) && 
                                    errors.medicines[index]?.frequency
                                  }
                                />
                                <ErrorMessage 
                                  name={`medicines.${index}.frequency`} 
                                  component="div" 
                                  className="text-danger" 
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={4} className="mb-3">
                              <Form.Group>
                                <Form.Label>Duration</Form.Label>
                                <Form.Control
                                  name={`medicines.${index}.duration`}
                                  placeholder="e.g., 7 days"
                                  value={values.medicines[index].duration}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={
                                    touched.medicines && 
                                    touched.medicines[index] && 
                                    touched.medicines[index]?.duration && 
                                    Array.isArray(errors.medicines) && 
                                    errors.medicines[index]?.duration
                                  }
                                />
                                <ErrorMessage 
                                  name={`medicines.${index}.duration`} 
                                  component="div" 
                                  className="text-danger" 
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label>Notes (Optional)</Form.Label>
                                <Form.Control
                                  name={`medicines.${index}.notes`}
                                  placeholder="Enter additional notes"
                                  value={values.medicines[index].notes}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                    <Button 
                      variant="outline-primary" 
                      onClick={() => push({ name: '', dosage: '', frequency: '', duration: '', notes: '' })}
                      className="mb-4"
                    >
                      <FaPlus className="me-1" /> Add Medicine
                    </Button>
                  </>
                )}
              </FieldArray>
              
              <hr className="my-4" />
              
              <h6 className="mb-3">Lab Tests (Optional)</h6>
              <FieldArray name="labReports">
                {({ push, remove }) => (
                  <>
                    {values.labReports.map((_, index) => (
                      <Card key={index} className="mb-3 border">
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <h6 className="mb-0">Lab Test #{index + 1}</h6>
                            {values.labReports.length > 1 && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <FaMinus className="me-1" /> Remove
                              </Button>
                            )}
                          </div>
                          
                          <Row>
                            <Col md={12} className="mb-3">
                              <Form.Group>
                                <Form.Label>Test Name</Form.Label>
                                <Form.Control
                                  name={`labReports.${index}.name`}
                                  placeholder="Enter test name"
                                  value={values.labReports[index].name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={
                                    touched.labReports && 
                                    touched.labReports[index] && 
                                    touched.labReports[index]?.name && 
                                    Array.isArray(errors.labReports) && 
                                    errors.labReports[index]?.name
                                  }
                                />
                                <ErrorMessage 
                                  name={`labReports.${index}.name`} 
                                  component="div" 
                                  className="text-danger" 
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label>Notes (Optional)</Form.Label>
                                <Form.Control
                                  name={`labReports.${index}.notes`}
                                  placeholder="Enter additional instructions"
                                  value={values.labReports[index].notes}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                    <Button 
                      variant="outline-primary" 
                      onClick={() => push({ name: '', notes: '' })}
                      className="mb-4"
                    >
                      <FaPlus className="me-1" /> Add Lab Test
                    </Button>
                  </>
                )}
              </FieldArray>
              
              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Save Prescription'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default PrescriptionForm; 