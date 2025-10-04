import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Page } from "components/shared/Page";
import {
	ArrowLeft,
	Car,
	Wrench,
	Shield,
	Phone,
	Calendar,
	DollarSign,
	CheckCircle,
	Clock,
	AlertCircle,
	User,
	MapPin,
	Building,
	Building2,
	Hash,
	Keyboard,
	Codesandbox, FileText, Settings, Plus, Search, Filter, Palette, DoorOpen
} from "lucide-react";

import {
	HiOutlineMail,
} from "react-icons/hi";

import {useDispatch, useSelector} from "react-redux";

import { DateTime } from 'luxon';

import { Link } from "react-router";

import { getCustomerAllHistoryThunk } from "slices/thunk"
import { useTwilioContext } from 'app/contexts/twilio/context.js';

const CustomerDetailDashboard = () => {
	const [activeTab, setActiveTab] = useState('overview');
	const { clientId } = useParams();
	const dispatch = useDispatch();
	const { customer_all_history_view,loading, customer_dosent_exist } = useSelector((state) => state.customer);

	const { startCall } = useTwilioContext();

	const [customer,setCustomer] = useState({});
	const [vehicles,setVehicles] = useState([]);
	const [appointments,setAppointments] = useState([]);

	// Busque para el carro
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedFilter, setSelectedFilter] = useState('all');


	// console.log("Customer: ",customer);
	// console.log("Vehicle: ",vehicles);
	// console.log("Appoitments: ",appointments);
	// console.log("Cliente: ",clientId);


	useEffect(() => {
		if(clientId){
			dispatch(getCustomerAllHistoryThunk(clientId));
		}
	}, [dispatch,clientId]);

	useEffect(() => {
		if(!customer_dosent_exist &&!loading && customer_all_history_view && Object.keys(customer_all_history_view).length > 0){
			setCustomer(customer_all_history_view?.customer);
			setVehicles(customer_all_history_view?.vehicles);
			setAppointments(customer_all_history_view?.appointments);
		}else{
			setCustomer({})
		}
	}, [customer_all_history_view, loading,customer_dosent_exist]);

	// Mock data para un cliente específico - esto vendría de tu API/props
	const customerData = {
		id: 1,
		name: "TODD BRULEY",
		phone: "+1 (623) 383 5164",
		email: "todd.bruley@email.com",
		address: "1234 Main St, Phoenix, AZ 85001",
		customerSince: "2020-03-15",
		totalSpent: 2450.00,
		insurance: {
			provider: "2015 Insurance Co.",
			phone: "+1 (800) 510 2291",
			policyNumber: "981685927",
			effectiveDate: "2024-01-01",
			expirationDate: "2024-12-31",
			coverageType: "Full Coverage",
			status: "active"
		},
		jobs: [
			{
				id: "JOB001",
				date: "2025-08-05",
				status: "completed",
				vehicle: "2020 Toyota Camry",
				vin: "4T1C11AK5LU123456",
				glassType: "Windshield",
				location: "Front",
				amount: 450.00,
				claimNumber: "CLM789456",
				description: "Complete windshield replacement due to rock chip crack",
				appointmentDate: "2025-08-05",
				completedDate: "2025-08-05",
				technician: "Mike Rodriguez",
				notes: "Customer satisfied with service. No issues reported."
			},
			{
				id: "JOB002",
				date: "2025-07-20",
				status: "scheduled",
				vehicle: "2018 Honda Accord",
				vin: "1HGCV1F30JA123789",
				glassType: "Side Window",
				location: "Driver Side",
				amount: 280.00,
				claimNumber: "CLM789457",
				description: "Driver side window replacement - vandalism damage",
				appointmentDate: "2025-08-10",
				completedDate: null,
				technician: "Sarah Johnson",
				notes: "Customer requested morning appointment"
			},
			{
				id: "JOB003",
				date: "2024-12-15",
				status: "completed",
				vehicle: "2020 Toyota Camry",
				vin: "4T1C11AK5LU123456",
				glassType: "Rear Window",
				location: "Back",
				amount: 380.00,
				claimNumber: "CLM789455",
				description: "Rear window replacement",
				appointmentDate: "2024-12-15",
				completedDate: "2024-12-15",
				technician: "Mike Rodriguez",
				notes: "Completed successfully"
			}
		],
		vehicles: [
			{
				id: "VEH001",
				year: "2020",
				make: "Toyota",
				model: "Camry",
				vin: "4T1C11AK5LU123456",
				color: "Silver",
				licensePlate: "ABC-1234",
				insurance: "2015 Insurance Co.",
				policyNumber: "981685927",
				coverageType: "Full Coverage",
				deductible: 500,
				lastService: "2025-08-05",
				totalJobs: 2,
				totalSpent: 830.00
			},
			{
				id: "VEH002",
				year: "2018",
				make: "Honda",
				model: "Accord",
				vin: "1HGCV1F30JA123789",
				color: "Blue",
				licensePlate: "XYZ-5678",
				insurance: "2015 Insurance Co.",
				policyNumber: "981685927",
				coverageType: "Full Coverage",
				deductible: 500,
				lastService: "2025-07-20",
				totalJobs: 1,
				totalSpent: 280.00
			}
		]
	};
	function formatPhoneNumber(phoneNumber) {
		if (!phoneNumber) return phoneNumber;

		// Eliminar todo lo que no sea dígito o signo +
		const cleaned = phoneNumber.toString().replace(/[^\d+]/g, '');

		// Patrón para números norteamericanos: +1 seguido de 10 dígitos
		const usPattern = /^\+1(\d{10})$/;

		if (usPattern.test(cleaned)) {
			const match = cleaned.match(usPattern);
			const [, number] = match;
			return `+1 (${number.substring(0, 3)}) ${number.substring(3, 6)} ${number.substring(6, 10)}`;
		}

		// Si no coincide con ningún formato conocido, devolver el original
		return phoneNumber;
	}


	const getStatusColor = (status) => {
		switch (status) {
			case 'completed':
				return 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-700';
			case 'scheduled':
				return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-700';
			case 'in_progress':
				return 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-700';
			case 'cancelled':
				return 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-700';
			default:
				return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-dark-900/8  dark:border-gray-600';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'completed':
				return <CheckCircle className="w-4 h-4" />;
			case 'scheduled':
				return <Calendar className="w-4 h-4" />;
			case 'in_progress':
				return <Clock className="w-4 h-4" />;
			default:
				return <AlertCircle className="w-4 h-4" />;
		}
	};

	const formatStatus = (status) => {
		return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
	};

	const handleCall = (phoneNumber) => {
		if (phoneNumber) {
			if (phoneNumber && window.confirm("Are you sure you want to call this number?")) {
				startCall(phoneNumber);
			}
		}
	};

	const formatDate = (dateString) => {
		const date = DateTime.fromISO(dateString);
		// Formato: 7 de agosto de 2025, 20:58
		// const formattedDate = date.toLocaleString(DateTime.DATETIME_FULL);

		const formattedDate = date.toFormat("MMMM d yyyy','  hh:mm a");
		return formattedDate;
	}

	// Filtrar vehículos
	const filteredVehicles = vehicles.filter(vehicle => {
		const matchesSearch =
			vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
			vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
			vehicle.year.includes(searchTerm) ||
			vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
			vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());

		if (selectedFilter === 'all') return matchesSearch;
		if (selectedFilter === 'recent') {
			const vehicleDate = new Date(vehicle.created_at);
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
			return matchesSearch && vehicleDate >= sixMonthsAgo;
		}
		return matchesSearch && vehicle.make.toLowerCase() === selectedFilter;
	});

	// Obtener marcas únicas para el filtro
	const uniqueMakes = [...new Set(vehicles.map(v => v.make.toLowerCase()))];

	// Función para obtener color del make
	const getMakeColor = (make) => {
		const colors = {
			'KIA': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
			'HONDA': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
			'TOYOTA': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
			'FORD': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
			'CHEVROLET': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
		};
		return colors[make.toUpperCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
	};

	const completedJobs = appointments.filter(job => job.status === 'completed').length;
	const scheduledJobs = appointments.filter(job => job.status === 'scheduled').length;
	const totalVehicles = vehicles.length;

	const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

	const getServicesString = (services) => {
		const serviceNames = {
			winshield: 'Windshield',
			front_door: 'Front Door',
			back_door: 'Back Door',
			quarter: 'Quarter',
			vent: 'Vent'
		};

		const activeServices = Object.entries(services)
		.filter(([ value]) => value === true)
		.map(([key]) => serviceNames[key])
		.filter(Boolean);

		return activeServices.length > 0 ? activeServices.join(', ') : 'No services selected';
	};

	// Función para obtener extras
	const getExtrasString = (job) => {
		const extras = {
			hud: 'HUD',
			heated: 'Heated',
			antenna: 'Antenna',
			rain_sensor: 'Rain Sensor',
			molding_black: 'Black Molding',
			molding_chrome: 'Chrome Molding',
			tint: 'Tint',
			tint_strip: 'Tint Strip',
			vin_etch: 'VIN Etch',
			green_blue: 'Green/Blue',
			gray: 'Gray',
			bronze: 'Bronze'
		};

		const activeExtras = Object.entries(extras)
		.filter(([key]) => job[key] === true)
		.map(([, value]) => value);

		return activeExtras.length > 0 ? activeExtras.join(', ') : 'No extras';
	};

	const hasInsurance = customer.insurance_name && customer.insurance_name !== 'NO INSURANCE';
	const isActive = hasInsurance && customer.customer_insurance_policy_number;

	return (
		<>
			{loading ? (
				// Estado de carga
				<div className="flex items-center justify-center min-h-96">
					<div className="text-center space-y-4">
						<div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin dark:border-gray-600 dark:border-t-blue-400"></div>
						<div className="space-y-2">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white">Loading Customer Data</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we retrieve the customer information...</p>
						</div>
					</div>
				</div>
			) : (isEmpty(customer) && customer_dosent_exist) ? (
				<div className="flex items-center justify-center min-h-96">
					<div className="text-center space-y-6 max-w-md">
						<div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
							<svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Not Found</h3>
							<p className="text-gray-500 dark:text-gray-400">
								We couldnt find a customer with the provided information. Please check the details and try again.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
								Search Again
							</button>
							<Link to='/app/clients/register' >
								<button
									className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
									Create New Customer
								</button>
							</Link>
						</div>
					</div>
				</div>
			) : (
				<div className="min-h-screen dark:bg-dark-900/8">
					<Page title={`Customer Details - ${customer.customer_fullname}`}>
						{/* Header */}
						<div className="bg-white dark:bg-dark-900/8 shadow-sm border-b border-gray-200 dark:border-gray-700">
							<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
								<div className="flex items-center justify-between h-16">
									<div className="flex items-center space-x-4">
										<Link to='/app/clients/all' className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
											<ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
										</Link>
										<div>
											<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{customer.customer_fullname}</h1>
											<p className="text-sm text-gray-500 dark:text-gray-400">Customer ID: #{customer.customer_id}</p>
										</div>
									</div>
									<div className="flex items-center space-x-3">
										<div className={`px-3 py-1 rounded-full text-xs font-medium ${
											customerData.insurance.status === 'active'
												? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
												: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
										}`}>
											{customerData.insurance.status === 'active' ? '✓ Insurance Active' : '⚠ Insurance Inactive'}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
								<div className="bg-white dark:bg-dark-900/8  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
									<div className="flex items-center">
										<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
											<Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
										</div>
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
											<p className="text-2xl font-semibold text-gray-900 dark:text-white">{appointments.length}</p>
										</div>
									</div>
								</div>

								<div className="bg-white dark:bg-dark-900/8  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
									<div className="flex items-center">
										<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
											<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
										</div>
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
											<p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedJobs}</p>
										</div>
									</div>
								</div>

								<div className="bg-white dark:bg-dark-900/8  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
									<div className="flex items-center">
										<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
											<Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
										</div>
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicles</p>
											<p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalVehicles}</p>
										</div>
									</div>
								</div>

								<div className="bg-white dark:bg-dark-900/8  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
									<div className="flex items-center">
										<div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
											<DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
										</div>
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
											<p className="text-2xl font-semibold text-gray-900 dark:text-white">${customerData.totalSpent.toFixed(2)}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Tabs Navigation */}
							<div className="bg-white dark:bg-dark-900/8  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
								<div className="border-b border-gray-200 dark:border-gray-600">
									<nav className="flex space-x-8 px-6" aria-label="Tabs">
										{[
											{ id: 'overview', name: 'Overview', icon: User },
											{ id: 'jobs', name: 'Jobs', icon: Wrench },
											{ id: 'vehicles', name: 'Vehicles', icon: Car },
											{ id: 'insurance', name: 'Insurance', icon: Shield }
										].map((tab) => {
											const Icon = tab.icon;
											return (
												<button
													key={tab.id}
													onClick={() => setActiveTab(tab.id)}
													className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
														activeTab === tab.id
															? 'border-blue-500 text-blue-600 dark:text-blue-400'
															: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
													}`}
												>
													<Icon className="w-4 h-4" />
													<span>{tab.name}</span>
												</button>
											);
										})}
									</nav>
								</div>

								<div className="p-6">
									{/* Overview Tab */}
									{activeTab === 'overview' && (
										<div className="space-y-6">
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
												{/* Customer Info */}
												<div className="space-y-4">
													<h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Information</h3>
													<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">

														{/* Customer phone */}
														<div
															onClick={() => handleCall(customer.customer_phone)}
															className="flex items-center space-x-2 cursor-pointer group"
														>
															<Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
															<span className="text-sm text-gray-900 dark:text-gray-100 group-hover:underline dark:group-hover:text-blue-500  group-hover:text-blue-500">
																{formatPhoneNumber(customer.customer_phone)}
															</span>
														</div>

														{/* Customer Secundary phone */}
														{customer.customer_secondary_phone ? (
															<div
																onClick={() => handleCall(customer.customer_secondary_phone)}
																className="flex items-center space-x-2 cursor-pointer group"
															>
																<Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100 group-hover:underline dark:group-hover:text-blue-500  group-hover:text-blue-500">
																{formatPhoneNumber(customer.customer_secondary_phone)}
															</span>
															</div>
														) : null}

														{/* Customer Email */}
														{customer.customer_email ? (
															<div className="flex items-center space-x-2">
																<HiOutlineMail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">{customer.customer_email}</span>
															</div>
														) : null}

														{/* Customer Address */}
														<div className="flex items-center space-x-2">
															<MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
															<span className="text-sm text-gray-900 dark:text-gray-100">{`${customer.customer_address_street }, ${customer.customer_address_city}, ${customer.customer_address_state} ${customer.customer_address_zipcode}`}</span>
														</div>

														{/* Customer apartment name */}
														{customer.customer_address_apartment_name ? (
															<div className="flex items-center space-x-2">
																<Building className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">Apartment Name: {customer.customer_address_apartment_name}</span>
															</div>
														) : null}

														{/* Customer Unit Number */}
														{customer.customer_address_unit_number ? (
															<div className="flex items-center space-x-2">
																<Hash className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">Unit: {customer.customer_address_unit_number}</span>
															</div>
														) : null}

														{/* Customer Building name */}
														{customer.customer_address_building ? (
															<div className="flex items-center space-x-2">
																<Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">Building: {customer.customer_address_building}</span>
															</div>
														) : null}

														{/* Customer Gate code */}
														{customer.customer_address_gate_code ? (
															<div className="flex items-center space-x-2">
																<Keyboard  className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">Gate Code: {customer.customer_address_gate_code}</span>
															</div>
														) : null}

														{/* Customer Business name */}
														{customer.customer_address_business_name ? (
															<div className="flex items-center space-x-2">
																<Codesandbox   className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">Business Name: {customer.customer_address_business_name}</span>
															</div>
														) : null}

														{/* Customer Date that was created */}
														{customer.created_at_customer_address ? (
															<div className="flex items-center space-x-2">
																<Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
																<span className="text-sm text-gray-900 dark:text-gray-100">Customer since: {formatDate(customer.created_at_customer_address)}</span>
															</div>
														) : null}

														{/* Customer special instruction for address */}
														{customer.customer_address_special_instructions ? (
															<div className="bg-gray-100/50 dark:bg-gray-700/50 border-l-3 border-amber-400 dark:border-amber-500 rounded-r-md px-3 py-2">
																<p className="text-sm text-gray-700 dark:text-gray-300 italic">
																	{customer.customer_address_special_instructions}
																</p>
															</div>
														) : null}

													</div>
												</div>

												{/* Quick Stats */}
												<div className="space-y-4">
													<h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Summary</h3>
													<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
														<div className="flex justify-between items-center">
															<span className="text-sm text-gray-600 dark:text-gray-400">Scheduled Jobs</span>
															<span className="text-sm font-medium text-blue-600 dark:text-blue-400">{scheduledJobs}</span>
														</div>
														<div className="flex justify-between items-center">
															<span className="text-sm text-gray-600 dark:text-gray-400">Last Registered Insurance</span>
															<span className="text-sm font-medium text-green-600 dark:text-green-400">
	                          {customer.insurance_name}
	                        </span>
														</div>
														<div className="flex justify-between items-center">
															<span className="text-sm text-gray-600 dark:text-gray-400">Average Job Value</span>
															<span className="text-sm font-medium text-gray-900 dark:text-white">
	                          ${(customerData.totalSpent / customerData.jobs.length).toFixed(2)}
	                        </span>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{/* Jobs - appoitments Tab */}
									{activeTab === 'jobs' && (
										<div className="space-y-4">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-medium text-gray-900 dark:text-white">Work Orders</h3>
												<div className="text-sm text-gray-500 dark:text-gray-400">
													{appointments.length} total jobs
												</div>
											</div>
											<div className="space-y-6">
												{appointments.map((job) => (
													<div
														key={job.id}
														className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 overflow-hidden"
													>
														{/* Header */}
														<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
															<div className="flex items-center justify-between">
																<div className="flex items-center space-x-4">
																	<div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
																		<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
																	</div>
																	<div>
																		<div className="text-lg font-bold text-gray-900 dark:text-white">INVOICE #{job.id}</div>
																		<div className="text-sm text-gray-600 dark:text-gray-300">
																			Created: {formatDate(job.created_at)}
																		</div>
																	</div>
																	<div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
																		{getStatusIcon(job.status)}
																		<span className="ml-1.5">{formatStatus(job.status)}</span>
																	</div>
																</div>

																<div className="text-right">
																	<div className="text-2xl font-bold text-gray-900 dark:text-white">
																		{job.price_cash ? `$${job.price_cash}` : 'Quote Pending'}
																	</div>
																	<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
																		<Shield className="w-3 h-3 mr-1" />
																		{job.safelife || job.policy_number || 'No claim'}
																	</div>
																</div>
															</div>
														</div>

														{/* Main Content */}
														<div className="p-6">
															<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
																{/* Vehicle Information */}
																<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
																	<div className="flex items-center mb-3">
																		<Car className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
																		<h4 className="font-semibold text-gray-900 dark:text-white">Vehicle Details</h4>
																	</div>
																	<div className="space-y-2 text-sm">
																		<div>
																			<span className="font-medium text-gray-900 dark:text-white">
																				{job.vehicle_year} {job.vehicle_make} {job.vehicle_model}
																			</span>
																			{job.vehicle_color && (
																				<span className="text-gray-500 dark:text-gray-400 ml-2">
																					• {job.vehicle_color}
																				</span>
																			)}
																		</div>
																		<div className="text-gray-500 dark:text-gray-400">
																			VIN: {job.vehicle_vin}
																		</div>
																		<div className="text-gray-500 dark:text-gray-400">
																			{job.vehicle_doors} doors
																		</div>
																	</div>
																</div>

																{/* Service Information */}
																<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
																	<div className="flex items-center mb-3">
																		<Settings className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
																		<h4 className="font-semibold text-gray-900 dark:text-white">Service Details</h4>
																	</div>
																	<div className="space-y-2 text-sm">
																		<div>
																			<span className="text-gray-500 dark:text-gray-400">Services:</span>
																			<div className="font-medium text-gray-900 dark:text-white">
																				{getServicesString({
																					winshield: job.winshield,
																					front_door: job.front_door,
																					back_door: job.back_door,
																					quarter: job.quarter,
																					vent: job.vent
																				})}
																			</div>
																		</div>
																		{job.vehicle_winshield_part_number && (
																			<div>
																				<span className="text-gray-500 dark:text-gray-400">Part #:</span>
																				<span className="font-medium text-gray-900 dark:text-white ml-1">
																					{job.vehicle_winshield_part_number}
																				</span>
																			</div>
																		)}
																		<div>
																			<span className="text-gray-500 dark:text-gray-400">Type:</span>
																			<span className="font-medium text-gray-900 dark:text-white ml-1 capitalize">
																				{job.replacement_type || 'Standard'}
																			</span>
																		</div>
																	</div>
																</div>

																{/* Assignment & Schedule */}
																<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
																	<div className="flex items-center mb-3">
																		<User className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
																		<h4 className="font-semibold text-gray-900 dark:text-white">Assignment</h4>
																	</div>
																	<div className="space-y-2 text-sm">
																		<div>
																			<span className="text-gray-500 dark:text-gray-400">Technician:</span>
																			<div className="font-medium text-gray-900 dark:text-white">
																				{job.tech_name || 'Not assigned'}
																			</div>
																		</div>
																		{job.service_advisor && (
																			<div>
																				<span className="text-gray-500 dark:text-gray-400">Advisor:</span>
																				<div className="font-medium text-gray-900 dark:text-white">
																					{job.service_advisor}
																				</div>
																			</div>
																		)}
																		<div className="flex items-center">
																			<Calendar className="w-3 h-3 text-gray-400 mr-1" />
																			<span className="text-gray-500 dark:text-gray-400 text-xs">
																				{formatDate(job.installation_date)} • {job.installation_time}
																			</span>
																		</div>
																	</div>
																</div>
															</div>

															{/* Address & Insurance */}
															<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
																<div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
																	<div className="flex items-center mb-3">
																		<MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
																		<h4 className="font-semibold text-gray-900 dark:text-white">Service Location</h4>
																	</div>
																	<div className="text-sm text-gray-900 dark:text-white">
																		{job.street_address}<br />
																		{job.city}, {job.state} {job.zipcode}
																		{job.business_name && (
																			<div className="text-gray-500 dark:text-gray-400 mt-1">
																				{job.business_name}
																			</div>
																		)}
																	</div>
																</div>

																<div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
																	<div className="flex items-center mb-3">
																		<Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
																		<h4 className="font-semibold text-gray-900 dark:text-white">Insurance</h4>
																	</div>
																	<div className="space-y-1 text-sm">
																		<div>
																			<span className="font-medium text-gray-900 dark:text-white">
																				{job.insurance_company}
																			</span>
																		</div>
																		<div className="text-gray-500 dark:text-gray-400">
																			Policy: {job.policy_number}
																		</div>
																		{job.insurance_phone && (
																			<div className="flex items-center text-gray-500 dark:text-gray-400">
																				<Phone className="w-3 h-3 mr-1" />
																				{job.insurance_phone}
																			</div>
																		)}
																		<div className="text-gray-500 dark:text-gray-400">
																			Deductible: ${job.glass_deductible}
																		</div>
																	</div>
																</div>
															</div>

															{/* Extras */}
															{getExtrasString(job) !== 'No extras' && (
																<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
																	<div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Extras & Options:</div>
																	<div className="text-sm text-blue-900 dark:text-blue-100">{getExtrasString(job)}</div>
																</div>
															)}

															{/* Comments */}
															{job.comment && (
																<div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
																	<div className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">Notes:</div>
																	<div className="text-sm text-yellow-900 dark:text-yellow-100">{job.comment}</div>
																</div>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Vehicles Tab */}
									{activeTab === 'vehicles' && (
										<>
											<div className="space-y-6">
												{/* Header con estadísticas mejoradas */}
												<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
													<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
														<div>
															<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
																Customer Vehicles
															</h3>
															<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
																<div className="flex items-center gap-2">
																	<Car className="w-4 h-4" />
																	<span>{vehicles.length} registered vehicles</span>
																</div>
																<div className="flex items-center gap-2">
																	<Calendar className="w-4 h-4" />
																	<span>Last added: {formatDate(vehicles[vehicles.length - 1].created_at)}</span>
																</div>
															</div>
														</div>
														<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
															<Plus className="w-4 h-4" />
															Add Vehicle
														</button>
													</div>
												</div>

												{/* Filtros y búsqueda */}
												<div className="flex flex-col sm:flex-row gap-4">
													<div className="relative flex-1">
														<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
														<input
															type="text"
															placeholder="Search vehicles by make, model, year, color, or VIN..."
															value={searchTerm}
															onChange={(e) => setSearchTerm(e.target.value)}
															className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
														/>
													</div>
													<div className="flex items-center gap-2">
														<Filter className="w-4 h-4 text-gray-400" />
														<select
															value={selectedFilter}
															onChange={(e) => setSelectedFilter(e.target.value)}
															className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
														>
															<option value="all">All Vehicles</option>
															<option value="recent">Recent (6 months)</option>
															{uniqueMakes.map(make => (
																<option key={make} value={make}>{make.toUpperCase()}</option>
															))}
														</select>
													</div>
												</div>

												{/* Grid de vehículos */}
												<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
													{filteredVehicles.map((vehicle) => (
														<div
															key={vehicle.id}
															className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer"
														>
															{/* Header del vehículo */}
															<div className="flex items-start justify-between mb-4">
																<div className="flex items-center space-x-3">
																	<div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
																		<Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
																	</div>
																	{ (vehicle.year && vehicle.make  && vehicle.make) ? (
																		<div>
																			<h4 className="text-lg font-bold text-gray-900 dark:text-white">
																				{vehicle.year} {vehicle.make}
																			</h4>
																			<p className="text-base font-medium text-gray-600 dark:text-gray-300">
																				{vehicle.model}
																			</p>
																		</div>
																	) : (
																		<div>
																			<h4 className="text-lg font-bold text-gray-900 dark:text-white">
																				No Vehicle Info
																			</h4>
																			<p className="text-xs font-medium text-gray-600 dark:text-gray-300">
																				Please add vehicle details
																			</p>
																		</div>
																	)}
																</div>
																<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMakeColor(vehicle.make)}`}>
																	{vehicle.make}
																</span>
															</div>

															{/* Información principal */}
															<div className="grid grid-cols-2 gap-4 mb-4">
																<div className="flex items-center space-x-2">
																	<Palette className="w-4 h-4 text-gray-400" />
																	<div>
																		<div className="text-xs text-gray-500 dark:text-gray-400">Color</div>
																		<div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
																			{vehicle.color ? vehicle.color.toLowerCase() : 'N/A'}
																		</div>
																	</div>
																</div>

																<div className="flex items-center space-x-2">
																	<DoorOpen className="w-4 h-4 text-gray-400" />
																	<div>
																		<div className="text-xs text-gray-500 dark:text-gray-400">Doors</div>
																		<div className="text-sm font-medium text-gray-900 dark:text-white">
																			{vehicle.doors} doors
																		</div>
																	</div>
																</div>
															</div>

															{/* VIN */}
															<div className="mb-4">
																<div className="flex items-center space-x-2 mb-1">
																	<Hash className="w-4 h-4 text-gray-400" />
																	<div className="text-xs text-gray-500 dark:text-gray-400">VIN Number</div>
																</div>
																<div className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
																	{vehicle.vin ? vehicle.vin : 'N/A'}
																</div>
															</div>

															{/* Información adicional */}
															<div className="space-y-3">
																<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
																	<div className="flex items-center space-x-2">
																		<Wrench className="w-4 h-4 text-orange-500" />
																		<div>
																			<div className="text-xs text-gray-500 dark:text-gray-400">Windshield Part</div>
																			{vehicle.winshield_part_number ? (
																				<div className="text-sm font-medium text-gray-900 dark:text-white">
																					{vehicle.winshield_part_number}
																				</div>
																			) : (
																				<div className="text-sm font-small text-gray-900 dark:text-white">
																					No part number
																				</div>
																			)}
																		</div>
																	</div>
																</div>

																<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
																	<span>Added: {formatDate(vehicle.created_at)}</span>
																	<span className="text-blue-600 dark:text-blue-400 font-medium">ID: {vehicle.id}</span>
																</div>
															</div>

															{/* Botones de acción */}
															<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
																<div className="flex gap-2">
																	<button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors">
																		Delete
																	</button>
																	<button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors">
																		Edit
																	</button>
																</div>
															</div>
														</div>
													))}
												</div>

												{/* Estado vacío */}
												{filteredVehicles.length === 0 && (
													<div className="text-center py-12">
														<Car className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
														<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
															No vehicles found
														</h3>
														<p className="text-gray-500 dark:text-gray-400 mb-4">
															{searchTerm || selectedFilter !== 'all'
																? 'Try adjusting your search or filters.'
																: 'Add your first vehicle to get started.'}
														</p>
														{(!searchTerm && selectedFilter === 'all') && (
															<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
																<Plus className="w-4 h-4" />
																Add Vehicle
															</button>
														)}
													</div>
												)}
											</div>
										</>
								)}

								{/* Insurance Tab */}
								{activeTab === 'insurance' && (
									<>
										<div className="space-y-6 max-w-6xl mx-auto p-6">
											{/* Header */}
											<div className="flex justify-between items-center">
												<h3 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance Information</h3>
												<div className={`px-4 py-2 rounded-full text-sm font-semibold ${
													isActive
														? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
														: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
												}`}>
													{isActive ? '✓ Active Policy' : '⚠ No Active Policy'}
												</div>
											</div>

											{/* Insurance Card */}
											<div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
												<div className="p-6">
													<div className="flex items-start space-x-6">
														<div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl shadow-inner">
															<Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
														</div>
														<div className="flex-1">
															<h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
																{customer.insurance_name || 'No Insurance Provider'}
															</h4>

															<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
																{/* Customer Information */}
																<div className="space-y-4">
																	<h5 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
																		Customer Details
																	</h5>
																	<div className="space-y-3">
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</div>
																			<div className="font-semibold text-gray-900 dark:text-white">
																				{customer.customer_fullname || 'N/A'}
																			</div>
																		</div>
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone Number</div>
																			<div className="font-semibold text-gray-900 dark:text-white flex items-center">
																				<Phone className="w-4 h-4 mr-2" />
																				{customer.customer_phone || 'N/A'}
																			</div>
																		</div>
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
																			<div className="font-semibold text-gray-900 dark:text-white">
																				{customer.customer_email || 'Not provided'}
																			</div>
																		</div>
																	</div>
																</div>

																{/* Insurance Information */}
																<div className="space-y-4">
																	<h5 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
																		Insurance Details
																	</h5>
																	<div className="space-y-3">
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Policy Number</div>
																			<div className="font-semibold text-gray-900 dark:text-white">
																				{customer.customer_insurance_policy_number || 'Not available'}
																			</div>
																		</div>
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Insurance Phone</div>
																			<div className="font-semibold text-gray-900 dark:text-white flex items-center">
																				<Phone className="w-4 h-4 mr-2" />
																				{customer.insurance_phone_number || 'N/A'}
																			</div>
																		</div>
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer ID</div>
																			<div className="font-semibold text-gray-900 dark:text-white">
																				#{customer.customer_id}
																			</div>
																		</div>
																	</div>
																</div>

																{/* Account Status */}
																<div className="space-y-4">
																	<h5 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-2">
																		Account Status
																	</h5>
																	<div className="space-y-3">
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created Date</div>
																			<div className="font-semibold text-gray-900 dark:text-white flex items-center">
																				<Calendar className="w-4 h-4 mr-2" />
																				{formatDate(customer.created_at_customer)}
																			</div>
																		</div>
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
																			<div className="font-semibold text-gray-900 dark:text-white flex items-center">
																				<Calendar className="w-4 h-4 mr-2" />
																				{formatDate(customer.last_updated_at_customer)}
																			</div>
																		</div>
																		<div>
																			<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Policy Status</div>
																			<div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
																				isActive
																					? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
																					: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
																			}`}>
																				{isActive ? '✓ Active' : '⚠ Inactive'}
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>

											{/* Appointments History */}
											<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-6">
												<div className="flex items-center mb-6">
													<FileText className="w-6 h-6 text-gray-600 dark:text-gray-400 mr-3" />
													<h4 className="text-xl font-bold text-gray-900 dark:text-white">Appointments History</h4>
													<span className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full">
														{appointments.length} appointments
													</span>
												</div>

												{appointments.length > 0 ? (
													<div className="space-y-4">
														{appointments.map((appointment) => {
															const vehicle = vehicles.find(v => v.id === appointment.vehicle_id) || {};
															return (
																<div key={appointment.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
																	<div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
																		{/* Appointment Details */}
																		<div className="flex-1 space-y-3">
																			<div className="flex items-start space-x-4">
																				<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
																					<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
																				</div>
																				<div>
																					<h5 className="text-lg font-semibold text-gray-900 dark:text-white">
																						Appointment #{appointment.id}
																					</h5>
																					<p className="text-sm text-gray-600 dark:text-gray-400">
																						{formatDate(appointment.installation_date)} - {appointment.installation_time}
																					</p>
																				</div>
																			</div>

																			{/* Vehicle & Address Info */}
																			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-12">
																				<div className="space-y-2">
																					<div className="flex items-center text-sm">
																						<Car className="w-4 h-4 text-gray-500 mr-2" />
																						<span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
																						<span className="ml-2 font-medium text-gray-900 dark:text-white">
																							{vehicle.year && vehicle.make && vehicle.model
																								? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
																								: 'Vehicle info not available'}
																						</span>
																					</div>
																					<div className="flex items-center text-sm">
																						<MapPin className="w-4 h-4 text-gray-500 mr-2" />
																						<span className="text-gray-600 dark:text-gray-400">Location:</span>
																						<span className="ml-2 font-medium text-gray-900 dark:text-white">
																							{appointment.street_address}, {appointment.city}, {appointment.state} {appointment.zipcode}
																						</span>
																					</div>
																				</div>
																				<div className="space-y-2">
																					<div className="flex items-center text-sm">
																						<Shield className="w-4 h-4 text-gray-500 mr-2" />
																						<span className="text-gray-600 dark:text-gray-400">Insurance:</span>
																						<span className="ml-2 font-medium text-gray-900 dark:text-white">
																							{appointment.insurance_company}
																						</span>
																					</div>
																					<div className="flex items-center text-sm">
																						<DollarSign className="w-4 h-4 text-gray-500 mr-2" />
																						<span className="text-gray-600 dark:text-gray-400">Deductible:</span>
																						<span className="ml-2 font-medium text-gray-900 dark:text-white">
																							${parseFloat(appointment.glass_deductible || 0).toFixed(2)}
																						</span>
																					</div>
																				</div>
																			</div>
																		</div>

																		{/* Status */}
																		<div className="flex flex-col items-end space-y-2">
																			<div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
																				{formatStatus(appointment.status)}
																			</div>
																			<div className="text-xs text-gray-500 dark:text-gray-400">
																				Type: {appointment.replacement_type}
																			</div>
																		</div>
																	</div>
																</div>
															);
														})}
													</div>
												) : (
													<div className="text-center py-12">
														<FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
														<p className="text-lg font-medium text-gray-500 dark:text-gray-400">No appointments found</p>
														<p className="text-sm text-gray-400 dark:text-gray-500 mt-2">This customer doesnt have any appointments yet.</p>
													</div>
												)}
											</div>
										</div>
									</>
								)}
								</div>
							</div>
						</div>
					</Page>
				</div>
			)}
		</>
	);
};

export default CustomerDetailDashboard;
