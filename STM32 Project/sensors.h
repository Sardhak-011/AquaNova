#ifndef SENSORS_H
#define SENSORS_H

typedef struct {
    float ph;
    float turbidity;
    float salinity;
    float ammonia;
    float temperature;
} SensorData_t;

void Sensors_Init(void);
SensorData_t Sensors_ReadAll(void);
int Sensors_FormatPayload(SensorData_t *data, char *buffer);

#endif
