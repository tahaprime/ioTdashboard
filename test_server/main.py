import paho.mqtt.client as mqtt

# ================= CONFIG =================
MQTT_BROKER = "broker.mqttdashboard.com"
MQTT_TOPIC  = "/sourcPy/Reponse"

# ================= CALLBACK =================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connecté au broker MQTT")
        client.subscribe(MQTT_TOPIC)
    else:
        print("❌ Échec de connexion, code :", rc)

def on_message(client, userdata, msg):
    print("📩 Message reçu sur", msg.topic)
    print("Contenu :", msg.payload.decode())

# ================= CLIENT =================
print("=" * 60)
print("⚠️  DEPRECATED: Use Flask app from 'back' folder instead")
print("=" * 60)
print("Run: python back/app.py")
print("=" * 60)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

try:
    client.connect(MQTT_BROKER, 1883, 60)
    print("Waiting for messages…")
    client.loop_forever()
except KeyboardInterrupt:
    print("\nShutting down...")
    client.disconnect()
except Exception as e:
    print(f"Error: {e}")