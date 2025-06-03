import client from '@kubb/plugin-client/clients/axios'
import type {
  GetTableDataByPostMutationRequest,
  GetTableDataByPostMutationResponse,
  GetTableDataByPostPathParams,
  GetTableDataByPostQueryParams,
  GetTableDataByPost400,
  GetTableDataByPost403,
  GetTableDataByPost404,
  GetTableDataByPost429,
} from '../../types/tableController/GetTableDataByPost.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get data from table by {id}.
 * {@link /tables/:id/data}
 */
export async function px_get_table_data_by_post_handler({
  id,
  data,
  params,
}: {
  id: GetTableDataByPostPathParams['id']
  data: GetTableDataByPostMutationRequest
  params?: GetTableDataByPostQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<
    GetTableDataByPostMutationResponse,
    ResponseErrorConfig<GetTableDataByPost400 | GetTableDataByPost403 | GetTableDataByPost404 | GetTableDataByPost429>,
    GetTableDataByPostMutationRequest
  >({ method: 'POST', url: `/tables/${id}/data`, params, data })
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(res.data),
      },
    ],
  }
}