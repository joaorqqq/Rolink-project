import discord
import os
from discord.ext import commands
from dotenv import load_dotenv

# Carrega os dados do arquivo .env que você criou no ZArchiver
load_dotenv()

TOKEN = os.getenv('DISCORD_TOKEN')
WEBHOOK = os.getenv('WEBHOOK_URL')

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

@bot.event
async def on_ready():
    print(f"🚀 RoLink Online! Webhook configurado: {WEBHOOK[:20]}...")

# Rodar o bot
bot.run(TOKEN)
