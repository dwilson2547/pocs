const API_BASE = "http://localhost:3000";
const STREAM_NAME = "demo-stream";
const TOPIC_NAME = "demo-topic";
const PARTITION_ID = 0;
const POLL_INTERVAL_MS = 500;
const MESSAGES_PER_BATCH = 10;

interface LoginResponse {
  access_token: {
    token: string;
  };
}

interface PolledMessages {
  messages?: Message[];
}

interface Message {
  header: {
    offset: number;
  };
  payload: string;
}

async function main() {
  console.log("Connecting to Iggy server...");
  console.log("Logging in...");
  const authToken = await login();
  console.log("Logged in as iggy.");

  await consumeMessages(authToken);
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

async function consumeMessages(authToken: string) {
  console.log(
    `Consuming from stream='${STREAM_NAME}' topic='${TOPIC_NAME}' partition=${PARTITION_ID}. Press Ctrl+C to stop.`
  );

  let currentOffset = 0;

  while (true) {
    try {
      const url = `${API_BASE}/streams/${STREAM_NAME}/topics/${TOPIC_NAME}/messages?consumer=1&partition_id=${PARTITION_ID}&strategy=offset&value=${currentOffset}&count=${MESSAGES_PER_BATCH}&auto_commit=true`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          const polled: PolledMessages = JSON.parse(text);

          if (!polled.messages || polled.messages.length === 0) {
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            continue;
          }

          for (const msg of polled.messages) {
            const payload = decodePayload(msg.payload);
            console.log(`[offset=${msg.header.offset}] ${payload}`);
            currentOffset = msg.header.offset + 1;
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
      } else {
        console.error(`Error while consuming: HTTP ${response.status}`);
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    } catch (error) {
      console.error("Error while consuming — retrying:", error);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

function decodePayload(payload: string): string {
  // Payload is base64-encoded
  try {
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return decoded;
  } catch {
    return payload;
  }
}

main().catch((error) => {
  console.error("Fatal error in consumer:", error);
  process.exit(1);
});
