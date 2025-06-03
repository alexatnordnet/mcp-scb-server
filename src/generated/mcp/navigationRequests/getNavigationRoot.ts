import client from '@kubb/plugin-client/clients/axios'
import type {
  GetNavigationRootQueryResponse,
  GetNavigationRootQueryParams,
  GetNavigationRoot400,
  GetNavigationRoot404,
  GetNavigationRoot429,
} from '../../types/navigationController/GetNavigationRoot.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get root Folder.
 * {@link /navigation}
 */
export async function px_get_navigation_root_handler({ params }: { params?: GetNavigationRootQueryParams }): Promise<Promise<CallToolResult>> {
  const res = await client<GetNavigationRootQueryResponse, ResponseErrorConfig<GetNavigationRoot400 | GetNavigationRoot404 | GetNavigationRoot429>, unknown>({
    method: 'GET',
    url: `/navigation`,
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