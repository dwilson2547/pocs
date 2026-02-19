# TypeScript Clients for Iggy POC

TypeScript producer and consumer using the HTTP REST API with Node.js fetch.

## Prerequisites

- **Node.js 18+** — Install from [nodejs.org](https://nodejs.org/) (fetch is built-in)
- **npm** — Comes with Node.js installation

## Architecture

This TypeScript implementation communicates directly with Iggy's HTTP REST API (port 3000), similar to the Java and Rust REST clients. This approach was chosen for simplicity and compatibility, using only Node.js built-in APIs without external SDK dependencies.

## Install Dependencies

```bash
cd clients/typescript
npm install
```

This will download the Iggy SDK and all dependencies.

## Run the Producer

In one terminal:

```bash
cd clients/typescript
npm run producer
```

You'll see output like:

```text
Connecting to Iggy server...
Connected and logged in as iggy.
Stream 'demo-stream' already exists (id=1).
Topic 'demo-topic' already exists (id=1).
Sent message #1: {"id":1,"text":"hello from TypeScript producer","ts":"2024-01-15T01:23:45.678Z"}
```

## Run the Consumer

In another terminal:

```bash
cd clients/typescript
npm run consumer
```

You'll see output like:

```text
Connecting to Iggy server...
Connected and logged in as iggy.
[offset=0] {"id":1,"text":"hello from TypeScript producer","ts":"2024-01-15T01:23:45.678Z"}
```

## How It Works

Both clients use HTTP REST API to connect to Iggy server on port **3000** (same as Java and Rust REST clients).

### Producer

1. Authenticates via POST `/users/login` to get a JWT token
2. Creates stream and topic if they don't exist (idempotent)
3. Sends JSON messages to partition 0 every 1 second via POST `/streams/{stream}/topics/{topic}/messages`
4. Messages are base64-encoded and wrapped in the required envelope format

### Consumer

1. Authenticates via POST `/users/login` to get a JWT token
2. Polls messages from partition 0 using GET `/streams/{stream}/topics/{topic}/messages`
3. Uses offset-based polling strategy to track progress
4. Auto-commits offsets after processing each batch
5. Base64-decodes message payloads and logs them

## Message Format

All clients (Python, Java, Java SDK, Rust, TypeScript) use the same JSON payload format:

```json
{
  "id": 123,
  "text": "hello from TypeScript producer",
  "ts": "2024-01-15T01:23:45.678Z"
}
```

This ensures full interoperability — messages can flow between any combination of clients.

## Project Structure

```text
typescript/
├── package.json            # npm configuration with dependencies
├── tsconfig.json           # TypeScript configuration
├── README.md               # This file
└── src/
    ├── producer.ts         # HTTP REST producer
    └── consumer.ts         # HTTP REST consumer
```

## Dependencies

- **tsx** — TypeScript execution tool (dev dependency)
- **typescript** — TypeScript compiler (dev dependency)

Built-in Node.js 18+ features used:
- **fetch API** — HTTP client for REST API communication
- **Buffer** — Base64 encoding/decoding

## Key Features

- **HTTP REST protocol** — Direct REST API communication on port 3000
- **Type-safe API** — TypeScript provides compile-time type checking
- **Async/await support** — Built on Promises for efficient concurrency
- **Idempotent setup** — Stream and topic creation is safe to re-run
- **Auto-commit** — Offsets are committed automatically after processing
- **No external dependencies** — Uses only Node.js built-in APIs

## Comparison with Other Clients

| Aspect | typescript/ (This) | rust/ | python/ | java-sdk/ | java/ (REST) |
|--------|--------------------|-------|---------|-----------|--------------|
| **Protocol** | HTTP REST (port 3000) | HTTP REST (port 3000) | TCP (port 8090) | TCP (port 8090) | HTTP REST (port 3000) |
| **SDK** | Built-in fetch | reqwest HTTP | iggy-py | Official Java SDK | Apache HttpClient |
| **Performance** | HTTP overhead | HTTP overhead | Native | Native | HTTP overhead |
| **Language** | TypeScript | Rust | Python | Java | Java |
| **Use Case** | HTTP-only environments | HTTP-only environments | Production | Production | HTTP-only environments |

## Troubleshooting

**Connection refused:**
- Make sure the Iggy server is running: `cd ../../server && docker compose up -d`
- Verify HTTP port 3000 is accessible: `nc -zv localhost 3000`

**Module not found:**
- Make sure you ran `npm install` first
- Check Node.js version: `node --version` (should be 18+)

## References

- [Apache Iggy Homepage](https://iggy.apache.org)
- [Apache Iggy GitHub](https://github.com/apache/iggy)
- [HTTP REST API Documentation](https://iggy.apache.org/docs/apis/http)
- [TypeScript SDK GitHub](https://github.com/iggy-rs/iggy-node-client)
