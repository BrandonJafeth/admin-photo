'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ContactMessagesService } from '@/services/contact-messages.service'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import type { ContactMessage } from '@/services/contact-messages.service'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function MessagesManager() {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: () => ContactMessagesService.getAll(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
      case 'read':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Leído</Badge>
      case 'responded':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Respondido</Badge>
      case 'archived':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Archivado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns: ColumnDef<ContactMessage>[] = [
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <div className="text-sm text-slate-900">{format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: es })}</div>
          <div className="text-xs text-slate-500">
            {format(new Date(row.original.created_at), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Cliente',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-900">{row.original.name}</div>
          <div className="text-xs text-slate-600">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'service_type',
      header: 'Servicio',
      cell: ({ row }) => (
        row.original.service_type ? (
          <span className="text-sm text-slate-900">{row.original.service_type}</span>
        ) : (
          <span className="text-sm text-slate-500 italic">General</span>
        )
      ),
    },
    {
      accessorKey: 'event_date',
      header: 'Evento',
      cell: ({ row }) => (
        row.original.event_date ? (
          <span className="text-sm text-slate-900">{format(new Date(row.original.event_date), 'dd MMM yyyy', { locale: es })}</span>
        ) : (
          <span className="text-sm text-slate-500">-</span>
        )
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => getStatusBadge(row.original.status),
      filterFn: (row, id, value) => {
        if (value === 'all') return true
        return row.getValue(id) === value
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/mensajes/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver detalles</span>
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: messages,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto bg-[#F5F5F7]">
        <div className="p-4 md:p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 p-4 md:p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mensajes</h1>
                <p className="text-slate-600">Gestiona las solicitudes de contacto y reservas.</p>
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Actualizar
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, email o servicio..."
                  className="pl-8"
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <Select 
                value={filterStatus} 
                onValueChange={(value) => {
                  setFilterStatus(value)
                  table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="read">Leídos</SelectItem>
                  <SelectItem value="responded">Respondidos</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-600">
                  No se encontraron mensajes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
            </div>

            <div className="flex flex-col gap-4 pt-4">
        {/* Info row - Left aligned */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-slate-600">
            Mostrando{' '}
            <span className="font-medium text-slate-900">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            {' '}-{' '}
            <span className="font-medium text-slate-900">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>
            {' '}de{' '}
            <span className="font-medium text-slate-900">
              {table.getFilteredRowModel().rows.length}
            </span>
            {' '}mensajes
          </p>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-900 whitespace-nowrap">Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 25, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation controls - Centered */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primera página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          <div className="flex items-center gap-1 px-4">
            <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Página siguiente</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
