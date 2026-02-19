# TypeScript Clients for Iggy POC

TypeScript producer and consumer using the official Apache Iggy TypeScript SDK with npm.

## Prerequisites

- **Node.js 18+** — Install from [nodejs.org](https://nodejs.org/)
- **npm** — Comes with Node.js installation

## Architecture

This implementation uses the official Apache Iggy TypeScript SDK (`@iggy.rs/sdk` npm package) that connects via TCP on port 8090 (same as Python and Rust clients). The TypeScript SDK provides a type-safe interface to interact with Iggy and offers native performance through TCP protocol.

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

Both clients use the official Apache Iggy TypeScript SDK to connect via TCP on port **8090** (same as Python and Rust clients).

### Producer

1. Connects to server via TCP and logs in
2. Creates stream and topic if they don't exist (idempotent)
3. Sends JSON messages to partition 1 every 1 second
4. Uses `client.message.send()` with Buffer payload
5. Uses `partitioning.kind = "PartitionId"` to target specific partition

### Consumer

1. Connects to server via TCP and logs in
2. Polls messages from partition 1 using next-offset polling strategy
3. Auto-commits offsets after processing each batch
4. Logs each message with its offset

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
    ├── producer.ts         # TCP producer using TypeScript SDK
    └── consumer.ts         # TCP consumer using TypeScript SDK
```

## Dependencies

- **@iggy.rs/sdk** — Official Apache Iggy TypeScript SDK
- **tsx** — TypeScript execution tool (dev dependency)
- **typescript** — TypeScript compiler (dev dependency)

## Key Features

- **Native TCP protocol** — Direct binary protocol for high performance
- **Type-safe API** — TypeScript provides compile-time type checking
- **Async/await support** — Built on Promises for efficient concurrency
- **Idempotent setup** — Stream and topic creation is safe to re-run
- **Auto-commit** — Offsets are committed automatically after processing

## Comparison with Other Clients

| Aspect | typescript/ (This) | rust/ | python/ | java-sdk/ | java/ (REST) |
|--------|--------------------|-------|---------|-----------|--------------|
| **Protocol** | TCP (port 8090) | TCP (port 8090) | TCP (port 8090) | TCP (port 8090) | HTTP REST (port 3000) |
| **SDK** | Official TypeScript SDK | Official Rust SDK | iggy-py | Official Java SDK | Apache HttpClient |
| **Performance** | Native | Native (fastest) | Native | Native | HTTP overhead |
| **Language** | TypeScript | Rust | Python | Java | Java |
| **Use Case** | Production | Production recommended | Production | Production | HTTP-only environments |

## Troubleshooting

**Connection refused:**
- Make sure the Iggy server is running: `cd ../../server && docker compose up -d`
- Verify TCP port 8090 is accessible: `nc -zv localhost 8090`

**Module not found:**
- Make sure you ran `npm install` first
- Check Node.js version: `node --version` (should be 18+)

**SDK not found:**
- The SDK should be available on npm
- Check https://www.npmjs.com/package/@iggy.rs/sdk

## References

- [Apache Iggy Homepage](https://iggy.apache.org)
- [Apache Iggy GitHub](https://github.com/apache/iggy)
- [TypeScript SDK Documentation](https://iggy.apache.org/docs/sdk/node/intro/)
- [TypeScript SDK GitHub](https://github.com/iggy-rs/iggy-node-client)
