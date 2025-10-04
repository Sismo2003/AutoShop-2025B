
import { io } from '../server.js';

// WEBSOCKETS
export const CallAgent = (ConferenceName,call) => {
	if(io){
		io.emit('inbound-call', {
			message: 'Inbound call received, Client waiting in the conference',
			conferenceName: ConferenceName,
			call
		});
	}
}

export const CustomerConnected = (data) => {
	if(io){
		io.emit('participant-joined', {
			message: 'Customer joined to the conference',
			data: data
		});
	}
}

export const CustomerLeft = (CallSid) => {
	if(io){
		io.emit('participant-left', {
			message: 'Customer left the conference',
			CallSid
		});
	}
}