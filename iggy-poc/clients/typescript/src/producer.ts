import { Client } from "@iggy.rs/sdk";

const STREAM_NAME = "demo-stream";
const TOPIC_NAME = "demo-topic";
const PARTITION_ID = 1;
const SEND_INTERVAL_MS = 1000;

interface MessagePayload {
  id: number;
  text: string;
  ts: string;
}

async function main() {
  console.log("Connecting to Iggy server...");
  const client = new Client({
    transport: "TCP",
    options: { port: 8090, host: "127.0.0.1" },
    credentials: { username: "iggy", password: "iggy" },
  });

  await client.connect();
  console.log("Connected and logged in as iggy.");

  await initSystem(client);
  await produceMessages(client);
}

async function initSystem(client: Client) {
  // Create stream if it doesn't exist
  try {
    const stream = await client.stream.get({ streamId: STREAM_NAME });
    console.log(`Stream '${STREAM_NAME}' already exists (id=${stream.id}).`);
  } catch (error) {
    await client.stream.create({ streamId: STREAM_NAME, name: STREAM_NAME });
    console.log(`Stream '${STREAM_NAME}' created.`);
  }

  // Create topic if it doesn't exist
  try {
    const topic = await client.topic.get({
      streamId: STREAM_NAME,
      topicId: TOPIC_NAME,
    });
    console.log(`Topic '${TOPIC_NAME}' already exists (id=${topic.id}).`);
  } catch (error) {
    await client.topic.create({
      streamId: STREAM_NAME,
      topicId: TOPIC_NAME,
      name: TOPIC_NAME,
      partitionsCount: 1,
    });
    console.log(`Topic '${TOPIC_NAME}' created.`);
  }
}

async function produceMessages(client: Client) {
  console.log(
    `Producing to stream='${STREAM_NAME}' topic='${TOPIC_NAME}' partition=${PARTITION_ID} every ${SEND_INTERVAL_MS}ms. Press Ctrl+C to stop.`
  );

  let messageId = 0;
  while (true) {
    messageId++;

    const payload: MessagePayload = {
      id: messageId,
      text: "hello from TypeScript producer",
      ts: new Date().toISOString(),
    };

    const jsonPayload = JSON.stringify(payload);

    try {
      await client.message.send({
        streamId: STREAM_NAME,
        topicId: TOPIC_NAME,
        partitioning: {
          kind: "PartitionId",
          value: PARTITION_ID,
        },
        messages: [
          {
            payload: Buffer.from(jsonPayload),
          },
        ],
      });
      console.log(`Sent message #${messageId}: ${jsonPayload}`);
    } catch (error) {
      console.error(`Failed to send message #${messageId}:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, SEND_INTERVAL_MS));
  }
}

main().catch((error) => {
  console.error("Fatal error in producer:", error);
  process.exit(1);
});
