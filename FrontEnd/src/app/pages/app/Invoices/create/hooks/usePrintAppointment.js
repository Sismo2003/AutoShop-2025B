// Import Dependencies
import { useState, useCallback } from 'react';

// Hook personalizado para manejar la impresión de appointments
// Archivo: src/hooks/usePrintAppointment.js

export const usePrintAppointment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  // Función para abrir el modal de impresión con los datos del appointment
  const openPrintModal = useCallback((data) => {
    console.log("hola");
    // Procesar y formatear los datos del appointment para la vista de impresión
    console.log('📋 Opening print modal with appointment data:', data);
    
    const processedData = {
      // Información básica del appointment
      id: data.id,
      
      // Información del cliente
      customer_name: data.customer_name || data.customer?.fullname,
      customer_phone: data.customer_phone || data.customer?.phone,
      customer_alt_phone: data.customer_alt_phone || data.customer?.secondary_phone,
      customer_email: data.customer_email || data.customer?.email,
      customer_address: data.customer_address || data.address?.street_address,
      customer_city: data.customer_city || data.address?.city,
      customer_state: data.customer_state || data.address?.state,
      customer_zip: data.customer_zip || data.address?.zipcode,
      customer_cross_street: data.cross_street || data.address?.main_cross_streets,
      
      // Información del vehículo
      vehicle_year: data.vehicle_year || data.vehicle?.year,
      vehicle_make: data.vehicle_make || data.vehicle?.make,
      vehicle_model: data.vehicle_model || data.vehicle?.model,
      vehicle_color: data.vehicle_color || data.vehicle?.color,
      vin: data.vin || data.vehicle?.vin,
      part_number: data.part_number,
      
      // Información de instalación
      installation_date: data.installation_date || data.appointment?.installation_date,
      installation_time: data.installation_time || data.appointment?.installation_time,
      location_type: data.location_type || data.appointment?.location_type,
      
      // Información del personal
      tech_name: data.tech_name,
      service_advisor: data.service_advisor,
      sales_person: data.sales_person || data.salesperson,
      origin: data.origin,
      
      // Información de pago/seguro
      has_insurance: data.has_insurance === true || data.has_insurance === "true" || data.appointment?.replacement_type === 'insurance',
      
      // Datos de seguro
      insurance_company_name: data.resultAPiData.insurance_company_name || data.resultAPiData.insurance_company,
      policy_number: data.policy_number,
      insurance_phone: data.insurance_phone,
      date_of_loss: data.date_of_loss,
      glass_deductible: data.glass_deductible,
      safelife: data.safelife,
      lynx_dispatch: data.lynx_dispatch || data.lynx,
      
      // Datos de rebate (para insurance)
      rebate_type: data.rebate_type,
      rebate_amount: data.rebate_amount || data.rebate_cash || data.rebate_check,
      
      // Datos de pago en efectivo
      replacement_cash_price: data.replacement_cash_price || data.price_cash,
      payment_method: data.resultAPiData.payment_method || data.resultAPiData.payment_type,
      
      // Tipos de vidrio (glass types) - Convertir 0/1 a boolean
      has_windshield: Boolean(data.has_windshield || data.windshield || data.winshield),
      has_door_glass: Boolean(data.has_door_glass || data.door_glass || data.front_door),
      has_back_glass: Boolean(data.has_back_glass || data.back_glass),
      has_quarter_glass: Boolean(data.has_quarter_glass || data.quarter_glass || data.quarter),
      has_vent_glass: Boolean(data.has_vent_glass || data.resultAPiData.vent_glass || data.resultAPiData.vent),
      has_antenna: Boolean(data.resultAPiData.has_antenna || data.resultAPiData.antenna),
      
      // Características técnicas del vidrio (glass features) - Convertir 0/1 a boolean
      has_2d: Boolean(data.has_2d || data.twoD),
      has_4d: Boolean(data.has_4d || data.fourD),
      has_ldws: Boolean(data.has_ldws || data.ldws || data.hud),
      has_rain_sensor: Boolean(data.has_rain_sensor || data.rain_sensor),
      has_tint_strip: Boolean(data.has_tint_strip || data.tint_strip),
      has_windshield_tint: Boolean(data.has_windshield_tint || data.windshield_tint || data.tint),
      has_chrome: Boolean(data.has_chrome || data.chrome || data.molding_chrome),
      has_black: Boolean(data.has_black || data.black || data.molding_black),
      has_hud: Boolean(data.has_hud || data.hud),
      has_heated: Boolean(data.has_heated || data.heated),
      
      // Dirección alternativa (si aplica)
      business_name: data.business_name || data.alternateAddress?.business_name,
      install_type_of_place: String(data.app_type_of_place).toUpperCase() || String(data.alternateAddress?.type_of_place).toUpperCase(),
      install_address: data.install_address || data.alternateAddress?.street_address,
      install_city: data.install_city || data.alternateAddress?.city,
      install_state: data.install_state || data.alternateAddress?.state,
      install_zip: data.install_zip || data.alternateAddress?.zipcode,
      install_contact: data.install_contact || data.contact_name,
      install_phone: data.install_phone || data.contact_phone,
      install_cross_street: data.install_cross_street || data.alternateAddress?.main_cross_streets,
      
      // Otros datos
      repair_price: data.repair_price || "0.00",
      comment: data.comment || data.appointment?.comment,
    };

    console.log('📋 Processed appointment data for printing:', processedData);
    setAppointmentData(processedData);
    setIsModalOpen(true);
  }, []);

  // Función para cerrar el modal de impresión
  const closePrintModal = useCallback(() => {
    setIsModalOpen(false);
    setAppointmentData(null);
  }, []);

  return {
    isModalOpen,
    appointmentData,
    openPrintModal,
    closePrintModal,
  };
};