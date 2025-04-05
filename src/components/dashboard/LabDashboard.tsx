import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { FaFlask, FaUpload, FaFilePrescription, FaTasks, FaCheckCircle } from 'react-icons/fa';
import Layout from '../common/Layout';
import { prescriptionApi, labReportApi } from '../../services/api';
import { Prescription, LabReport, LabReportStatus } from '../../types';
import { toast } from 'react-toastify';

const LabDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ 
    prescriptionId: string, 
    reportId: string, 
    reportName: string 
  } | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Fetch prescriptions with pending lab reports
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await prescriptionApi.getPrescriptions(1, 20);
        if (response.success && response.data) {
          // Filter prescriptions that have lab reports with PENDING status
          const filtered = response.data.filter(prescription => 
            prescription.labReports.some(report => report.status === LabReportStatus.PENDING)
          );
          setPrescriptions(filtered);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Error loading lab reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, []);
  
  // Handle upload modal
  const openUploadModal = (prescriptionId: string, reportId: string, reportName: string) => {
    setSelectedReport({ prescriptionId, reportId, reportName });
    setNotes('');
    setUploadFile(null);
    setShowUploadModal(true);
  };
  
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedReport(null);
    setUploadFile(null);
    setNotes('');
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };
  
  // Handle lab report upload
  const handleUpload = async () => {
    if (!selectedReport || !uploadFile) return;
    
    setUploading(true);
    try {
      const response = await labReportApi.uploadLabReport(
        selectedReport.prescriptionId,
        selectedReport.reportId,
        uploadFile,
        notes
      );
      
      if (response.success && response.data) {
        toast.success('Lab report uploaded successfully');
        
        // Update the status in the UI
        setPrescriptions(prevPrescriptions => {
          return prevPrescriptions.map(prescription => {
            if (prescription.id === selectedReport.prescriptionId) {
              const updatedLabReports = prescription.labReports.map(report => {
                if (report.id === selectedReport.reportId) {
                  return { ...report, status: LabReportStatus.COMPLETED };
                }
                return report;
              });
              return { ...prescription, labReports: updatedLabReports };
            }
            return prescription;
          });
        });
        
        closeUploadModal();
      } else {
        toast.error(response.error || 'Failed to upload lab report');
      }
    } catch (error) {
      console.error('Error uploading lab report:', error);
      toast.error('Error uploading lab report');
    } finally {
      setUploading(false);
    }
  };
  
  // Count pending lab reports
  const getPendingCount = () => {
    let count = 0;
    prescriptions.forEach(prescription => {
      prescription.labReports.forEach(report => {
        if (report.status === LabReportStatus.PENDING) {
          count++;
        }
      });
    });
    return count;
  };
  
  // Count completed lab reports today
  const getCompletedTodayCount = () => {
    const today = new Date().toDateString();
    let count = 0;
    prescriptions.forEach(prescription => {
      prescription.labReports.forEach(report => {
        if (
          report.status === LabReportStatus.COMPLETED &&
          report.uploadedAt &&
          new Date(report.uploadedAt).toDateString() === today
        ) {
          count++;
        }
      });
    });
    return count;
  };
  
  return (
    <Layout title="Lab Dashboard">
      <Row className="mb-4">
        <Col md={6} lg={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                <FaFlask className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Pending Lab Reports</h6>
                <h3 className="mb-0 fw-bold">{getPendingCount()}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                <FaCheckCircle className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Completed Today</h6>
                <h3 className="mb-0 fw-bold">{getCompletedTodayCount()}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                <FaTasks className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Prescriptions</h6>
                <h3 className="mb-0 fw-bold">{prescriptions.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Pending Lab Reports</h5>
            <div>
              <span className="text-muted me-3">
                <FaFilePrescription className="me-1" /> 
                {getPendingCount()} reports pending
              </span>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Prescription ID</th>
                    <th>Patient</th>
                    <th>Test</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    // Map through lab reports to create rows for each report
                    prescription.labReports.map((report) => 
                      report.status === LabReportStatus.PENDING && (
                        <tr key={`${prescription.id}-${report.id}`}>
                          <td>
                            <small className="text-muted">#{prescription.id.slice(0, 8)}</small>
                          </td>
                          <td>{prescription.patientId.slice(0, 8)}</td>
                          <td>{report.name}</td>
                          <td>
                            <small>
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <Badge bg="info" className="status-badge">
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => openUploadModal(prescription.id, report.id, report.name)}
                            >
                              <FaUpload className="me-1" /> Upload
                            </Button>
                          </td>
                        </tr>
                      )
                    )
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaFlask size={32} className="text-muted mb-2" />
              <p className="text-muted mb-0">No pending lab reports</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Upload Lab Report Modal */}
      <Modal show={showUploadModal} onHide={closeUploadModal} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Upload Lab Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <p>
                <strong>Test:</strong> {selectedReport.reportName}<br />
                <strong>Prescription ID:</strong> #{selectedReport.prescriptionId.slice(0, 8)}
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Report File (PDF)</Form.Label>
                <Form.Control 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                />
                <Form.Text className="text-muted">
                  Supported formats: PDF, JPG, PNG
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  placeholder="Add notes about the lab report results..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={closeUploadModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpload} 
            disabled={!uploadFile || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Uploading...
              </>
            ) : 'Upload Report'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default LabDashboard; 