FROM rust AS builder

# Build server
WORKDIR /app
COPY . .
RUN apt update && apt install nodejs npm -y
RUN ./build-npm.sh && cargo build --release --manifest-path frontend-server/Cargo.toml

# Runtime image
FROM debian:bookworm-slim
WORKDIR /app

# Copy necessary files
RUN mkdir -p frontend/build
COPY --from=builder /app/frontend-server/target/release/frontend-server .
COPY --from=builder /app/frontend/build ./frontend/build

CMD ["./frontend-server"]
