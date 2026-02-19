use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::time::Duration;
use base64::Engine;

const API_BASE: &str = "http://localhost:3000";
const STREAM_NAME: &str = "demo-stream";
const TOPIC_NAME: &str = "demo-topic";
const PARTITION_ID: u32 = 0;
const POLL_INTERVAL_MS: u64 = 500;
const MESSAGES_PER_BATCH: u32 = 10;

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
struct PolledMessages {
    messages: Option<Vec<Message>>,
}

#[derive(Serialize, Deserialize)]
struct Message {
    header: MessageHeader,
    payload: String,
}

#[derive(Serialize, Deserialize)]
struct MessageHeader {
    offset: u64,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let client = Client::new();

    println!("Connecting to Iggy server...");
    println!("Logging in...");
    let auth_token = login(&client).await?;
    println!("Logged in as iggy.");

    consume_messages(&client, &auth_token).await?;

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

async fn consume_messages(client: &Client, auth_token: &str) -> Result<(), Box<dyn Error>> {
    println!(
        "Consuming from stream='{}' topic='{}' partition={}. Press Ctrl+C to stop.",
        STREAM_NAME, TOPIC_NAME, PARTITION_ID
    );

    let mut current_offset = 0u64;

    loop {
        let url = format!(
            "{}/streams/{}/topics/{}/messages?consumer=1&partition_id={}&strategy=offset&value={}&count={}&auto_commit=true",
            API_BASE, STREAM_NAME, TOPIC_NAME, PARTITION_ID, current_offset, MESSAGES_PER_BATCH
        );

        let response = client
            .get(&url)
            .bearer_auth(auth_token)
            .send()
            .await?;

        if response.status().is_success() {
            let text = response.text().await?;
            if !text.trim().is_empty() {
                match serde_json::from_str::<PolledMessages>(&text) {
                    Ok(polled) => {
                        if let Some(messages) = polled.messages {
                            if messages.is_empty() {
                                tokio::time::sleep(Duration::from_millis(POLL_INTERVAL_MS)).await;
                                continue;
                            }

                            for msg in messages {
                                let payload = decode_payload(&msg.payload);
                                println!("[offset={}] {}", msg.header.offset, payload);
                                current_offset = msg.header.offset + 1;
                            }
                        } else {
                            tokio::time::sleep(Duration::from_millis(POLL_INTERVAL_MS)).await;
                        }
                    }
                    Err(e) => {
                        eprintln!("Error parsing response: {} - Response: {}", e, text);
                        tokio::time::sleep(Duration::from_millis(POLL_INTERVAL_MS)).await;
                    }
                }
            } else {
                tokio::time::sleep(Duration::from_millis(POLL_INTERVAL_MS)).await;
            }
        } else {
            eprintln!("Error while consuming: HTTP {}", response.status());
            tokio::time::sleep(Duration::from_millis(POLL_INTERVAL_MS)).await;
        }
    }
}

fn decode_payload(payload: &str) -> String {
    // Payload is base64-encoded
    if let Ok(decoded) = base64::engine::general_purpose::STANDARD.decode(payload) {
        return String::from_utf8_lossy(&decoded).to_string();
    }
    payload.to_string()
}
