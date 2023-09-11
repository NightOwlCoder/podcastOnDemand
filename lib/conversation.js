const chalk = require("chalk");
const uuid = require("uuid");
const { Agent } = require("./agent");
const { concatenateAudioFiles } = require("./textToSpeechHelper");

module.exports = async (
  guest,
  startPrompt,
  systemPrompts = [],
  { conversationId, conversationSize = 5 }
) => {
  conversationId = conversationId || uuid.v4();

  const agents = systemPrompts.map((systemPrompt, i) => {
    return new Agent(i == 0 ? `Host` : guest, `agent-${i}-${conversationId}`, {
      systemPrompt,
    });
  });

  let response = startPrompt;

  agents[0].addAssistantMessage(startPrompt);
  printResponse(agents[0], 0, startPrompt);

  for (let i = 0; i < conversationSize; i++) {
    for (const j in agents) {
      if (i === 0 && +j === 0) continue; // skip first agent on first iteration (already printed)
      const agent = agents[j];
      if (i === conversationSize - 2) {
        response =
          response +
          `. time is running out, start thinking about wrapping up .`;
      } else if (i === conversationSize - 1) {
        response =
          response + `. last round, wrapp up your thoughts and goodbyes.`;
      }
      await agent.chat(response);
      response = agent.last();
      printResponse(agent, j, response);
    }
  }

  // const voiceIds = ['TxGEqnHWrfWFTfGW9XjX', 'VR6AewLTigWG4xSOukaG'];
  const createAudio = false;

  if (createAudio) {
    const voiceIds = [
      "ZFOwjcbbjOqQHHuG0lLO", // Florence
      "wH0Kt3aPrULihGx3HW8o", // Kipling
    ];
    const agentFiles = await Promise.all(
      agents.map((agent, i) => agent.synthesize(voiceIds[i % voiceIds.length]))
    );

    const fileList = [];
    for (let i = 0; i < agentFiles[0].length; i++) {
      for (let j = 0; j < agentFiles.length; j++) {
        if (agentFiles[j][i]) fileList.push(agentFiles[j][i]);
      }
    }

    await concatenateAudioFiles(fileList, conversationId);
  }
  return { conversationId };
};

const colors = ["blue", "green", "yellow", "red", "magenta"];
const printResponse = (agent, j, response) => {
  const color = colors[j % colors.length];

  const agentName = agent.displayName;

  const columns = process.stdout.columns || 100;
  const paddingSize = Math.floor((columns - agentName.length) / 2) - 1;
  const padding = new Array(paddingSize).join(String.fromCharCode(9472));

  console.log(
    chalk[color](`${padding}`) +
      chalk.bold(` ${agentName} `) +
      chalk[color](`${padding}`)
  );
  // Split the response string into smaller strings of max length 'columns'
  let lines = response.match(new RegExp(`.{1,${columns}}`, "g"));
  for (let line of lines) {
    console.log(line);
  }
  console.log(
    chalk[color](`${new Array(columns).join(String.fromCharCode(9472))}`)
  );
};
