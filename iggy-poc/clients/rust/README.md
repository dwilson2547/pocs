# Rust Clients for Iggy POC

Rust producer and consumer using the HTTP REST API with reqwest and Cargo.

## Prerequisites

- **Rust 1.70+** — Install from [rustup.rs](https://rustup.rs/)
- **Cargo** — Comes with Rust installation

## Architecture

Unlike the Python clients which use the native TCP SDK, this Rust implementation communicates directly with Iggy's HTTP REST API (port 3000). This approach was chosen to demonstrate an alternative connection method and avoid SDK version compatibility issues, similar to the Java REST client.

## Build

```bash
cd clients/rust
cargo build --release
```

This will download all dependencies and compile the producer and consumer binaries.

## Run the Producer

In one terminal:

```bash
cd clients/rust
cargo run --bin producer
```

You'll see output like:

```text
Connecting to Iggy server...
Logging in...
Logged in as iggy.
Stream 'demo-stream' already exists (id=1).
Topic 'demo-topic' already exists (id=1).
Producing to stream='demo-stream' topic='demo-topic' partition=0 every 1s. Press Ctrl+C to stop.
Sent message #1: {"id":1,"text":"hello from Rust producer","ts":"2024-01-15T01:23:45.678Z"}
```

## Run the Consumer

In another terminal:

```bash
cd clients/rust
cargo run --bin consumer
```

You'll see output like:

```text
Connecting to Iggy server...
Logging in...
Logged in as iggy.
Consuming from stream='demo-stream' topic='demo-topic' partition=0. Press Ctrl+C to stop.
[offset=0] {"id":1,"text":"hello from Rust producer","ts":"2024-01-15T01:23:45.678Z"}
```

## How It Works

Both clients use HTTP REST API to connect to Iggy server on port **3000** (same as Java REST clients).

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
  "text": "hello from Rust producer",
  "ts": "2024-01-15T01:23:45.678Z"
}
```

This ensures full interoperability — messages can flow between any combination of clients.

## Project Structure

```text
rust/
├── Cargo.toml              # Cargo configuration with dependencies
├── README.md               # This file
└── src/
    ├── producer.rs         # HTTP REST producer
    └── consumer.rs         # HTTP REST consumer
```

## Dependencies

- **reqwest** — HTTP client for REST API communication
- **tokio** — Async runtime
- **serde + serde_json** — JSON serialization
- **chrono** — Timestamp handling
- **base64** — Base64 encoding/decoding

## Key Features

- **HTTP REST protocol** — Direct REST API communication on port 3000
- **Type-safe API** — Rust's type system ensures correctness
- **Async/await support** — Built on tokio for efficient concurrency
- **Idempotent setup** — Stream and topic creation is safe to re-run
- **Auto-commit** — Offsets are committed automatically after processing

## Comparison with Other Clients

| Aspect | rust/ (This) | python/ | typescript/ | java-sdk/ | java/ (REST) |
|--------|--------------|---------|-------------|-----------|--------------|
| **Protocol** | HTTP REST (port 3000) | TCP (port 8090) | HTTP REST (port 3000) | TCP (port 8090) | HTTP REST (port 3000) |
| **SDK** | reqwest HTTP | iggy-py | Built-in fetch | Official Java SDK | Apache HttpClient |
| **Performance** | HTTP overhead | Native | HTTP overhead | Native | HTTP overhead |
| **Language** | Rust | Python | TypeScript | Java | Java |
| **Use Case** | HTTP-only environments | Production | HTTP-only environments | Production | HTTP-only environments |

## Troubleshooting

**Connection refused:**
- Make sure the Iggy server is running: `cd ../../server && docker compose up -d`
- Verify HTTP port 3000 is accessible: `nc -zv localhost 3000`

**Build errors:**
- Ensure you have Rust installed: `rustc --version`
- Update Rust if needed: `rustup update`
- Clear Cargo cache if needed: `cargo clean`

## References

- [Apache Iggy Homepage](https://iggy.apache.org)
- [Apache Iggy GitHub](https://github.com/apache/iggy)
- [Rust SDK Documentation](https://docs.rs/iggy/latest/iggy/)
- [HTTP REST API Documentation](https://iggy.apache.org/docs/apis/http)
