import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { 
  FaCalendarAlt, 
  FaNotesMedical, 
  FaPrescriptionBottleAlt, 
  FaFlask, 
  FaFileMedical 
} from 'react-icons/fa';
import { Prescription, LabReportStatus, MedicineStatus } from '../../types';

interface PatientTimelineProps {
  prescriptions: Prescription[];
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({ prescriptions }) => {
  // Sort prescriptions by date (newest first)
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant = 'secondary';
    
    if (status === LabReportStatus.COMPLETED || status === MedicineStatus.DISPENSED) {
      variant = 'success';
    } else if (status === 'IN_PROGRESS') {
      variant = 'warning';
    } else if (status === LabReportStatus.PENDING || status === MedicineStatus.PENDING) {
      variant = 'info';
    }
    
    return (
      <Badge bg={variant} className="status-badge">
        {status.replace('_', ' ')}
      </Badge>
    );
  };
  
  return (
    <div className="timeline">
      {sortedPrescriptions.length > 0 ? (
        sortedPrescriptions.map((prescription) => (
          <div key={prescription.id} className="timeline-item slide-in">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-primary me-2" />
                  <span className="fw-bold">
                    {new Date(prescription.createdAt).toLocaleDateString()} at {new Date(prescription.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {renderStatusBadge(prescription.status)}
              </div>
              
              <Card className="mb-3 border-0 bg-light">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-start mb-2">
                    <FaNotesMedical className="text-primary mt-1 me-2" />
                    <div>
                      <h6 className="mb-1">Diagnosis</h6>
                      <p className="mb-0">{prescription.diagnosis}</p>
                    </div>
                  </div>
                  
                  {prescription.symptoms.length > 0 && (
                    <div className="d-flex align-items-start mt-3">
                      <FaFileMedical className="text-primary mt-1 me-2" />
                      <div>
                        <h6 className="mb-1">Symptoms</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {prescription.symptoms.map((symptom, index) => (
                            <Badge key={index} bg="light" text="dark" className="border me-1 mb-1">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
              
              {prescription.medicines.length > 0 && (
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaPrescriptionBottleAlt className="text-primary me-2" />
                    <h6 className="mb-0">Medicines</h6>
                  </div>
                  
                  {prescription.medicines.map((medicine) => (
                    <Card key={medicine.id} className="mb-2 border-0">
                      <Card.Body className="py-2 px-3 bg-white rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{medicine.name}</h6>
                            <p className="mb-0 text-muted small">
                              {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                            </p>
                            {medicine.notes && (
                              <p className="mb-0 small fst-italic mt-1">
                                Note: {medicine.notes}
                              </p>
                            )}
                          </div>
                          {renderStatusBadge(medicine.status)}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
              
              {prescription.labReports.length > 0 && (
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaFlask className="text-primary me-2" />
                    <h6 className="mb-0">Lab Reports</h6>
                  </div>
                  
                  {prescription.labReports.map((report) => (
                    <Card key={report.id} className="mb-2 border-0">
                      <Card.Body className="py-2 px-3 bg-white rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{report.name}</h6>
                            {report.notes && (
                              <p className="mb-0 small">
                                {report.notes}
                              </p>
                            )}
                            {report.uploadedAt && (
                              <p className="mb-0 text-muted small mt-1">
                                Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="d-flex align-items-center">
                            {renderStatusBadge(report.status)}
                            {report.reportUrl && (
                              <a 
                                href={report.reportUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-outline-primary ms-2"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4">
          <p className="text-muted">No medical records found.</p>
        </div>
      )}
    </div>
  );
};

export default PatientTimeline; 