FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN mv ./docker/* ./ \
  && bun install \
  && bun pm cache rm

CMD ["bun", "src/app.ts"]
