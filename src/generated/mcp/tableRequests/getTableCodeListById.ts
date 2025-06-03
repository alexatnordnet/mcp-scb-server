import client from '@kubb/plugin-client/clients/axios'
import type {
  GetTableCodeListByIdQueryResponse,
  GetTableCodeListByIdPathParams,
  GetTableCodeListByIdQueryParams,
  GetTableCodeListById400,
  GetTableCodeListById404,
  GetTableCodeListById429,
} from '../../types/tableController/GetTableCodeListById.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get Codelist by {id}.
 * {@link /codelists/:id}
 */
export async function px_get_table_code_px_list_by_id_handler({
  id,
  params,
}: {
  id: GetTableCodeListByIdPathParams['id']
  params?: GetTableCodeListByIdQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<
    GetTableCodeListByIdQueryResponse,
    ResponseErrorConfig<GetTableCodeListById400 | GetTableCodeListById404 | GetTableCodeListById429>,
    unknown
  >({ method: 'GET', url: `/codelists/${id}`, params })
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(res.data),
      },
    ],
  }
}