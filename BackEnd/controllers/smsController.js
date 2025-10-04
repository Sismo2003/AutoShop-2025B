import SMS from '../services/sms.js'


export const sendSms = async (req, res) => {
  try {
    const { message, receiver } = req.body;
    
    // verify that the message exist!
    if(!message || message.length <= 0 ){
      return res.status(400).send({
        error: 'Please enter a valid message'
      })
    }
    
    // verify that the phone number for the receiver exist and its valid
    if(!receiver || receiver.length <= 0 ){
      return res.status(400).send({
        error: 'Please enter a valid phone number for the receiver!'
      })
    }
    
    console.log(`Message received ${message.length} message received to ${receiver}`)
    // calling the service
    const answer = await SMS.sender(message, receiver);
    
    if(answer){
      return res.status(200).send({
        success: true,
        message : "SMS sent successfully",
        sid : answer.sid,
        answer
      })
    }
    
  
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_message: error.message,
      message: "Server internal error failed 500",
      error : true
    });
  }
};
