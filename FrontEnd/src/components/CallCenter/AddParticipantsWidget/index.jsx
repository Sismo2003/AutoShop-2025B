import { useState } from 'react';
import {
	XMarkIcon,
	PhoneIcon,
	MagnifyingGlassIcon,
	UserIcon,
	PlusIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTwilioContext } from 'app/contexts/twilio/context';

const AddParticipantWidget = () => {
	const {
		showAddParticipant,
		setShowAddParticipantWidget,
		contacts, // Lista de contactos disponibles
		addParticipantToCall,
		
	} = useTwilioContext();
	
	const [searchTerm, setSearchTerm] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' o 'manual'
	const [isLoading, setIsLoading] = useState(false);
	
	// Filtrar contactos basado en el término de búsqueda
	const filteredContacts = contacts?.filter(contact =>
		contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		contact.phone?.includes(searchTerm)
	) || [];
	
	const handleAddContact = async (contact) => {
		setIsLoading(true);
		try {
			// await addParticipantToCall(contact.phone, contact.name);
			await addParticipantToCall(contact);
			setShowAddParticipantWidget(false);
		} catch (error) {
			console.error('Error agregando participante:', error);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleAddManualNumber = async () => {
		if (!phoneNumber.trim()) return;
		
		setIsLoading(true);
		try {
			await addParticipantToCall({phone : phoneNumber.trim() });
			setPhoneNumber('');
			setShowAddParticipantWidget(false);
		} catch (error) {
			console.error('Error agregando participante:', error);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleClose = () => {
		setShowAddParticipantWidget(false);
		setSearchTerm('');
		setPhoneNumber('');
		setActiveTab('contacts');
	};
	
	if (!showAddParticipant) return null;
	
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
				onClick={handleClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 25
					}}
					className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-4 relative">
						<motion.div
							className="absolute inset-0 bg-white/10"
							animate={{ opacity: [0.1, 0.3, 0.1] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
						
						<div className="flex items-center justify-between relative z-10">
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
									<PlusIcon className="w-4 h-4 text-white" />
								</div>
								<h3 className="text-white font-semibold text-lg">Agregar participante</h3>
							</div>
							
							<button
								onClick={handleClose}
								className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
							>
								<XMarkIcon className="w-5 h-5" />
							</button>
						</div>
					</div>
					
					{/* Tabs */}
					<div className="flex border-b border-gray-100 dark:border-gray-800">
						<button
							onClick={() => setActiveTab('contacts')}
							className={clsx(
								"flex-1 py-3 px-4 text-sm font-medium transition-colors",
								activeTab === 'contacts'
									? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
									: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							)}
						>
							Contactos
						</button>
						<button
							onClick={() => setActiveTab('manual')}
							className={clsx(
								"flex-1 py-3 px-4 text-sm font-medium transition-colors",
								activeTab === 'manual'
									? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
									: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
							)}
						>
							Número manual
						</button>
					</div>
					
					{/* Content */}
					<div className="p-4 max-h-96 overflow-y-auto">
						{activeTab === 'contacts' ? (
							<>
								{/* Buscador */}
								<div className="relative mb-4">
									<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
									<input
										type="text"
										placeholder="Buscar contactos..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								
								{/* Lista de contactos */}
								<div className="space-y-2">
									{filteredContacts.length > 0 ? (
										filteredContacts.map((contact, index) => (
											<motion.div
												key={contact.id || index}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05 }}
												className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
											>
												<div className="flex items-center space-x-3">
													<div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                              {contact.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
                            </span>
													</div>
													<div>
														<p className="font-medium text-gray-900 dark:text-white">
															{contact.name || 'Sin nombre'}
														</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">
															{contact.phone}
														</p>
													</div>
												</div>
												
												<motion.button
													onClick={() => handleAddContact(contact)}
													disabled={isLoading}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900 hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													<PhoneIcon className="w-4 h-4" />
												</motion.button>
											</motion.div>
										))
									) : (
										<div className="text-center py-8 text-gray-500 dark:text-gray-400">
											<UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
											<p>No se encontraron contactos</p>
											{searchTerm && (
												<p className="text-sm mt-1">para {searchTerm}</p>
											)}
										</div>
									)}
								</div>
							</>
						) : (
							/* Tab manual */
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Número de teléfono
									</label>
									<input
										type="tel"
										placeholder="+1 (555) 123-4567"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
								
								<motion.button
									onClick={handleAddManualNumber}
									disabled={!phoneNumber.trim() || isLoading}
									whileHover={{ scale: phoneNumber.trim() ? 1.02 : 1 }}
									whileTap={{ scale: phoneNumber.trim() ? 0.98 : 1 }}
									className={clsx(
										"w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2",
										phoneNumber.trim() && !isLoading
											? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900 hover:bg-emerald-600"
											: "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
									)}
								>
									{isLoading ? (
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
											className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
										/>
									) : (
										<PhoneIcon className="w-4 h-4" />
									)}
									<span>{isLoading ? 'Llamando...' : 'Llamar'}</span>
								</motion.button>
							</div>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default AddParticipantWidget;