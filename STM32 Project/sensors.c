#include "sensors.h"
#include "adc.h"
#include <stdio.h>

static float read_adc(uint32_t channel)
{
    ADC_ChannelConfTypeDef cfg = {0};

    cfg.Channel = channel;
    cfg.Rank = ADC_REGULAR_RANK_1;
    cfg.SamplingTime = ADC_SAMPLETIME_71CYCLES_5;

    HAL_ADC_ConfigChannel(&hadc1, &cfg);
    HAL_ADC_Start(&hadc1);
    HAL_ADC_PollForConversion(&hadc1, HAL_MAX_DELAY);

    uint32_t raw = HAL_ADC_GetValue(&hadc1);
    return (raw * 3.3f) / 4096.0f;
}

void Sensors_Init(void)
{
    HAL_ADC_Start(&hadc1);
}

SensorData_t Sensors_ReadAll(void)
{
    SensorData_t d;

    d.ph         = read_adc(ADC_CHANNEL_1);
    d.turbidity = read_adc(ADC_CHANNEL_2);
    d.salinity  = read_adc(ADC_CHANNEL_3);
    d.ammonia   = read_adc(ADC_CHANNEL_4);
    d.temperature = 25.0f;   // external probe placeholder

    return d;
}

int Sensors_FormatPayload(SensorData_t *d, char *buf)
{
    return sprintf(
        buf,
        "PH=%.2f,TUR=%.2f,SAL=%.2f,NH3=%.2f,T=%.1f",
        d->ph, d->turbidity, d->salinity, d->ammonia, d->temperature
    );
}
