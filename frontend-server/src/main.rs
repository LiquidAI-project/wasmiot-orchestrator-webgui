use actix_files::Files;
use actix_web::{App, HttpServer};
use std::env;
use local_ip_address::local_ip;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Get port from environment or fallback
    let port: u16 = env::var("PORT").unwrap_or_else(|_| "3313".to_string()).parse().unwrap();
    let local_ip_addr = local_ip().unwrap_or_else(|_| "localhost".parse().unwrap());

    println!("Orchestrator frontend available on http://{}:{}", local_ip_addr, port);
    println!("Orchestrator frontend available on http://localhost:{}", port);

    HttpServer::new(|| {
        App::new()
            .service(Files::new("/", "frontend/build").index_file("index.html"))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
