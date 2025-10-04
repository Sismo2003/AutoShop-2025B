// Import Dependencies
import { forwardRef } from 'react';
import { formatDate, formatPhone, formatCurrency, getCurrentDateTime } from '../utils/dateUtils'

// import qr
import qrCode from '../utils/qr_code.png';

// Import Logo
import LOGO from 'assets/appLogo.svg'

// constantes para los horarios de cita
const appointmentTimes = [
  { id: "6-10", label: "6:00 AM - 10:00 AM" },
  { id: "8-12", label: "8:00 AM - 12:00 PM" },
  { id: "10-2", label: "10:00 AM - 2:00 PM" },
  { id: "2-4", label: "2:00 PM - 4:00 PM" },
  { id: "all day", label: "All Day" }
];

// ----------------------------------------------------------------------

const AppointmentPrintView = forwardRef(({ appointmentData }, ref) => {
  // Debug: Log para verificar que el componente se renderiza
  console.log('🖨️ AppointmentPrintView rendering with data:', appointmentData);
  console.log('🖨️ Ref received:', ref);

  // Función para manejar errores de carga del logo
  const handleLogoError = (e) => {
    console.warn('Logo could not be loaded:', e.target.src);
    // Mostrar un placeholder de texto si el logo no carga
    e.target.parentElement.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 8px; 
        text-align: center;
        font-weight: bold;
        padding: 4px;
        border: 1px dashed #999;
        color: #666;
        width: 100%;
        height: 100%;
      ">
        REBATE<br/>
        AUTO<br/>
        GLASS
      </div>
    `;
  };

  // Verificar si es pago con seguro
  const isInsurance = appointmentData?.has_insurance === true || appointmentData?.has_insurance === "true";

  // Función para obtener fecha actual en formato corto
  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  };

  // Función para determinar el precio de reparación mostrado
  const getRepairCashPrice = () => {
    if (isInsurance) {
      // Si es con seguro, mostrar $0.00 en REPAIR CASH PRICE
      return "$0.00";
    } else {
      // Si es cash payment, mostrar el cash price en REPAIR CASH PRICE
      return formatCurrency(appointmentData?.replacement_cash_price || 0);
    }
  };

  // Función para obtener el tipo de ubicación correctamente
  const getLocationType = () => {
    const locationType = appointmentData?.location_type;
    
    // Mapear los valores del formulario a los valores de display
    switch(locationType) {
      case 'address_customer':
        return 'HOME';
      case 'in_shop':
        return 'IN SHOP';
      case 'other_address':
        return 'OTHER ADDRESS';
      default:
        return 'HOME'; // default fallback
    }
  };

  // Función para obtener el label del horario de instalación
  const getInstallationTimeLabel = () => {
    const timeSlot = appointmentData?.installation_time;
    if (!timeSlot) return '';
    
    const timeOption = appointmentTimes.find(time => time.id === timeSlot);
    return timeOption ? timeOption.label : timeSlot;
  };

  return (
    <div ref={ref} className="print-container">
      {/* Estilos CSS para impresión - OPTIMIZADO PARA UNA SOLA PÁGINA CON LOGO MEJORADO */}
      <style>{`
        @media print {
          .print-container {
            margin: 0;
            padding: 18px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #000;
            background: white;
            width: 8.5in;
            min-height: 11in;
          }
          
          .no-print {
            display: none;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .company-logo {
            width: 60px;
            height: 60px;
          }
          
          .header-right-section {
            gap: 6px;
          }
        }
        
        .print-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 18px;
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          background: white;
          color: #000;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }
        
        .company-info {
          flex: 1;
        }
        
        .company-name {
          font-size: 22px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        
        .company-details {
          font-size: 10px;
          line-height: 1.3;
        }
        
        .company-logo {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          padding: 4px;
          flex-shrink: 0;
        }
        
        .company-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .header-right-section {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        
        .ticket-info {
          text-align: right;
          font-size: 14px;
          font-weight: bold;
        }
        
        .section {
          margin-bottom: 12px;
          border: 1px solid #000;
          padding: 10px;
        }
        
        .section-title {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 7px;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
        }
        
        .two-column {
          display: flex;
          gap: 12px;
        }
        
        .three-column {
          display: flex;
          gap: 8px;
        }
        
        .column {
          flex: 1;
        }
        
        .field-group {
          margin-bottom: 6px;
          display: flex;
          align-items: center;
        }
        
        .field-label {
          font-weight: bold;
          min-width: 85px;
          margin-right: 10px;
          font-size: 11px;
        }
        
        .field-value {
          flex: 1;
          border-bottom: 1px solid #000;
          padding: 3px 5px;
          min-height: 16px;
          font-size: 11px;
        }
        
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 4px;
        }
        
        .checkbox-grid-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          margin-top: 4px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
        }
        
        .checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid #000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
        }
        
        .checkbox.checked::after {
          content: "✓";
          font-size: 10px;
        }
        
        .vehicle-diagram {
          width: 80px;
          height: 50px;
          border: 1px solid #000;
          margin: 4px auto;
          position: relative;
          background: #f9f9f9;
        }
        
        .signature-section {
          margin-top: 12px;
          border-top: 1px solid #000;
          padding-top: 8px;
        }
        
        .signature-box {
          border: 1px solid #000;
          height: 35px;
          margin-top: 4px;
          position: relative;
        }
        
        .signature-label {
          position: absolute;
          bottom: 2px;
          left: 3px;
          font-size: 8px;
          font-weight: bold;
        }
        
        .warranty-text {
          font-size: 8px;
          margin: 8px 0;
          padding: 6px;
          border: 1px solid #000;
          background: #f9f9f9;
          line-height: 1.2;
        }
        
        .footer {
          margin-top: 8px;
          font-size: 8px;
          text-align: center;
          border-top: 1px solid #000;
          padding-top: 4px;
        }
        
        .payment-info {
          background: #f0f0f0;
          padding: 6px;
          border: 1px solid #000;
          margin: 4px 0;
        }
        
        .qr-placeholder {
          width: 80px;
          height: 80px;
          border: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          text-align: center;
        }

        .cash-payment-indicator {
          background: #ffffcc;
          border: 1px solid #000;
          padding: 4px;
          margin: 4px 0;
          font-weight: bold;
          text-align: center;
          font-size: 9px;
        }

        .compact-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 9px;
        }

        .inline-fields {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .inline-field {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
        }

        .inline-field .field-label {
          min-width: auto;
          margin-right: 4px;
        }

        .inline-field .field-value {
          min-width: 60px;
          padding: 1px 2px;
        }

        @media screen and (max-width: 768px) {
          .company-logo {
            width: 55px;
            height: 55px;
          }
          
          .header-right-section {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>

      {/* HEADER - MEJORADO CON LOGO INTEGRADO */}
      <div className="header">
        <div className="company-info">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {/* Logo integrado con la información de la empresa */}
            <div className="company-logo">
              <img
                src={LOGO}
                alt="Rebate Auto Glass Logo"
                onError={handleLogoError}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="company-name">REBATE AUTO GLASS</div>
              <div className="company-details">
                1947 N Lindsay Rd, Suite 107, Mesa, AZ 85213<br />
                Phone 480-923-9000 | Fax 480 534-8891 | rebateautoglass@gmail.com<br />
                <strong>LIFETIME WORKMANSHIP WARRANTY</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-right-section">
          <div className="ticket-info">
            TICKET# {appointmentData?.id || 'N/A'}<br />
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              {getCurrentDate()}
            </div>
          </div>
          <div className="qr-placeholder">
            <img
              src={qrCode}
              alt="QR Code"
              style={{ width: 'auto', height: 'auto', padding: '4px', maxWidth: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* TECNICOS - COMPACTADO */}
      <div className="compact-info">
        <span><strong>Service Advisor:</strong> {appointmentData?.service_advisor || '_______'}</span>
        <span><strong>Tech:</strong> {appointmentData?.tech_name || '_______'}</span>
        <span><strong>Sales Person:</strong> {appointmentData?.sales_person || '_______'}</span>
      </div>

      {/* CUSTOMER & VEHICLE SECTION - COMBINADO */}
      <div className="section">
        <div className="section-title">Customer & Vehicle Information</div>
        
        <div className="two-column">
          <div className="column">
            <div className="field-group">
              <span className="field-label">Customer:</span>
              <span className="field-value">
                {appointmentData?.customer_name || ''} ({formatPhone(appointmentData?.customer_phone)})
              </span>
            </div>
            {appointmentData?.customer_alt_phone && (
              <div className="field-group">
                <span className="field-label">Alt. Phone:</span>
                <span className="field-value">
                  {formatPhone(appointmentData?.customer_alt_phone)}
                </span>
              </div>
            )}
            <div className="field-group">
              <span className="field-label">Address:</span>
              <span className="field-value">
                { appointmentData?.customer_address ? 
                 `${appointmentData.customer_address}, ${appointmentData.customer_city}, ${appointmentData.customer_state} ${appointmentData.customer_zip}` : 
                 ''}
              </span>
            </div>
            <div className="field-group">
              <span className="field-label">Cross St:</span>
              <span className="field-value">
                {appointmentData?.customer_cross_street || appointmentData?.cross_street || ''}
              </span>
            </div>
          </div>
          
          <div className="column">
            <div className="field-group">
              <span className="field-label">Vehicle:</span>
              <span className="field-value">
                {appointmentData?.vehicle_year} {appointmentData?.vehicle_make} {appointmentData?.vehicle_model}
              </span>
            </div>
            <div className="field-group">
              <span className="field-label">VIN:</span>
              <span className="field-value">{appointmentData?.vin}</span>
            </div>
            <div className="inline-fields" style={{ marginTop: '4px' }}>
              <div className="inline-field">
                <span className="field-label">Color:</span>
                <span className="field-value">{appointmentData?.vehicle_color}</span>
              </div>
              <div className="inline-field">
                <span className="field-label">Part #:</span>
                <span className="field-value">{appointmentData?.part_number}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>2dr <span className={`checkbox ${appointmentData?.has_2d ? 'checked' : ''}`}></span></span>
                <span>4dr <span className={`checkbox ${appointmentData?.has_4d ? 'checked' : ''}`}></span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSURANCE & PAYMENT SECTION - COMBINADO */}
      <div className="section">
        <div className="section-title">Insurance & Payment Information</div>
        
        {isInsurance ? (
          <div className="three-column">
            <div className="column">
              <div className="field-group">
                <span className="field-label">Company:</span>
                <span className="field-value">{appointmentData?.insurance_company_name || ''}</span>
              </div>
              <div className="field-group">
                <span className="field-label">Policy #:</span>
                <span className="field-value">{appointmentData?.policy_number || ''}</span>
              </div>
            </div>
            <div className="column">
              <div className="field-group">
                <span className="field-label">Phone:</span>
                <span className="field-value">{formatPhone(appointmentData?.insurance_phone)}</span>
              </div>
              <div className="field-group">
                <span className="field-label">Loss Date:</span>
                <span className="field-value">{formatDate(appointmentData?.date_of_loss)}</span>
              </div>
            </div>
            <div className="column">
              <div className="field-group">
                <span className="field-label">Deductible:</span>
                <span className="field-value">{formatCurrency(appointmentData?.glass_deductible)}</span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '9px' }}>
                <strong>REBATE:</strong><br />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span><span className={`checkbox ${appointmentData?.rebate_type === 'check' ? 'checked' : ''}`}></span> Check</span>
                  <span><span className={`checkbox ${appointmentData?.rebate_type === 'cash' ? 'checked' : ''}`}></span> Cash</span>
                </div>
                <strong>{formatCurrency(appointmentData?.rebate_amount)}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="cash-payment-indicator">
            💵 CASH PAYMENT - Amount: <strong>{formatCurrency(appointmentData?.replacement_cash_price)}</strong>
          </div>
        )}
      </div>

      {/* GLASS WORK SECTION - OPTIMIZADO */}
      <div className="section">
        <div className="section-title">Glass Work & Features</div>
        
        <div className="two-column">
          <div className="column">
            {/* Vehicle Diagram - Más pequeño */}
            <div style={{ textAlign: 'center' }}>
              <div className="vehicle-diagram">
                <div style={{ 
                  position: 'absolute', 
                  top: '3px', 
                  left: '6px', 
                  right: '6px', 
                  height: '12px', 
                  border: '1px solid #666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6px',
                  background: appointmentData?.has_windshield ? '#000' : 'transparent',
                  color: appointmentData?.has_windshield ? '#fff' : '#000'
                }}>
                  WINDSHIELD
                </div>
                
                <div style={{ 
                  position: 'absolute', 
                  left: '3px', 
                  top: '15px', 
                  bottom: '15px', 
                  width: '10px',
                  border: '1px solid #666',
                  background: appointmentData?.has_door_glass ? '#000' : 'transparent'
                }}></div>
                
                <div style={{ 
                  position: 'absolute', 
                  right: '3px', 
                  top: '15px', 
                  bottom: '15px', 
                  width: '10px',
                  border: '1px solid #666',
                  background: appointmentData?.has_door_glass ? '#000' : 'transparent'
                }}></div>
                
                <div style={{ 
                  position: 'absolute', 
                  bottom: '3px', 
                  left: '6px', 
                  right: '6px', 
                  height: '12px', 
                  border: '1px solid #666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6px',
                  background: appointmentData?.has_back_glass ? '#000' : 'transparent',
                  color: appointmentData?.has_back_glass ? '#fff' : '#000'
                }}>
                  BACK
                </div>
              </div>
            </div>

            {/* Glass Types Grid */}
            <div className="checkbox-grid">
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_windshield ? 'checked' : ''}`}></span>
                <span>WINDSHIELD</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_door_glass ? 'checked' : ''}`}></span>
                <span>DOOR</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_back_glass ? 'checked' : ''}`}></span>
                <span>BACK GLASS</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_quarter_glass ? 'checked' : ''}`}></span>
                <span>QUARTER</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_vent_glass ? 'checked' : ''}`}></span>
                <span>VENT</span>
              </div>
            </div>
          </div>

          <div className="column">
            {/* Features Grid - Compactado CON ANTENNA */}
            <div className="checkbox-grid-features">
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_ldws ? 'checked' : ''}`}></span>
                <span>LDWS</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_rain_sensor ? 'checked' : ''}`}></span>
                <span>RAIN SENSOR</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_tint_strip ? 'checked' : ''}`}></span>
                <span>TINT STRIP</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_windshield_tint ? 'checked' : ''}`}></span>
                <span>WINDSHIELD TINT</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_hud ? 'checked' : ''}`}></span>
                <span>HUD</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_heated ? 'checked' : ''}`}></span>
                <span>HEATED</span>
              </div>
              <div className="checkbox-item">
                <span className={`checkbox ${appointmentData?.has_antenna ? 'checked' : ''}`}></span>
                <span>ANTENNA</span>
              </div>
            </div>
            
            <div style={{ marginTop: '6px', fontSize: '8px' }}>
              <strong>MOLDING:</strong> 
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span><span className={`checkbox ${appointmentData?.has_black ? 'checked' : ''}`}></span> BLACK</span>
                <span><span className={`checkbox ${appointmentData?.has_chrome ? 'checked' : ''}`}></span> CHROME</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INSTALLATION SECTION - COMPACTADO */}
      <div className="section">
        <div className="section-title">Installation Details</div>
        
        <div className="inline-fields">
          <div className="inline-field">
            <span className="field-label">Date:</span>
            <span className="field-value" style={{ fontWeight: 'bold' }}>
              {formatDate(appointmentData?.installation_date)}
            </span>
          </div>
          <div className="inline-field">
            <span className="field-label">Time:</span>
            <span className="field-value" style={{ fontWeight: 'bold' }}>
              {getInstallationTimeLabel()}
            </span>
          </div>
          <div className="inline-field">
            <span className="field-label">Location:</span>
            <span className="field-value" style={{ fontWeight: 'bold' }}>
              {getLocationType()}
            </span>
          </div>
        </div>
        
        {appointmentData?.location_type === 'other_address' && (
          <div style={{ marginTop: '4px', fontSize: '8px', borderTop: '1px dashed #666', paddingTop: '4px' }}>
            <strong>Alt. Address ({appointmentData?.install_type_of_place || 'Other'}):</strong> {appointmentData?.business_name} - {appointmentData?.install_address}, {appointmentData?.install_city}, {appointmentData?.install_state} {appointmentData?.install_zip}<br />
            <strong>Cross St:</strong> {appointmentData?.install_cross_street || 'N/A'} | <strong>Contact:</strong> {appointmentData?.install_contact} - {formatPhone(appointmentData?.install_phone)}
          </div>
        )}
      </div>

      {/* REPAIR SECTION - SIMPLIFICADO */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span><strong>REPAIR:</strong> ______</span>
            <span><strong># REPAIRS:</strong> ______</span>
            <span><strong>CUST. INITIALS:</strong> ______</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>REPAIR CASH PRICE</strong><br />
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {getRepairCashPrice()}
            </div>
          </div>
        </div>
      </div>

      {/* WARRANTY TEXT - COMPACTADO */}
      <div className="warranty-text">
        <strong>AUTHORIZATION & WARRANTY:</strong> I authorize REBATE AUTO GLASS to repair the glass on the above vehicle. Chip repair is primarily to stop cracks from spreading. REBATE AUTO GLASS accepts no responsibility for cracks during repair. Should damage spread after repair, full repair cost will be applied toward windshield replacement. Repairs are 100% warranted for as long as you own your vehicle.
      </div>

      {/* SIGNATURE SECTIONS - COMPACTADO */}
      <div className="signature-section">
        <div className="two-column">
          <div className="column">
            <div style={{ fontSize: '8px', marginBottom: '2px' }}>
              <strong>CUSTOMER AUTHORIZATION SIGNATURE</strong><br />
              <small>I AUTHORIZE REBATE AUTO GLASS TO PERFORM THE REPLACEMENT OR REPAIR</small>
            </div>
            <div className="signature-box">
              <div className="signature-label">CUSTOMER SIGNATURE</div>
            </div>
          </div>
          
          <div className="column">
            <div style={{ fontSize: '8px', marginBottom: '2px' }}>
              <strong>TECHNICIAN ACKNOWLEDGEMENT</strong><br />
              <small>I CERTIFY BEST SERVICE PROVIDED AND CLIENT 110% SATISFIED</small>
            </div>
            <div className="signature-box">
              <div className="signature-label">TECHNICIAN SIGNATURE</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER - COMPACTADO */}
      <div className="footer">
        <strong>REBATE AUTO GLASS ACCEPTS ALL INSURANCE COMPANY PRICING</strong><br />
        Generated on {getCurrentDateTime()}
      </div>
    </div>
  );
});

AppointmentPrintView.displayName = 'AppointmentPrintView';

export default AppointmentPrintView;