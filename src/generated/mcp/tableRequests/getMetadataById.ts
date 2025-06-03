import client from '@kubb/plugin-client/clients/axios'
import type {
  GetMetadataByIdQueryResponse,
  GetMetadataByIdPathParams,
  GetMetadataByIdQueryParams,
  GetMetadataById400,
  GetMetadataById404,
  GetMetadataById429,
} from '../../types/tableController/GetMetadataById.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @description **Used for listing detailed information about a specific table*** List all variables and values and all other metadata needed to be able to fetch data* Also links to where to:  + Fetch  - Where to get information about codelists* 2 output formats  + Custom json  - JSON-stat2
 * @summary Get Metadata about Table by {id}.
 * {@link /tables/:id/metadata}
 */
export async function px_get_metadata_by_id_handler({
  id,
  params,
}: {
  id: GetMetadataByIdPathParams['id']
  params?: GetMetadataByIdQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<GetMetadataByIdQueryResponse, ResponseErrorConfig<GetMetadataById400 | GetMetadataById404 | GetMetadataById429>, unknown>({
    method: 'GET',
    url: `/tables/${id}/metadata`,
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