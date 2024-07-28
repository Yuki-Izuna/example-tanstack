import * as React from 'react'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

declare module '@tanstack/table-core' {
  // @ts-expect-error
  interface ColumnMeta<TData extends RowData, TValue> {
    rowSpan?: number
  }
}

type Person = {
  test?: string
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const defaultData: Person[] = [
  {
    test: 'aaa',
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    test: 'bbb',
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    test: 'ccc',
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]

const columnHelper = createColumnHelper<Person>()

const columns = [
  columnHelper.group({
    id: 'hogehoge',
    header: () => <span>HOGEHOFE</span>,
    columns: [
      columnHelper.accessor('test', {
        cell: (info) => info.getValue(),

        meta: {
          rowSpan: 3,
        },
      }),
      columnHelper.group({
        id: 'hello',
        header: () => <span>Hello</span>,
        columns: [
          columnHelper.accessor('firstName', {
            cell: (info) => info.getValue(),

            meta: {
              rowSpan: 2,
            },
          }),
          columnHelper.accessor((row) => row.lastName, {
            id: 'lastName',
            cell: (info) => info.getValue(),
            header: () => <span>Last Name</span>,
            meta: {
              rowSpan: 2,
            },
          }),
        ],
      }),
      columnHelper.group({
        header: 'Info',
        columns: [
          columnHelper.group({
            header: 'More Info',
            columns: [
              columnHelper.accessor('visits', {
                header: () => <span>Visits</span>,
              }),
              columnHelper.accessor('status', {
                header: 'Status',
              }),
              columnHelper.accessor('progress', {
                header: 'Profile Progress',
              }),
            ],
          }),
          columnHelper.accessor('age', {
            header: () => 'Age',
            meta: {
              rowSpan: 2,
            },
          }),
        ],
      }),
    ],
  }),
]

export default function FlexibleHeaderTable() {
  const [data, setData] = React.useState(() => [...defaultData])
  const rerender = React.useReducer(() => ({}), {})[1]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2">
      <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #e5e7eb' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => {
            console.log('headerGroup', headerGroup)
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // 不要な中間ヘッダーを表示しないための処理
                  // header.depth: ヘッダーの深さ
                  // header.column.depth: ヘッダーグループの深さ
                  //
                  // 例:
                  //                 +-------------+----------------+------------------------------+
                  // header.depth: 1 | TEST(0)     | HELLO(0)       | INFO(0)                      |
                  //                 +-------------+----------------+------------------------------+
                  // header.depth: 2 | (0)         | FIRSTNAME(1)   | MORE INFO(1)                 |
                  //                 +-------------|                |-----------------+------------+
                  // header.depth: 3 | (0)         | (1)            | VISITS(2)       | STATUS(2)  |
                  //                 +-------------+----------------+-----------------+------------+
                  // ※header.column.depth: ()
                  //
                  // TEST: header.depthは縦方向に1, 2, 3、header.column.depthは3箇所すべて0（ヘッダーグループ化されていないため）
                  // FITSTNAME: header.depthは2, 3、header.column.depthは2箇所すべて1（HELLOによってヘッダーグループ化されているため深さは1）
                  // VISITS: header.depthは3, header.column.depthは2（INFOによってヘッダーグループ化されているため深さは2）
                  //
                  const columnRelativeDepth = header.depth - header.column.depth
                  if (columnRelativeDepth > 1) {
                    return null
                  }

                  // 縦方向に結合する行数のデフォルト値[1]
                  let rowSpan = 1

                  // プレースホルダーヘッダー（rowSpan > 1 の場合は isPlaceholder === trueとなる）
                  // プレースホルダーヘッダーの場合のみ、rowSpanを再計算する
                  if (header.isPlaceholder) {
                    // 階層的にネストされたリーフヘッダーを取得
                    const leafs = header.getLeafHeaders()
                    // depthの最大値をleafs配列の最後尾から取得し、現在の深さ(header.depth)を差し引く
                    // 差し引いた値が縦方向に結合するセルの行数になる
                    rowSpan = leafs[leafs.length - 1].depth - header.depth
                  }

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      rowSpan={rowSpan}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )
                })}
              </tr>
            )
          })}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '12px',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
