import db from "../config/db.js";

class ConferencesModel {
	async StartConference(data) {
		try {
			const [conference] = await db.query(`
				INSERT INTO voip_conferences
				(\`ConferenceName\`, \`CallSid\`, \`CallStatus\`, \`From\`, \`CalledCountry\`, \`CallerCity\`,
				\`FromCountry\`, \`Caller\`, \`FromCity\`) VALUES (?,?,?,?,?,?,?,?,?)
			`, [
				data.ConferenceName,
				data.CallSid,
				data.CallStatus,
				data.From,
				data.CalledCountry,
				data.CallerCity,
				data.FromCountry,
				data.Caller,
				data.FromCity
			]);
			return conference.insertId;
		} catch (error) {
			throw error;
		}
	}
	
	async joinToConference(ConferenceName, ConferenceSid) {
		const [answer] = await db.query(`
	    UPDATE voip_conferences SET
      	ConferenceSid = IF(ConferenceSid IS NULL, ?, ConferenceSid),
      	current_participants = current_participants + 1,
      	max_participants = GREATEST(current_participants , max_participants)
	    WHERE ConferenceName = ?
		`, [ConferenceSid, ConferenceName])
		return answer.affectedRows;
	}
	
	async endConference(ConferenceName, CallStatus,reason) {
		const [answer] = await db.query(`
			UPDATE voip_conferences SET
			CallStatus = ?, ReasonConferenceEnded = ?
			WHERE ConferenceName = ?
		`, [CallStatus,reason, ConferenceName]);
		return answer.affectedRows;
	}
	
	
}

export default new ConferencesModel();