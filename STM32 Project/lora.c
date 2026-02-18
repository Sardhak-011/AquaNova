#include "lora.h"
#include "spi.h"

void LORA_Init(void)
{
    SX1276_Reset();
    SX1276_SetFrequency(868000000);
    SX1276_SetSpreadingFactor(7);
    SX1276_SetBandwidth(125000);
    SX1276_SetTxPower(14);
}

void LORA_Send(uint8_t *data, uint8_t len)
{
    SX1276_EnterTxMode();
    SX1276_WritePayload(data, len);
    SX1276_WaitForTxDone();
}
