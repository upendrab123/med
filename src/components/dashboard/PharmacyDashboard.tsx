import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { FaPills, FaCheckCircle, FaFilePrescription, FaClock, FaUserMd } from 'react-icons/fa';
import Layout from '../common/Layout';
import { prescriptionApi, pharmacyApi } from '../../services/api';
import { Prescription, Medicine, MedicineStatus } from '../../types';
import { toast } from 'react-toastify';

const PharmacyDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dispensing, setDispensing] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<{ [key: string]: boolean }>({});
  
  // Fetch prescriptions with pending medicines
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await prescriptionApi.getPrescriptions(1, 20);
        if (response.success && response.data) {
          // Filter prescriptions that have medicines with PENDING status
          const filtered = response.data.filter(prescription => 
            prescription.medicines.some(medicine => medicine.status === MedicineStatus.PENDING)
          );
          setPrescriptions(filtered);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Error loading prescriptions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, []);
  
  // Handle dispense modal
  const openDispenseModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    
    // Initialize selected medicines
    const initialSelection: { [key: string]: boolean } = {};
    prescription.medicines.forEach(medicine => {
      if (medicine.status === MedicineStatus.PENDING) {
        initialSelection[medicine.id] = false;
      }
    });
    
    setSelectedMedicines(initialSelection);
    setShowDispenseModal(true);
  };
  
  const closeDispenseModal = () => {
    setShowDispenseModal(false);
    setSelectedPrescription(null);
    setSelectedMedicines({});
  };
  
  // Handle medicine selection
  const toggleMedicineSelection = (medicineId: string) => {
    setSelectedMedicines(prev => ({
      ...prev,
      [medicineId]: !prev[medicineId]
    }));
  };
  
  // Check if any medicine is selected
  const anyMedicinesSelected = () => {
    return Object.values(selectedMedicines).some(selected => selected);
  };
  
  // Handle medicine dispense
  const handleDispense = async () => {
    if (!selectedPrescription) return;
    
    const medicineIds = Object.entries(selectedMedicines)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);
    
    if (medicineIds.length === 0) return;
    
    setDispensing(true);
    try {
      // For each selected medicine, mark as dispensed
      const updatePromises = medicineIds.map(medicineId => 
        pharmacyApi.updateMedicineStatus(
          selectedPrescription.id,
          medicineId,
          MedicineStatus.DISPENSED
        )
      );
      
      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast.success('Medicines dispensed successfully');
        
        // Update the UI
        setPrescriptions(prevPrescriptions => {
          return prevPrescriptions.map(prescription => {
            if (prescription.id === selectedPrescription.id) {
              const updatedMedicines = prescription.medicines.map(medicine => {
                if (medicineIds.includes(medicine.id)) {
                  return { ...medicine, status: MedicineStatus.DISPENSED };
                }
                return medicine;
              });
              return { ...prescription, medicines: updatedMedicines };
            }
            return prescription;
          });
        });
        
        closeDispenseModal();
      } else {
        toast.error('Failed to dispense some medicines');
      }
    } catch (error) {
      console.error('Error dispensing medicines:', error);
      toast.error('Error dispensing medicines');
    } finally {
      setDispensing(false);
    }
  };
  
  // Count pending medicines
  const getPendingCount = () => {
    let count = 0;
    prescriptions.forEach(prescription => {
      prescription.medicines.forEach(medicine => {
        if (medicine.status === MedicineStatus.PENDING) {
          count++;
        }
      });
    });
    return count;
  };
  
  // Count dispensed medicines today
  const getDispensedTodayCount = () => {
    const today = new Date().toDateString();
    let count = 0;
    prescriptions.forEach(prescription => {
      const updatedToday = new Date(prescription.updatedAt).toDateString() === today;
      if (updatedToday) {
        prescription.medicines.forEach(medicine => {
          if (medicine.status === MedicineStatus.DISPENSED) {
            count++;
          }
        });
      }
    });
    return count;
  };
  
  return (
    <Layout title="Pharmacy Dashboard">
      <Row className="mb-4">
        <Col md={6} lg={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                <FaPills className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Pending Medicines</h6>
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
                <h6 className="text-muted mb-1">Dispensed Today</h6>
                <h3 className="mb-0 fw-bold">{getDispensedTodayCount()}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                <FaFilePrescription className="text-info" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Prescriptions</h6>
                <h3 className="mb-0 fw-bold">{prescriptions.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Pending Prescriptions</h5>
            <div>
              <span className="text-muted me-3">
                <FaClock className="me-1" /> 
                {getPendingCount()} medicines pending
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
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Pending Medicines</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => {
                    const pendingMedicines = prescription.medicines.filter(
                      medicine => medicine.status === MedicineStatus.PENDING
                    );
                    
                    return (
                      <tr key={prescription.id}>
                        <td>
                          <small className="text-muted">#{prescription.id.slice(0, 8)}</small>
                        </td>
                        <td>{prescription.patientId.slice(0, 8)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUserMd className="text-primary me-1" size={14} />
                            <span>{prescription.doctorId.slice(0, 6)}</span>
                          </div>
                        </td>
                        <td>
                          <small>
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </small>
                        </td>
                        <td>{pendingMedicines.length}</td>
                        <td>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => openDispenseModal(prescription)}
                          >
                            Dispense
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaPills size={32} className="text-muted mb-2" />
              <p className="text-muted mb-0">No pending prescriptions</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Dispense Medicines Modal */}
      <Modal show={showDispenseModal} onHide={closeDispenseModal} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Dispense Medicines</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrescription && (
            <>
              <div className="mb-3">
                <p className="mb-1">
                  <strong>Prescription ID:</strong> #{selectedPrescription.id.slice(0, 8)}
                </p>
                <p className="mb-1">
                  <strong>Patient ID:</strong> {selectedPrescription.patientId.slice(0, 8)}
                </p>
                <p className="mb-0">
                  <strong>Date:</strong> {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <h6 className="mb-3">Pending Medicines</h6>
              
              {selectedPrescription.medicines
                .filter(medicine => medicine.status === MedicineStatus.PENDING)
                .map((medicine) => (
                <Card key={medicine.id} className="mb-2 border">
                  <Card.Body className="py-3">
                    <Form.Check 
                      type="checkbox"
                      id={`medicine-${medicine.id}`}
                      label={
                        <div className="ms-2">
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
                      }
                      checked={selectedMedicines[medicine.id] || false}
                      onChange={() => toggleMedicineSelection(medicine.id)}
                    />
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={closeDispenseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDispense} 
            disabled={!anyMedicinesSelected() || dispensing}
          >
            {dispensing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Dispensing...
              </>
            ) : 'Dispense Selected Medicines'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default PharmacyDashboard; 