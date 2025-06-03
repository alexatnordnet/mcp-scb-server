import client from '@kubb/plugin-client/clients/axios'
import type {
  GetTableDataQueryResponse,
  GetTableDataPathParams,
  GetTableDataQueryParams,
  GetTableData400,
  GetTableData403,
  GetTableData404,
  GetTableData429,
} from '../../types/tableController/GetTableData.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get data from table by {id}.
 * {@link /tables/:id/data}
 */
export async function px_get_table_data_handler({
  id,
  params,
}: {
  id: GetTableDataPathParams['id']
  params?: GetTableDataQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<GetTableDataQueryResponse, ResponseErrorConfig<GetTableData400 | GetTableData403 | GetTableData404 | GetTableData429>, unknown>({
    method: 'GET',
    url: `/tables/${id}/data`,
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