import client from '@kubb/plugin-client/clients/axios'
import type {
  GetDefaultSelectionQueryResponse,
  GetDefaultSelectionPathParams,
  GetDefaultSelectionQueryParams,
  GetDefaultSelection400,
  GetDefaultSelection404,
  GetDefaultSelection429,
} from '../../types/tableController/GetDefaultSelection.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @description Get information about what is selected for the table by default when no selection is made i the /data endpoint.
 * @summary Get the default selection for Table by {id}.
 * {@link /tables/:id/defaultselection}
 */
export async function px_get_default_selection_handler({
  id,
  params,
}: {
  id: GetDefaultSelectionPathParams['id']
  params?: GetDefaultSelectionQueryParams
}): Promise<Promise<CallToolResult>> {
  const res = await client<
    GetDefaultSelectionQueryResponse,
    ResponseErrorConfig<GetDefaultSelection400 | GetDefaultSelection404 | GetDefaultSelection429>,
    unknown
  >({ method: 'GET', url: `/tables/${id}/defaultselection`, params })
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(res.data),
      },
    ],
  }
}