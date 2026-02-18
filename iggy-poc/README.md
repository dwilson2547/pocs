# Apache Iggy POC

A minimal working example of [Apache Iggy](https://iggy.apache.org) — a hyper-efficient persistent message streaming platform written in Rust.

This POC demonstrates **simple pub/sub messaging** using:

- An Iggy server running in Docker
- A Python async **producer** that sends JSON messages via TCP
- A Python async **consumer** that polls and prints those messages

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Docker + Docker Compose | Any recent | For the Iggy server |
| Python | 3.10+ | For the clients |

---

## Quick Start

### 1. Start the Iggy server

```bash
cd server
docker compose up -d
```

Verify it's running (login first to get a token, then list streams):

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"iggy","password":"iggy"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/streams
# → []  (empty — no streams yet, but server is up)
```

### 2. Install Python dependencies

```bash
cd clients
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the producer

In one terminal:

```bash
cd clients && source .venv/bin/activate
python producer.py
```

You'll see one message sent per second:

```text
INFO  Sent message #1: {"id": 1, "text": "hello from producer", "ts": "..."}
INFO  Sent message #2: ...
```

### 4. Run the consumer

In a second terminal:

```bash
cd clients && source .venv/bin/activate
python consumer.py
```

You'll see each message as it arrives:

```text
INFO  [offset=0] {"id": 1, "text": "hello from producer", "ts": "..."}
INFO  [offset=1] {"id": 2, ...}
```

---

## Project Layout

```text
iggy-poc/
├── README.md
├── server/
│   └── docker-compose.yml    # Iggy server (TCP:8090, HTTP+WS:3000)
├── clients/
│   ├── requirements.txt      # iggy-py, loguru
│   ├── producer.py           # Async producer — 1 msg/sec
│   └── consumer.py           # Async consumer — polls every 500ms
└── docs/
    ├── iggy-concepts.md      # Core concept reference (read this first)
    └── architecture.md       # Server internals + SDK connection flow
```

---

## Inspect With curl

The HTTP REST API on port 3000 lets you inspect the server state. Authentication is required — get a token first:

```bash
# Get a token
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"iggy","password":"iggy"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# List all streams
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/streams

# Get topic details (includes message count)
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/streams/demo-stream/topics/demo-topic

# Get partitions (includes current offset)
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/streams/demo-stream/topics/demo-topic/partitions
```

---

## Key Concepts

New to Iggy? Start with [`docs/iggy-concepts.md`](docs/iggy-concepts.md):

- **Streams** — top-level namespace
- **Topics** — ordered message log
- **Partitions** — parallelism unit with per-offset tracking
- **Polling strategies** — `Next()`, `Offset(n)`, `First()`, `Last()`
- **Consumer groups** — server-side load balancing across consumers

For server internals and how the SDK connects, see [`docs/architecture.md`](docs/architecture.md).

---

## Stop Everything

```bash
# Stop clients: Ctrl+C in each terminal

# Stop and remove the server container (data is preserved in Docker volume)
cd server && docker compose down

# Stop and remove the server + delete all stored messages
cd server && docker compose down -v
```

---

## References

- [Apache Iggy homepage](https://iggy.apache.org)
- [Official docs](https://iggy.apache.org/docs)
- [Python SDK — iggy-py](https://github.com/iggy-rs/iggy-python-client)
- [Server source code](https://github.com/apache/iggy)
