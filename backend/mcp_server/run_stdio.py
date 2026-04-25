#!/usr/bin/env python3
"""Run Orision MCP server in stdio mode for Claude Desktop."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from mcp_server.server import mcp

mcp.run(transport="stdio")
