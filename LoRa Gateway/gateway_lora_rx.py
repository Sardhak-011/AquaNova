import paho.mqtt.client as mqtt
from sx127x import SX127x   # abstraction for LoRa HAT

BROKER = "localhost"
TOPIC_RAW = "water/raw"

mqtt_client = mqtt.Client()
mqtt_client.connect(BROKER, 1883)

lora = SX127x(freq=868e6)

def on_receive(payload):
    decoded = payload.decode()
    print("LoRa RX:", decoded)
    mqtt_client.publish(TOPIC_RAW, decoded)

lora.on_receive = on_receive
lora.start_rx()

while True:
    pass
