import { useState, useRef } from 'react';
import { PhoneXMarkIcon, UserPlusIcon, MicrophoneIcon, XMarkIcon, SpeakerWaveIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { MicrophoneIcon as MicrophoneIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useTwilioContext } from 'app/contexts/twilio/context';

const ActiveCallWidget = () => {
	const {
		activeCall,
		callDuration,
		callType,
		toggleMute,
		isMuted,
		endCall,
		setShowAddParticipantWidget,
		participants
	} = useTwilioContext();
	
	const [isMinimized, setIsMinimized] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const constraintsRef = useRef(null);
	
	const formatDuration = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};
	
	const getCallerNumber = () => {
		if (!activeCall) return 'Número desconocido';
		
		if(callType === 'inbound') {
			console.log("llamada entrante");
			return activeCall?.parameters?.From || 'Unknown Caller';
		}
		else{
			console.log("Saliente");
			return activeCall?._options?.twimlParams?.To || 'Unknown Caller';
		}
	};
	
	const handleAddParticipant = () => {
		setShowAddParticipantWidget(true)
		console.log('Agregar participante - implementar lógica');
	};
	
	// Funciones del carrusel
	const itemWidth = 140; // Ancho reducido para el widget
	const visibleItems = Math.min(2, participants?.length || 1); // Máximo 2 items visibles
	const maxIndex = Math.max(0, (participants?.length || 0) - visibleItems);
	
	const nextSlide = () => {
		setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
	};
	
	const prevSlide = () => {
		setCurrentIndex(prev => Math.max(prev - 1, 0));
	};
	
	const handleDragEnd = (event, info) => {
		setIsDragging(false);
		const threshold = 30;
		
		if (info.offset.x > threshold && currentIndex > 0) {
			prevSlide();
		} else if (info.offset.x < -threshold && currentIndex < maxIndex) {
			nextSlide();
		}
	};
	
	// Componente para renderizar participante individual
	const ParticipantCard = ({ participant, isMainCaller = false }) => (
		<motion.div
			className="flex-shrink-0 text-center"
			style={{ width: itemWidth }}
			whileHover={{ y: -2 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className="relative inline-block mb-2">
				<div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
					<span className="text-lg font-bold text-white">
						{participant.number?.charAt(participant.number.startsWith('+') ? 1 : 0) ||
							getCallerNumber().charAt(0)}
					</span>
				</div>
				<motion.div
					className="absolute inset-0 border-2 border-emerald-400 rounded-full"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.7, 0, 0.7]
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "easeInOut"
					}}
				/>
				{/* Status indicator */}
				<div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
			</div>
			
			<p className="font-semibold text-gray-900 dark:text-white text-sm truncate px-1">
				{participant.number || getCallerNumber()}
			</p>
			<p className="text-xs text-gray-500 dark:text-gray-400 truncate px-1">
				{isMainCaller ? 'Conectado' :
					`${participant.country ? participant.country + ', ' : ''}${participant.city || 'Ciudad desconocida'}`}
			</p>
		</motion.div>
	);
	
	if (!activeCall) return null;
	
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 50, scale: 0.9 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 50, scale: 0.9 }}
				transition={{
					type: "spring",
					stiffness: 300,
					damping: 25
				}}
				className={clsx(
					"fixed bottom-6 right-6 z-50 transition-all duration-300",
					isMinimized ? "w-16 h-16" : "w-80"
				)}
			>
				<div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
					{!isMinimized ? (
						<>
							{/* Header con gradiente */}
							<div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-4 relative">
								<motion.div
									className="absolute inset-0 bg-white/10"
									animate={{ opacity: [0.1, 0.3, 0.1] }}
									transition={{ duration: 2, repeat: Infinity }}
								/>
								
								<div className="flex items-center justify-between relative z-10">
									<div className="flex items-center space-x-3">
										<motion.div
											className="w-3 h-3 bg-white rounded-full"
											animate={{
												opacity: [1, 0.5, 1],
												scale: [1, 1.2, 1]
											}}
											transition={{ duration: 1.5, repeat: Infinity }}
										/>
										<div>
											<h4 className="text-white font-semibold text-lg">En llamada</h4>
											<p className="text-white/80 text-sm">{formatDuration(callDuration)}</p>
										</div>
									</div>
									
									<button
										onClick={() => setIsMinimized(true)}
										className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
									>
										<XMarkIcon className="w-5 h-5" />
									</button>
								</div>
							</div>
							
							{/* Información de participantes con carrusel */}
							<div className="border-b border-gray-100 dark:border-gray-800">
								{participants?.length > 0 ? (
									<div className="p-4">
										<div className="relative">
											{/* Navigation Arrows - Solo mostrar si hay más de 2 participantes */}
											{participants.length > 2 && (
												<>
													<button
														onClick={prevSlide}
														disabled={currentIndex === 0}
														className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
													>
														<ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
													</button>
													
													<button
														onClick={nextSlide}
														disabled={currentIndex >= maxIndex}
														className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
													>
														<ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
													</button>
												</>
											)}
											
											{/* Carousel Container */}
											<div
												ref={constraintsRef}
												className={clsx(
													"overflow-hidden",
													participants.length > 2 ? "mx-6" : ""
												)}
											>
												<motion.div
													className="flex gap-3 justify-center"
													drag={participants.length > 2 ? "x" : false}
													dragConstraints={constraintsRef}
													dragElastic={0.1}
													onDragStart={() => setIsDragging(true)}
													onDragEnd={handleDragEnd}
													animate={participants.length > 2 ? { x: -currentIndex * (itemWidth + 12) } : {}}
													transition={{ type: "spring", stiffness: 300, damping: 30 }}
													style={{
														cursor: participants.length > 2 ? (isDragging ? 'grabbing' : 'grab') : 'default',
														justifyContent: participants.length <= 2 ? 'center' : 'flex-start'
													}}
												>
													{participants.map((p) => (
														<ParticipantCard key={p.callSid} participant={p} />
													))}
												</motion.div>
											</div>
											
											{/* Dots Indicator - Solo mostrar si hay más de 2 participantes */}
											{participants.length > 2 && maxIndex > 0 && (
												<div className="flex justify-center mt-3 space-x-1">
													{Array.from({ length: maxIndex + 1 }).map((_, index) => (
														<button
															key={index}
															onClick={() => setCurrentIndex(index)}
															className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
																index === currentIndex
																	? 'bg-blue-500 w-4'
																	: 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
															}`}
														/>
													))}
												</div>
											)}
										</div>
										
										{/* Participant Count */}
										<div className="text-center mt-2">
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{participants.length} participante{participants.length !== 1 ? 's' : ''} en la llamada
											</p>
										</div>
									</div>
								) : (
									<div className="p-4">
										<ParticipantCard participant={{}} isMainCaller={true} />
									</div>
								)}
							</div>
							
							{/* Controles de llamada */}
							<div className="p-4">
								<div className="flex justify-center space-x-4">
									{/* Botón Mute */}
									<motion.button
										onClick={toggleMute}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className={clsx(
											"w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
											isMuted
												? "bg-yellow-500 text-white shadow-yellow-200 dark:shadow-yellow-900"
												: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
										)}
									>
										{isMuted ? (
											<MicrophoneIconSolid className="w-5 h-5" />
										) : (
											<MicrophoneIcon className="w-5 h-5" />
										)}
									</motion.button>
									
									{/* Botón Speaker */}
									<motion.button
										onClick={() => {/* Implementar speaker toggle */}}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
									>
										<SpeakerWaveIcon className="w-5 h-5" />
									</motion.button>
									
									{/* Botón Agregar */}
									<motion.button
										onClick={handleAddParticipant}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900 hover:bg-blue-600 transition-all duration-200"
									>
										<UserPlusIcon className="w-5 h-5" />
									</motion.button>
									
									{/* Botón Colgar */}
									<motion.button
										onClick={endCall}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-red-900 hover:bg-red-600 transition-all duration-200"
									>
										<PhoneXMarkIcon className="w-5 h-5" />
									</motion.button>
								</div>
								
								{/* Indicadores de estado */}
								<div className="flex justify-center mt-3 space-x-4 text-xs text-gray-500 dark:text-gray-400">
									<span className={clsx("flex items-center space-x-1", isMuted && "text-yellow-600")}>
										<div className={clsx("w-1 h-1 rounded-full", isMuted ? "bg-yellow-500" : "bg-gray-400")}></div>
										<span>{isMuted ? "Silenciado" : "Audio"}</span>
									</span>
									<span className="flex items-center space-x-1">
										<div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
										<span>Conectado</span>
									</span>
								</div>
							</div>
						</>
					) : (
						/* Vista minimizada */
						<motion.button
							onClick={() => setIsMinimized(false)}
							className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-emerald-200 transition-all duration-200"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<motion.div
								animate={{
									opacity: [1, 0.5, 1],
									scale: [1, 1.1, 1]
								}}
								transition={{ duration: 1.5, repeat: Infinity }}
								className="text-white"
							>
								<SpeakerWaveIcon className="w-6 h-6" />
							</motion.div>
						</motion.button>
					)}
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export default ActiveCallWidget;