import client from '@kubb/plugin-client/clients/axios'
import type {
  GetNavigationByIdQueryResponse,
  GetNavigationByIdPathParams,
  GetNavigationByIdQueryParams,
  GetNavigationById400,
  GetNavigationById404,
  GetNavigationById429,
} from '../../types/navigationController/GetNavigationById.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Gets Folder by {id}.
 * {@link /navigation/:id}
 */
export async function px_get_navigation_by_id_handler({
  id,
  params,
}: {
  id: GetNavigationByIdPathParams['id']
  params?: GetNavigationByIdQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<GetNavigationByIdQueryResponse, ResponseErrorConfig<GetNavigationById400 | GetNavigationById404 | GetNavigationById429>, unknown>({
    method: 'GET',
    url: `/navigation/${id}`,
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