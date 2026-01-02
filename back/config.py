# ================= CONFIGURATION =================
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # MQTT
    MQTT_BROKER = os.getenv('MQTT_BROKER', 'broker.mqttdashboard.com')
    MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
    MQTT_TOPIC = os.getenv('MQTT_TOPIC', '/sourcPy/Reponse')
    
    # API
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', 5000))
    
    # Database (In-memory for demo)
    DATABASE = {
        'users': {},
        'rooms': {},
        'access_log': []
    }

config = Config()
