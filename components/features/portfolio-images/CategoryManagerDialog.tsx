'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useImageCategories, useCreateImageCategory, useDeleteImageCategory } from '@/hooks/useImageCategories'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

export function CategoryManagerDialog() {
  const [open, setOpen] = useState(false)
  const { data: categories = [], isLoading } = useImageCategories()
  const createCategory = useCreateImageCategory()
  const deleteCategory = useDeleteImageCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      await createCategory.mutateAsync(data)
      toast.success('Categoría creada')
      reset()
    } catch (error) {
      toast.error('Error al crear categoría')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro? Las imágenes en esta categoría perderán su asignación.')) return

    try {
      await deleteCategory.mutateAsync(id)
      toast.success('Categoría eliminada')
    } catch (error) {
      toast.error('Error al eliminar categoría')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gestionar Categorías</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
          <DialogDescription>
            Crea y elimina categorías para organizar tus imágenes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden pt-4">
          <div className="w-1/3 space-y-4">
            <h4 className="font-semibold text-sm">Nueva Categoría</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...register('name')} placeholder="Ej: Bodas, Retratos" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Input id="description" {...register('description')} placeholder="Breve descripción" />
              </div>
              <Button type="submit" className="w-full" disabled={createCategory.isPending}>
                {createCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear
              </Button>
            </form>
          </div>

          <div className="flex-1 border-l pl-6 overflow-hidden flex flex-col">
            <h4 className="font-semibold text-sm mb-4">Categorías Existentes</h4>
            <div className="border rounded-md flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">Cargando...</TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-slate-500">
                        No hay categorías creadas
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-slate-500 text-sm">{category.description || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleteCategory.isPending}
                            aria-label={`Eliminar categoría ${category.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
