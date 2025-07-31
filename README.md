# GPT Webhook (Render)

A minimal Express webhook ready to deploy on **Render.com** (Free tier).

## Deploy (Two Ways)

### Option A: Blueprint (recommended)
1. Create a new GitHub repo with these files (`server.js`, `package.json`, `render.yaml`).
2. On Render, click **New → Blueprint** and select your repo.
3. When prompted, add environment variable:
   - `OPENAI_API_KEY` = your real key (starts with `sk-...`).
4. Click **Apply**. Render will build & deploy.
5. Your public URL will look like: `https://<service-name>.onrender.com/`

### Option B: Web Service from Repo
1. Push these files to a GitHub repo.
2. On Render, click **New → Web Service**.
3. Connect the repo, set **Build Command** = `npm install`, **Start Command** = `node server.js`.
4. Add environment variable: `OPENAI_API_KEY` with your key.
5. Deploy and get your public URL.

## Test

Open your URL in a browser:
```
GET /  →  "Webhook is running and ready on Render!"
```

Then send a POST (with ReqBin/Postman or curl) to the same URL with JSON:
```json
{
  "question": "Were you living in this house during Hurricane Beryl?",
  "response": "Yes, I was.",
  "owns_home": true,
  "handles_bill": true
}
```

Successful response (shape):
```json
{
  "actions": [
    { "say": { "speech": "..." } },
    { "redirect": "https://your-twilio-flow-endpoint-to-SMS-or-log" }
  ]
}
```

> Replace the `redirect` URL in `server.js` with your real Twilio Studio/Function endpoint, or remove it if not needed.

## Twilio Studio Hookup

- Add an **HTTP Request** widget that POSTs to your Render URL.
- Send the fields your webhook expects: `question`, `response`, `owns_home`, `handles_bill`.
- Use the JSON response to drive downstream widgets (say/redirect).

## Notes
- Uses Node 18+ and ESM (`type: "module"`).
- Keep your `OPENAI_API_KEY` secret (set it only in Render, not in code).
