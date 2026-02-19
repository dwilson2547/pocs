const API_BASE = "http://localhost:3000";
const STREAM_NAME = "demo-stream";
const TOPIC_NAME = "demo-topic";
const PARTITION_ID = 0;
const SEND_INTERVAL_MS = 1000;

interface MessagePayload {
  id: number;
  text: string;
  ts: string;
}

interface LoginResponse {
  access_token: {
    token: string;
  };
}

interface StreamResponse {
  id: number;
}

interface TopicResponse {
  id: number;
}

async function main() {
  console.log("Connecting to Iggy server...");
  console.log("Logging in...");
  const authToken = await login();
  console.log("Logged in as iggy.");

  await initSystem(authToken);
  await produceMessages(authToken);
}

async function login(): Promise<string> {
  const response = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "iggy", password: "iggy" }),
  });

  const data: LoginResponse = await response.json();
  return data.access_token.token;
}

async function initSystem(authToken: string) {
  // Check if stream exists
  const streamResponse = await fetch(`${API_BASE}/streams/${STREAM_NAME}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (streamResponse.ok) {
    const stream: StreamResponse = await streamResponse.json();
    console.log(`Stream '${STREAM_NAME}' already exists (id=${stream.id}).`);
  } else {
    await fetch(`${API_BASE}/streams`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: STREAM_NAME }),
    });
    console.log(`Stream '${STREAM_NAME}' created.`);
  }

  // Check if topic exists
  const topicResponse = await fetch(
    `${API_BASE}/streams/${STREAM_NAME}/topics/${TOPIC_NAME}`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  if (topicResponse.ok) {
    const topic: TopicResponse = await topicResponse.json();
    console.log(`Topic '${TOPIC_NAME}' already exists (id=${topic.id}).`);
  } else {
    await fetch(`${API_BASE}/streams/${STREAM_NAME}/topics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: TOPIC_NAME,
        partitions_count: 1,
        compression_algorithm: "none",
        message_expiry: 0,
        max_topic_size: 0,
        replication_factor: 1,
      }),
    });
    console.log(`Topic '${TOPIC_NAME}' created.`);
  }
}

async function produceMessages(authToken: string) {
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
    const payloadB64 = Buffer.from(jsonPayload).toString("base64");

    // Encode partition ID as little-endian 4 bytes
    const partitionBytes = Buffer.alloc(4);
    partitionBytes.writeUInt32LE(PARTITION_ID);
    const partitionB64 = partitionBytes.toString("base64");

    // Create message envelope
    const envelope = {
      partitioning: {
        kind: "partition_id",
        value: partitionB64,
      },
      messages: [
        {
          payload: payloadB64,
        },
      ],
    };

    const url = `${API_BASE}/streams/${STREAM_NAME}/topics/${TOPIC_NAME}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envelope),
    });

    if (response.ok) {
      console.log(`Sent message #${messageId}: ${jsonPayload}`);
    } else {
      const body = await response.text();
      console.error(
        `Failed to send message #${messageId}: HTTP ${response.status} - ${body}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, SEND_INTERVAL_MS));
  }
}

main().catch((error) => {
  console.error("Fatal error in producer:", error);
  process.exit(1);
});
