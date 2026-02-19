use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::time::Duration;
use base64::Engine;

const API_BASE: &str = "http://localhost:3000";
const STREAM_NAME: &str = "demo-stream";
const TOPIC_NAME: &str = "demo-topic";
const PARTITION_ID: u32 = 0;
const SEND_INTERVAL_SECS: u64 = 1;

#[derive(Serialize, Deserialize, Debug)]
struct MessagePayload {
    id: u64,
    text: String,
    ts: String,
}

#[derive(Serialize, Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
struct LoginResponse {
    access_token: AccessToken,
}

#[derive(Serialize, Deserialize)]
struct AccessToken {
    token: String,
}

#[derive(Serialize, Deserialize)]
struct StreamResponse {
    id: u32,
}

#[derive(Serialize, Deserialize)]
struct TopicResponse {
    id: u32,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let client = Client::new();

    println!("Connecting to Iggy server...");
    println!("Logging in...");
    let auth_token = login(&client).await?;
    println!("Logged in as iggy.");

    init_system(&client, &auth_token).await?;
    produce_messages(&client, &auth_token).await?;

    Ok(())
}

async fn login(client: &Client) -> Result<String, Box<dyn Error>> {
    let login_req = LoginRequest {
        username: "iggy".to_string(),
        password: "iggy".to_string(),
    };

    let response = client
        .post(format!("{}/users/login", API_BASE))
        .json(&login_req)
        .send()
        .await?;

    let login_response: LoginResponse = response.json().await?;
    Ok(login_response.access_token.token)
}

async fn init_system(client: &Client, auth_token: &str) -> Result<(), Box<dyn Error>> {
    // Check if stream exists
    let response = client
        .get(format!("{}/streams/{}", API_BASE, STREAM_NAME))
        .bearer_auth(auth_token)
        .send()
        .await?;

    if response.status().is_success() {
        let stream: StreamResponse = response.json().await?;
        println!("Stream '{}' already exists (id={}).", STREAM_NAME, stream.id);
    } else {
        // Create stream
        let stream_json = serde_json::json!({ "name": STREAM_NAME });
        client
            .post(format!("{}/streams", API_BASE))
            .bearer_auth(auth_token)
            .json(&stream_json)
            .send()
            .await?;
        println!("Stream '{}' created.", STREAM_NAME);
    }

    // Check if topic exists
    let response = client
        .get(format!("{}/streams/{}/topics/{}", API_BASE, STREAM_NAME, TOPIC_NAME))
        .bearer_auth(auth_token)
        .send()
        .await?;

    if response.status().is_success() {
        let topic: TopicResponse = response.json().await?;
        println!("Topic '{}' already exists (id={}).", TOPIC_NAME, topic.id);
    } else {
        // Create topic
        let topic_json = serde_json::json!({
            "name": TOPIC_NAME,
            "partitions_count": 1,
            "compression_algorithm": "none",
            "message_expiry": 0,
            "max_topic_size": 0,
            "replication_factor": 1
        });
        client
            .post(format!("{}/streams/{}/topics", API_BASE, STREAM_NAME))
            .bearer_auth(auth_token)
            .json(&topic_json)
            .send()
            .await?;
        println!("Topic '{}' created.", TOPIC_NAME);
    }

    Ok(())
}

async fn produce_messages(client: &Client, auth_token: &str) -> Result<(), Box<dyn Error>> {
    println!(
        "Producing to stream='{}' topic='{}' partition={} every {}s. Press Ctrl+C to stop.",
        STREAM_NAME, TOPIC_NAME, PARTITION_ID, SEND_INTERVAL_SECS
    );

    let mut message_id = 0u64;
    loop {
        message_id += 1;

        let payload = MessagePayload {
            id: message_id,
            text: "hello from Rust producer".to_string(),
            ts: chrono::Utc::now().to_rfc3339(),
        };

        let json_payload = serde_json::to_string(&payload)?;
        let payload_b64 = base64::engine::general_purpose::STANDARD.encode(json_payload.as_bytes());

        // Encode partition ID as little-endian 4 bytes
        let partition_bytes = PARTITION_ID.to_le_bytes();
        let partition_b64 = base64::engine::general_purpose::STANDARD.encode(&partition_bytes);

        // Create message envelope
        let envelope = serde_json::json!({
            "partitioning": {
                "kind": "partition_id",
                "value": partition_b64
            },
            "messages": [
                {
                    "payload": payload_b64
                }
            ]
        });

        let url = format!("{}/streams/{}/topics/{}/messages", API_BASE, STREAM_NAME, TOPIC_NAME);
        let response = client
            .post(&url)
            .bearer_auth(auth_token)
            .json(&envelope)
            .send()
            .await?;

        if response.status().is_success() {
            println!("Sent message #{}: {}", message_id, json_payload);
        } else {
            let status = response.status();
            let body = response.text().await?;
            eprintln!("Failed to send message #{}: HTTP {} - {}", message_id, status, body);
        }

        tokio::time::sleep(Duration::from_secs(SEND_INTERVAL_SECS)).await;
    }
}
