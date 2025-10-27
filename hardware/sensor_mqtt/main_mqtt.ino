#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
 
// === CONFIGURAÇÕES ===
// Wi-Fi
const char* ssid = "teste";
const char* password = "12345678";
 
// MQTT (broker público Mosquitto)
const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char* mqtt_topic = "sensor/poluicao";
 
WiFiClient espClient;
PubSubClient client(espClient);
 
// === DISPLAY OLED ===
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
 
// === PINOS ===
#define LED_PIN 13
#define BUZZER_PIN 12
#define MQ135_PIN 34
 
int limitePoluicao = 200;
 
// === VARIÁVEIS DE TEMPO ===
unsigned long previousSensorMillis = 0;
unsigned long previousMQTTMillis = 0;
const long sensorInterval = 1000; // 1 segundo
const long mqttInterval = 30000;  // 30 segundos
 
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando-se a ");
  Serial.println(ssid);
 
  WiFi.begin(ssid, password);
 
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
 
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi conectado");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Falha ao conectar Wi-Fi");
  }
}
 
void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    String clientId = "ESP32-MQ135-";
    clientId += String(random(0xffff), HEX);
 
    if (client.connect(clientId.c_str())) {
      Serial.println("Conectado!");
    } else {
      Serial.print("Falha, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5s");
      delay(5000);
    }
  }
}
 
void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
 
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Erro ao iniciar o display OLED");
    while (true);
  }
 
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Iniciando...");
  display.display();
 
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
 
  delay(1000);
}
 
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
 
  unsigned long currentMillis = millis();
 
  // === LEITURA DO SENSOR A CADA 1 SEGUNDO ===
  if (currentMillis - previousSensorMillis >= sensorInterval) {
    previousSensorMillis = currentMillis;
 
    int valorMQ135 = analogRead(MQ135_PIN);
    Serial.print("Nível de poluição: ");
    Serial.println(valorMQ135);
 
    // Atualizar display OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("Nivel de poluicao:");
 
    display.setTextSize(3);
    int valorLargura = String(valorMQ135).length() * 18;
    int x = (SCREEN_WIDTH - valorLargura) / 2;
    display.setCursor(x, 20);
    display.print(valorMQ135);
 
    // Definir status e controlar LED e buzzer
    String status;
    if (valorMQ135 > limitePoluicao) {
      digitalWrite(LED_PIN, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      status = "ALERTA! Nivel ALTO!";
    } else {
      digitalWrite(LED_PIN, LOW);
      digitalWrite(BUZZER_PIN, LOW);
      status = "Nivel normal";
    }
 
    int statusLargura = status.length() * 6;
    int statusX = (SCREEN_WIDTH - statusLargura) / 2;
    display.setTextSize(1);
    display.setCursor(statusX, 55);
    display.print(status);
    display.display();
  }
 
  // === ENVIO MQTT A CADA 30 SEGUNDOS ===
  if (currentMillis - previousMQTTMillis >= mqttInterval) {
    previousMQTTMillis = currentMillis;
 
    int valorMQ135 = analogRead(MQ135_PIN); // Ler novamente para envio
    String mensagem = String(valorMQ135);
    client.publish(mqtt_topic, mensagem.c_str());
    Serial.println("Dado enviado via MQTT: " + mensagem);
  }
}
 
