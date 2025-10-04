
import db from "../config/db.js";

class AgentsModel {
  async getAllAgents() {
    const [agents] = await db.query(`
    SELECT
    U.username
    FROM voip_agents VA
    INNER JOIN users U
    ON VA.user_id = U.id
    WHERE VA.status = 'available'
    `);
    return agents;
  }
  
  async MarkAvailableAgent(payload) {
    const [agent] = await db.query(`INSERT INTO
    voip_agents (user_id,token,status) VALUES (?,?,?)`,
      [
        payload.user_id,
        payload.token,
        'available'
      ]
    );
    return agent.insertId;
  }
  
  async changeStatus(userId,status) {
    const [agent] = await db.query(`UPDATE voip_agents SET status = ? WHERE user_id = ?`,
      [status,userId]
    );
    return agent.affectedRows;
  }
  
  async disconnectAgent(userId) {
    const [agent] = await db.query(`DELETE FROM voip_agents WHERE user_id = ?`,
      [userId]
    );
    return agent.affectedRows;
  }
  
}

export default new AgentsModel();