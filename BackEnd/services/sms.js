import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();


class SMS {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.apiKey = process.env.TWILIO_API_KEY;
    this.secretKey = process.env.TWILIO_SECRET_KEY;
    this.twimlAppSid = process.env.TWILIO_APP_SID;
    
    // Cliente Twilio
    this.client = twilio(this.accountSid, this.authToken);
  }
  
  async sender(message, receiver) {
    try {
      const answer = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: receiver
      });
      console.log(answer);
      return answer;
    } catch (error) {
      throw error;
    }
  }
}

export default new SMS();