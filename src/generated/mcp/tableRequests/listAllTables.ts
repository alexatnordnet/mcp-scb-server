import client from '@kubb/plugin-client/clients/axios'
import type { ListAllTablesQueryResponse, ListAllTablesQueryParams } from '../../types/tableController/ListAllTables.ts'
import type { ResponseErrorConfig } from '@kubb/plugin-client/clients/axios'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types'

/**
 * @summary Get all Tables.
 * {@link /tables}
 */
export async function px_list_all_tables_handler({ params }: { params?: ListAllTablesQueryParams }): Promise<Promise<CallToolResult>> {
  const res = await client<ListAllTablesQueryResponse, ResponseErrorConfig<Error>, unknown>({ method: 'GET', url: `/tables`, params })
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(res.data),
      },
    ],
  }
}