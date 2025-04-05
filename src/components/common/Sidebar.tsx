import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  FaUserMd, 
  FaFlask, 
  FaPrescriptionBottleAlt, 
  FaUserCog, 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // If no user or not authenticated, don't render sidebar
  if (!user) return null;
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const navItems = [
      { 
        label: 'Dashboard', 
        path: '/dashboard', 
        icon: <FaHome size={18} />, 
        roles: [UserRole.DOCTOR, UserRole.LAB_STAFF, UserRole.PHARMACY_STAFF, UserRole.ADMIN] 
      },
      { 
        label: 'Patients', 
        path: '/patients', 
        icon: <FaUsers size={18} />, 
        roles: [UserRole.DOCTOR, UserRole.ADMIN] 
      },
      { 
        label: 'Prescriptions', 
        path: '/prescriptions', 
        icon: <FaUserMd size={18} />, 
        roles: [UserRole.DOCTOR] 
      },
      { 
        label: 'Lab Reports', 
        path: '/lab-reports', 
        icon: <FaFlask size={18} />, 
        roles: [UserRole.LAB_STAFF] 
      },
      { 
        label: 'Pharmacy', 
        path: '/pharmacy', 
        icon: <FaPrescriptionBottleAlt size={18} />, 
        roles: [UserRole.PHARMACY_STAFF] 
      },
      { 
        label: 'Schedule', 
        path: '/schedule', 
        icon: <FaCalendarAlt size={18} />, 
        roles: [UserRole.DOCTOR, UserRole.ADMIN]
      },
      { 
        label: 'Admin', 
        path: '/admin', 
        icon: <FaUserCog size={18} />, 
        roles: [UserRole.ADMIN] 
      }
    ];
    
    // Filter nav items based on user role
    return navItems.filter(item => item.roles.includes(user.role));
  };
  
  const navItems = getNavItems();
  
  return (
    <div className="sidebar bg-white shadow-sm d-flex flex-column" style={{ minHeight: '100vh', width: '240px' }}>
      <div className="p-4 border-bottom">
        <h5 className="fw-bold text-primary mb-0">MedClinic</h5>
      </div>
      
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <div className="bg-light rounded-circle p-2 me-2">
            <FaUserMd size={24} className="text-primary" />
          </div>
          <div>
            <p className="mb-0 fw-medium">{user.name}</p>
            <p className="mb-0 small text-muted">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      
      <div className="nav flex-column mt-2">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-link py-3 px-4 d-flex align-items-center ${location.pathname === item.path ? 'active bg-light text-primary' : 'text-secondary'}`}
          >
            <span className="me-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <button 
          onClick={() => logout()} 
          className="nav-link py-3 px-4 d-flex align-items-center text-secondary border-0 bg-transparent mt-auto"
          style={{ cursor: 'pointer' }}
        >
          <span className="me-3"><FaSignOutAlt size={18} /></span>
          <span>Logout</span>
        </button>
      </div>
      
      <div className="mt-auto p-3 border-top">
        <p className="small text-muted mb-0">&copy; 2023 MedClinic</p>
      </div>
    </div>
  );
};

export default Sidebar; 