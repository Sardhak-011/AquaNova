import paho.mqtt.client as mqtt
import time

BROKER = "localhost"
TOPIC_RAW = "water/raw"
TOPIC_ANALYSIS = "water/analysis"

def analyze(data):
    if "NH3" in data:
        return "POLLUTED"
    return "SAFE"

def on_message(client, userdata, msg):
    raw = msg.payload.decode()
    result = analyze(raw)

    payload = {
        "status": result,
        "timestamp": time.time()
    }

    client.publish(TOPIC_ANALYSIS, str(payload))
    print("Analysis:", payload)

client = mqtt.Client()
client.connect(BROKER, 1883)
client.subscribe(TOPIC_RAW)
client.on_message = on_message

client.loop_forever()
