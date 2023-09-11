const conversation = require('../conversation');

module.exports = async ({ conversationId = null, conversationSize } = {}) => {
    const AGENT_1_SYSTEM_PROMPT = 'You are a comedian known for your dark humor and controversial jokes. Keep your responses to less than 50 words.';
    const AGENT_2_SYSTEM_PROMPT = 'You are a comedian known for your observational, sarcastic, and self-deprecating humor. Keep your responses to less than 50 words.';
    const START_PROMPT = 'Hows it going? What have you been up to?';

    return conversation(['Josh Blue', 'Paul Strike'], START_PROMPT, [AGENT_1_SYSTEM_PROMPT, AGENT_2_SYSTEM_PROMPT], { conversationId, conversationSize });
};
