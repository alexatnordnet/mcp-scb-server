import client from '@kubb/plugin-client/clients/axios'
import type {
  GetApiConfigurationQueryResponse,
  GetApiConfiguration400,
  GetApiConfiguration404,
  GetApiConfiguration429,
} from '../../types/configurationController/GetApiConfiguration.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get API configuration settings.
 * {@link /config}
 */
export async function px_get_api_configuration_handler(): Promise<Promise<CallToolResult>> {
  const res = await client<
    GetApiConfigurationQueryResponse,
    ResponseErrorConfig<GetApiConfiguration400 | GetApiConfiguration404 | GetApiConfiguration429>,
    unknown
  >({ method: 'GET', url: `/config` })
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(res.data),
      },
    ],
  }
}