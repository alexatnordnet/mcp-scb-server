import client from '@kubb/plugin-client/clients/axios'
import type {
  GetTableByIdQueryResponse,
  GetTableByIdPathParams,
  GetTableByIdQueryParams,
  GetTableById400,
  GetTableById404,
  GetTableById429,
} from '../../types/tableController/GetTableById.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get Table by {id}.
 * {@link /tables/:id}
 */
export async function px_get_table_by_id_handler({
  id,
  params,
}: {
  id: GetTableByIdPathParams['id']
  params?: GetTableByIdQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<GetTableByIdQueryResponse, ResponseErrorConfig<GetTableById400 | GetTableById404 | GetTableById429>, unknown>({
    method: 'GET',
    url: `/tables/${id}`,
    params,
  })
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(res.data),
      },
    ],
  }
}