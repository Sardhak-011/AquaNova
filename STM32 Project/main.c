#include "main.h"
#include "sensors.h"
#include "lora.h"
#include <string.h>

extern SPI_HandleTypeDef hspi1;
extern ADC_HandleTypeDef hadc1;

int main(void)
{
    HAL_Init();
    SystemClock_Config();

    MX_GPIO_Init();
    MX_SPI1_Init();
    MX_ADC1_Init();

    LORA_Init();
    Sensors_Init();

    while (1)
    {
        SensorData_t data = Sensors_ReadAll();

        char payload[128];
        int len = Sensors_FormatPayload(&data, payload);

        LORA_Send((uint8_t*)payload, len);

        HAL_PWR_EnterSTOPMode(
            PWR_LOWPOWERREGULATOR_ON,
            PWR_STOPENTRY_WFI
        );
    }
}
