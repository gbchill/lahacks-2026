# Agentverse Registration Guide

## 1. Get Agent Addresses

```bash
cd backend && source venv/bin/activate
python scripts/register_agents.py
```

## 2. Register Each Agent in Agentverse UI

1. Go to [agentverse.ai](https://agentverse.ai)
2. Click **My Agents** -> **Register Agent**
3. For each agent (parser, context, drafter, translator, orchestrator):
   - Enter the agent address from the script output
   - Set name to `Orision [AgentName]` (e.g. "Orision Parser")
   - Paste the description from the script output
   - Add tags: `orision`, `immigrant-families`, `document-translation`, `[role]`
   - Click **Register**

## 3. Verify Chat Protocol

After registration, each agent's page should show **AgentChatProtocol v0.3.0** in green.

## 4. For Mailbox Mode (production on Vultr)

Add to each Agent constructor:

```python
Agent(
    name="parser",
    seed=os.getenv("PARSER_AGENT_SEED"),
    mailbox=True,
    agentverse="https://agentverse.ai",
)
```

Set `FETCHAI_AGENTVERSE_API_KEY` in `.env`.

## 5. Test ASI:One Discoverability

Go to [asi1.ai](https://asi1.ai) and search for "Orision" or "immigrant document translation".
