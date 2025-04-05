import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Form, InputGroup, Table, Badge, Button } from 'react-bootstrap';
import { FaSearch, FaUser, FaFileMedical, FaFilePrescription, FaFlask, FaCalendarAlt } from 'react-icons/fa';
import Layout from '../common/Layout';
import { patientApi, prescriptionApi } from '../../services/api';
import { Patient, Prescription, PrescriptionStatus, LabReportStatus, MedicineStatus } from '../../types';
import { Link } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({ patients: true, prescriptions: true });
  
  // Fetch patients and recent prescriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsResponse = await patientApi.getPatients(1, 5);
        if (patientsResponse.success && patientsResponse.data) {
          setPatients(patientsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(prev => ({ ...prev, patients: false }));
      }
      
      try {
        const prescriptionsResponse = await prescriptionApi.getPrescriptions(1, 10);
        if (prescriptionsResponse.success && prescriptionsResponse.data) {
          setRecentPrescriptions(prescriptionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(prev => ({ ...prev, prescriptions: false }));
      }
    };
    
    fetchData();
  }, []);
  
  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(prev => ({ ...prev, patients: true }));
    try {
      const response = await patientApi.getPatients(1, 5, searchTerm);
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  };
  
  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    let variant = 'secondary';
    let icon = null;
    
    switch (status) {
      case PrescriptionStatus.COMPLETED:
        variant = 'success';
        break;
      case PrescriptionStatus.IN_PROGRESS:
        variant = 'warning';
        break;
      case PrescriptionStatus.PENDING:
        variant = 'info';
        break;
      case LabReportStatus.COMPLETED:
        variant = 'success';
        break;
      case LabReportStatus.PENDING:
        variant = 'info';
        break;
      case MedicineStatus.DISPENSED:
        variant = 'success';
        break;
      case MedicineStatus.PENDING:
        variant = 'info';
        break;
      default:
        break;
    }
    
    return (
      <Badge bg={variant} className="status-badge">
        {icon} {status.replace('_', ' ')}
      </Badge>
    );
  };
  
  return (
    <Layout title="Doctor Dashboard">
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                <FaUser className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Patients</h6>
                <h3 className="mb-0 fw-bold">1,248</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                <FaFileMedical className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Today's Appointments</h6>
                <h3 className="mb-0 fw-bold">24</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                <FaFilePrescription className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Pending Prescriptions</h6>
                <h3 className="mb-0 fw-bold">7</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                <FaFlask className="text-info" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Lab Reports Pending</h6>
                <h3 className="mb-0 fw-bold">12</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={5} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Patient Search</h5>
                <Link to="/patients/register" className="btn btn-sm btn-primary">
                  + New Patient
                </Link>
              </div>
            </Card.Header>
            
            <Card.Body>
              <Form onSubmit={handleSearch} className="mb-4">
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch /> Search
                  </Button>
                </InputGroup>
              </Form>
              
              {loading.patients ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : patients.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age/Gender</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id}>
                          <td>
                            <small className="text-muted">#{patient.id.slice(0, 8)}</small>
                          </td>
                          <td>{patient.name}</td>
                          <td>
                            {patient.age} / {patient.gender.charAt(0)}
                          </td>
                          <td>
                            <Link to={`/patients/${patient.id}`} className="btn btn-sm btn-outline-primary">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No patients found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={7} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Recent Prescriptions</h5>
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-primary me-2" />
                  <span className="text-muted">Today, {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body>
              {loading.prescriptions ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : recentPrescriptions.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      <tr>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Diagnosis</th>
                        <th>Lab Status</th>
                        <th>Pharmacy</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPrescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                          <td>
                            <Link to={`/patients/${prescription.patientId}`} className="text-decoration-none">
                              {prescription.patientId.slice(0, 8)}
                            </Link>
                          </td>
                          <td>
                            <small>
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '150px' }}>
                            {prescription.diagnosis}
                          </td>
                          <td>
                            {prescription.labReports.length > 0 ? (
                              renderStatusBadge(prescription.labReports[0].status)
                            ) : (
                              <Badge bg="secondary" className="status-badge">N/A</Badge>
                            )}
                          </td>
                          <td>
                            {prescription.medicines.length > 0 ? (
                              renderStatusBadge(prescription.medicines[0].status)
                            ) : (
                              <Badge bg="secondary" className="status-badge">N/A</Badge>
                            )}
                          </td>
                          <td>
                            {renderStatusBadge(prescription.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No recent prescriptions</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default DoctorDashboard; 