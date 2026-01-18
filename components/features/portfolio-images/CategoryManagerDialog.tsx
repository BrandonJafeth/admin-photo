import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, Tag, LayoutGrid, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

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
import { 
  useImageCategories, 
  useCreateImageCategory, 
  useUpdateImageCategory, // Added import
  useDeleteImageCategory 
} from '@/hooks/useImageCategories'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(50, 'El nombre es muy largo'),
  description: z.string().max(200, 'La descripción es muy larga').optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

export function CategoryManagerDialog() {
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null)
  
  const { data: categories = [], isLoading } = useImageCategories()
  const createCategory = useCreateImageCategory()
  const updateCategory = useUpdateImageCategory() // Added hook
  const deleteCategory = useDeleteImageCategory()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      handleCancelEdit()
    }
  }

  const handleEdit = (category: { id: string, name: string, description?: string | null }) => {
    setEditingCategory({ id: category.id, name: category.name })
    setValue('name', category.name)
    setValue('description', category.description || '')
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    reset()
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: data.name,
          description: data.description
        })
        toast.success('Categoría actualizada', {
          description: `La categoría "${data.name}" se ha actualizado correctamente.`
        })
        handleCancelEdit()
      } else {
        await createCategory.mutateAsync(data)
        toast.success('Categoría creada', {
          description: `La categoría "${data.name}" se ha añadido correctamente.`
        })
        reset()
      }
    } catch (error) {
      toast.error(editingCategory ? 'Error al actualizar categoría' : 'Error al crear categoría', {
        description: 'Por favor intenta nuevamente.'
      })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Las imágenes asociadas perderán esta clasificación.`)) return

    try {
      await deleteCategory.mutateAsync(id)
      toast.success('Categoría eliminada')
      if (editingCategory?.id === id) {
        handleCancelEdit()
      }
    } catch (error) {
       toast.error('Error al eliminar categoría')
    }
  }

  // Derived state for button loading
  const isSubmitting = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-slate-200 bg-white/50 hover:bg-white hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <Tag className="w-4 h-4" />
          Gestionar Categorías
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white text-slate-950 shadow-2xl duration-300 data-[state=open]:zoom-in-95 sm:rounded-xl">
        <div className="p-6 pb-2 border-b border-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-slate-100 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-slate-600" />
              </div>
              <DialogTitle className="text-xl">Gestión de Categorías</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500">
              Organiza tu portafolio creando etiquetas para agrupar tus fotos.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Panel Izquierdo: Formulario */}
          <div className="w-full md:w-80 p-6 bg-slate-50 border-r border-slate-100 flex flex-col gap-6 overflow-y-auto transition-colors duration-300">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  {editingCategory ? (
                    <>
                      <Pencil className="w-4 h-4 text-amber-600" />
                      Editar Categoría
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-blue-600" />
                      Nueva Categoría
                    </>
                  )}
                </h3>
                {editingCategory && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="h-6 px-2 text-xs text-slate-500 hover:text-slate-900"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
              
              <p className="text-xs text-slate-500 mb-4">
                {editingCategory 
                  ? 'Modifica los datos de la categoría seleccionada.' 
                  : 'Añade una nueva clasificación para tus fotos.'}
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre</Label>
                  <Input 
                    id="name" 
                    {...register('name')} 
                    placeholder="Ej: Bodas, Retratos" 
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                  {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">Descripción (Opcional)</Label>
                  <Input 
                    id="description" 
                    {...register('description')} 
                    placeholder="Breve descripción para uso interno" 
                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                  />
                  {errors.description && <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className={`w-full shadow-sm transition-all ${
                      editingCategory 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCategory ? 'Guardando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        {editingCategory ? (
                          <>
                            <Pencil className="mr-2 h-4 w-4" />
                            Actualizar
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Categoría
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  
                  {editingCategory && (
                     <Button 
                      type="button" 
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 hover:bg-white"
                      onClick={handleCancelEdit}
                    >
                      Cancelar Edición
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className={`border rounded-lg p-4 text-xs hidden md:block mt-auto transition-colors ${
              editingCategory 
                ? 'bg-amber-50 border-amber-100 text-amber-800' 
                : 'bg-blue-50 border-blue-100 text-blue-800'
            }`}>
              <p className="font-semibold mb-1">💡 Tip</p>
              <p>
                {editingCategory 
                  ? 'Los cambios se reflejarán automáticamente en todas las imágenes que usen esta categoría.' 
                  : 'Las categorías te permiten filtrar y organizar tu galería pública. Intenta mantener nombres cortos y claros.'}
              </p>
            </div>
          </div>

          {/* Panel Derecho: Lista */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-semibold text-slate-900">
                Categorías Existentes 
                <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {categories.length}
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-auto p-0">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow className="border-slate-100 hover:bg-slate-50">
                    <TableHead className="w-[40%] text-slate-700 font-semibold pl-6 h-10">Nombre</TableHead>
                    <TableHead className="text-slate-700 font-semibold h-10">Descripción</TableHead>
                    <TableHead className="w-[100px] text-right pr-6 h-10">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading Skeletons
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-slate-100">
                        <TableCell className="pl-6"><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell className="pr-6"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : categories.length === 0 ? (
                    // Empty State
                    <TableRow>
                      <TableCell colSpan={3} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <Tag className="w-6 h-6 text-slate-300" />
                          </div>
                          <p className="font-medium">No hay categorías aun</p>
                          <p className="text-xs max-w-xs mx-auto text-slate-400">
                            Crea tu primera categoría usando el formulario de la izquierda.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // List
                    categories.map((category) => {
                      const isEditing = editingCategory?.id === category.id
                      return (
                        <TableRow 
                          key={category.id} 
                          className={`group border-slate-100 transition-colors ${
                            isEditing ? 'bg-amber-50 hover:bg-amber-50' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <TableCell className="font-medium text-slate-900 pl-6">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                isEditing ? 'bg-amber-500' : 'bg-blue-500'
                              }`}></span>
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm truncate max-w-[200px]">
                            {category.description || <span className="text-slate-300 italic">Sin descripción</span>}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 transition-colors ${
                                  isEditing 
                                    ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' 
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                onClick={() => handleEdit(category)}
                                disabled={isSubmitting}
                                aria-label={`Editar categoría ${category.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                onClick={() => handleDelete(category.id, category.name)}
                                disabled={isSubmitting}
                                aria-label={`Eliminar categoría ${category.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
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
