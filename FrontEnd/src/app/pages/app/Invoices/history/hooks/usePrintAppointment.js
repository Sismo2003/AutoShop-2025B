// hooks/usePrintAppointment.js - Hook actualizado para manejar impresión desde modal de detalles
import { useState, useCallback } from 'react';

// Hook personalizado para manejar la impresión de appointments
export const usePrintAppointment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  // Función para abrir el modal de impresión con los datos del appointment
  const openPrintModal = useCallback((data) => {
    console.log('📋 Opening print modal with appointment data:', data);
    
    // Procesar y formatear los datos del appointment para la vista de impresión
    const processedData = {
      // Información básica del appointment
      id: data.id,
      
      // Información del cliente
      customer_name: data.customer_name || data.customer?.fullname || data.customer?.name,
      customer_phone: data.customer?.phone || data.customer_phone,
      customer_alt_phone: data.customer_alt_phone || data.customer?.secondary_phone || data.customer?.alt_phone,
      customer_email: data.customer_email || data.customer?.email,
      customer_address: data.customer_address || data.address?.street_address || data.customer?.address?.street,
      customer_city: data.customer_city || data.address?.city || data.customer?.address?.city,
      customer_state: data.customer_state || data.address?.state || data.customer?.address?.state,
      customer_zip: data.customer_zip || data.address?.zipcode || data.customer?.address?.zip,
      customer_cross_street: data.cross_street || data.address?.main_cross_streets || data.customer?.address?.cross_streets,
      
      // Información del vehículo - manejo mejorado de valores null/undefined
      vehicle_year: (data.vehicle_year && data.vehicle_year !== "null") ? data.vehicle_year : 
                   (data.vehicle?.year && data.vehicle.year !== "null") ? data.vehicle.year : "",
      vehicle_make: (data.vehicle_make && data.vehicle_make !== "null") ? data.vehicle_make : 
                   (data.vehicle?.make && data.vehicle.make !== "null") ? data.vehicle.make : "",
      vehicle_model: (data.vehicle_model && data.vehicle_model !== "null") ? data.vehicle_model : 
                    (data.vehicle?.model && data.vehicle.model !== "null") ? data.vehicle.model : "",
      vehicle_color: (data.vehicle_color && data.vehicle_color !== "null") ? data.vehicle_color : 
                    (data.vehicle?.color && data.vehicle.color !== "null") ? data.vehicle.color : "",
      vin: (data.vin && data.vin !== "null") ? data.vin : 
           (data.vehicle?.vin && data.vehicle.vin !== "null") ? data.vehicle.vin : "",
      part_number: (data.part_number && data.part_number !== "null") ? data.part_number : 
                  (data.vehicle?.part_number && data.vehicle.part_number !== "null") ? data.vehicle.part_number : "",
      
      // Información de instalación
      installation_date: data.installation_date || data.appointment?.installation_date,
      installation_time: data.installation_time || data.appointment?.installation_time,
      location_type: data.location_type || data.appointment?.location_type,
      
      // Información del personal
      tech_name: data.tech_name || data.appointment?.tech_name || "",
      service_advisor: data.service_advisor || data.appointment?.service_advisor || "",
      sales_person: data.sales_person || data.salesperson || data.appointment?.sales_person || "",
      origin: data.origin || data.appointment?.origin || "",
      edirect: data.edirect || data.appointment?.edirect || "",
      
      // Información de pago/seguro
      has_insurance: data.has_insurance === true || 
                    data.has_insurance === "true" || 
                    data.appointment?.replacement_type === 'insurance' ||
                    data.payment?.type === 'insurance',
      
      // Datos de seguro
      insurance_company_name: data.insurance_company_name || 
                             data.payment?.insurance?.company_name || 
                             data.resultAPiData?.insurance_company_name || 
                             data.resultAPiData?.insurance_company || "",
      policy_number: data.policy_number || data.payment?.insurance?.policy_number || "",
      insurance_phone: data.insurance_phone || data.payment?.insurance?.phone || "",
      date_of_loss: data.date_of_loss || data.payment?.insurance?.date_of_loss || "",
      glass_deductible: data.glass_deductible || data.payment?.insurance?.glass_deductible || 0,
      safelife: data.safelife || data.payment?.insurance?.safelife || "",
      lynx_dispatch: data.lynx_dispatch || data.lynx || data.payment?.insurance?.lynx || "",
      other_insurance_info: data.other_insurance_info || data.payment?.insurance?.other_info || "",
      
      // Datos de rebate (para insurance)
      rebate_type: data.rebate_type || 
                  (data.payment?.rebate?.cash_amount > 0 && data.payment?.rebate?.check_amount > 0 ? 'mixed' :
                   data.payment?.rebate?.cash_amount > 0 ? 'cash' :
                   data.payment?.rebate?.check_amount > 0 ? 'check' : ''),
      rebate_amount: data.rebate_amount || 
                    data.rebate_cash || 
                    data.rebate_check || 
                    data.payment?.rebate?.total_rebate || 0,
      rebate_observations: data.rebate_observations || data.payment?.rebate?.observations || "",
      
      // Datos de pago en efectivo
      replacement_cash_price: data.replacement_cash_price || 
                             data.price_cash || 
                             data.payment?.cash_price || 0,
      payment_method: data.resultAPiData?.payment_method || 
                     data.resultAPiData?.payment_type || 
                     data.payment?.type || "",
      
      // Tipos de vidrio (glass types) - Manejo mejorado de boolean/number
      has_windshield: Boolean(data.has_windshield || 
                             data.windshield || 
                             data.winshield || 
                             data.glass_work?.types?.windshield),
      has_door_glass: Boolean(data.has_door_glass || 
                             data.door_glass || 
                             data.front_door || 
                             data.glass_work?.types?.front_door || 
                             data.glass_work?.types?.back_door),
      has_back_glass: Boolean(data.has_back_glass || 
                             data.back_glass || 
                             data.glass_work?.types?.back_glass),
      has_quarter_glass: Boolean(data.has_quarter_glass || 
                                data.quarter_glass || 
                                data.quarter || 
                                data.glass_work?.types?.quarter_glass),
      has_vent_glass: Boolean(data.has_vent_glass || 
                             data.resultAPiData?.vent_glass || 
                             data.resultAPiData?.vent || 
                             data.glass_work?.types?.vent_glass),
      
      // Características técnicas del vidrio (glass features) 
      has_2d: Boolean(data.has_2d || 
                     data.twoD || 
                     (data.vehicle?.doors === "2") ||
                     (data.resultAPiData?.vehicle?.doors === "2")),
      has_4d: Boolean(data.has_4d || 
                     data.fourD || 
                     (data.vehicle?.doors === "4") ||
                     (data.resultAPiData?.vehicle?.doors === "4")),
      has_ldws: Boolean(data.has_ldws || 
                       data.ldws || 
                       data.hud || 
                       data.glass_work?.features?.ldws),
      has_rain_sensor: Boolean(data.has_rain_sensor || 
                              data.rain_sensor || 
                              data.glass_work?.features?.rain_sensor),
      has_tint_strip: Boolean(data.has_tint_strip || 
                             data.tint_strip || 
                             data.glass_work?.features?.tint_strip),
      has_windshield_tint: Boolean(data.has_windshield_tint || 
                                  data.windshield_tint || 
                                  data.tint || 
                                  data.glass_work?.features?.tint),
      has_chrome: Boolean(data.has_chrome || 
                         data.chrome || 
                         data.molding_chrome || 
                         data.glass_work?.features?.molding_chrome),
      has_black: Boolean(data.has_black || 
                        data.black || 
                        data.molding_black || 
                        data.glass_work?.features?.molding_black),
      has_hud: Boolean(data.has_hud || 
                      data.hud || 
                      data.glass_work?.features?.hud),
      has_heated: Boolean(data.has_heated || 
                         data.heated || 
                         data.glass_work?.features?.heated),
      has_antenna: Boolean(data.has_antenna || 
                          data.resultAPiData?.has_antenna || 
                          data.resultAPiData?.antenna || 
                          data.glass_work?.features?.antenna),
      
      // Dirección alternativa (si aplica)
      business_name: data.business_name || 
                    data.alternateAddress?.business_name || 
                    data.installation?.address?.business_name || "",
      app_type_of_place: data.app_type_of_place || 
                        data.alternateAddress?.type_of_place || 
                        data.installation?.address?.property_type || "",
      install_address: data.install_address || 
                      data.alternateAddress?.street_address || 
                      data.installation?.address?.street || "",
      install_city: data.install_city || 
                   data.alternateAddress?.city || 
                   data.installation?.address?.city || "",
      install_state: data.install_state || 
                    data.alternateAddress?.state || 
                    data.installation?.address?.state || "",
      install_zip: data.install_zip || 
                  data.alternateAddress?.zipcode || 
                  data.installation?.address?.zip || "",
      install_contact: data.resultAPiData?.installation?.contact_summary || 
                      data.contact_name || 
                      data.installation?.contact_name || "",
      install_phone: data.install_phone || 
                    data.contact_phone || 
                    data.installation?.contact_phone || "",
      install_cross_street: data.install_cross_street || 
                           data.alternateAddress?.main_cross_streets || 
                           data.installation?.address?.cross_streets || "",
      install_dept_name: data.install_dept_name || 
                        data.alternateAddress?.apartment_name || 
                        data.installation?.address?.apartment_name || "",
      install_building: data.install_building || 
                       data.alternateAddress?.building || 
                       data.installation?.address?.building || "",
      
      // Otros datos
      repair_price: data.repair_price || "0.00",
      comment: data.comment || data.appointment?.comment || "",
      
      // Datos adicionales para depuración
      resultAPiData: data.resultAPiData || data
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