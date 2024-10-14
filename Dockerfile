ARG VARIANT="3.12-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/python:${VARIANT} AS base

# LABEL org.opencontainers.image.source="https://github.com/<github here later>"

WORKDIR /app

COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install tools
RUN --mount=type=cache,target=/root/.cache/pip \
    pipx install poetry && poetry completions bash \
    | sudo tee -a /etc/profile.d/75-poetry.sh

# Set up environment for user
USER vscode

RUN poetry install --no-cache --no-interaction && \
    echo 'source $(poetry env info --path)/bin/activate' >> ~/.bashrc && \
    poetry run pip install --no-cache-dir -e .

CMD ["poetry", "run", "uvicorn", "--host", "0.0.0.0", "--port", "8080", "app.app:server"]
