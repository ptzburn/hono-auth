FROM denoland/deno:2.4.2

# The port that your application listens to.
EXPOSE 8000

WORKDIR /app

# Prefer not to run as root.
USER deno

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache ./src/main.ts

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "./src/main.ts"]
