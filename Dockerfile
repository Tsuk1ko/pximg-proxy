FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN echo "[install]\ndev = false" > bunfig.toml \
  && bun install \
  && bun pm cache rm

CMD ["bun", "src/app.ts"]
