# ================= MQTT CLIENT =================
import paho.mqtt.client as mqtt
import json
from datetime import datetime
from config import config
import threading

class MQTTClient:
    def __init__(self, on_message_callback=None):
        self.client = mqtt.Client()
        self.on_message_callback = on_message_callback
        self.connected = False
        self.message_handlers = {}
        
        # Setup callbacks
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("✅ Connected to MQTT Broker")
            self.connected = True
            # Subscribe to response topic
            self.client.subscribe(config.MQTT_TOPIC)
            print(f"📡 Subscribed to topic: {config.MQTT_TOPIC}")
        else:
            print(f"❌ Failed to connect, code {rc}")
            self.connected = False
    
    def _on_message(self, client, userdata, msg):
        try:
            payload = msg.payload.decode()
            topic = msg.topic
            timestamp = datetime.now().isoformat()
            
            print(f"📩 Message received on {topic}")
            print(f"   Payload: {payload}")
            
            # Try to parse as JSON
            try:
                data = json.loads(payload)
            except:
                data = {'subject': payload}
            
            # Add metadata
            data['timestamp'] = timestamp
            data['topic'] = topic
            
            # Call the callback if provided
            if self.on_message_callback:
                self.on_message_callback(data)
                
        except Exception as e:
            print(f"❌ Error processing message: {e}")
    
    def _on_disconnect(self, client, userdata, rc):
        if rc != 0:
            print(f"⚠️ Unexpected disconnection: {rc}")
        self.connected = False
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(config.MQTT_BROKER, config.MQTT_PORT, 60)
            # Start the network loop in a separate thread
            threading.Thread(target=self.client.loop_forever, daemon=True).start()
            return True
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def publish(self, topic, payload):
        """Publish message to MQTT topic"""
        try:
            self.client.publish(topic, payload)
            print(f"📤 Published to {topic}: {payload}")
            return True
        except Exception as e:
            print(f"❌ Publish error: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.client.disconnect()

# Global MQTT client instance
mqtt_client = None

def init_mqtt(app, on_message_callback=None):
    """Initialize MQTT client with Flask app"""
    global mqtt_client
    mqtt_client = MQTTClient(on_message_callback=on_message_callback)
    mqtt_client.connect()
    return mqtt_client

def get_mqtt_client():
    """Get the global MQTT client instance"""
    return mqtt_client
