import db from '../config/db.js';

class OutboundsDial {
	async initiated(data){
		const [answer] = await db.query(`
        INSERT INTO voip_outbound_dial
        (Called, ToState, CallerCountry, Direction, ToZip, CallSid, \`To\`, ToCountry, CalledZip, CalledCity,
         CallStatus, \`From\`, AccountSid, CalledCountry, ConferenceName)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
		`, [
			data.Called,
			data.ToState,
			data.CallerCountry,
			data.Direction,
			data.ToZip,
			data.CallSid,
			data.To,
			data.ToCountry,
			data.CalledZip,
			data.CalledCity,
			data.CallStatus,
			data.From,
			data.AccountSid,
			data.CalledCountry,
			data.ConferenceName
		]);
		
		return answer.insertId;
	}

	
	async answered(data){
		
		const rawDate = data.Timestamp
		const formattedDate = new Date(rawDate).toISOString().slice(0, 19).replace('T', ' ');

		
		const [answer] = await db.query(`
		UPDATE voip_outbound_dial
		SET CallStatus = ?, AnsweredTime = ?
		WHERE CallSid = ?
		`, [
			data.CallStatus,
			formattedDate,
			data.CallSid
		])
		return answer.affectedRows;
	}
	
	async ringing(data){
		
		const [answer] = await db.query(`
		UPDATE voip_outbound_dial
		SET CallStatus = ?
		WHERE CallSid = ?
		`, [
			data.CallStatus,
			data.CallSid
		])
		return answer.affectedRows;
	}
	
	
	
}

export default new OutboundsDial();