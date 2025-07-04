"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type Product, type ProductFormData, CATEGORIES } from "@/types/product"
import { useProducts } from "@/hooks/useProducts"
import { createProductForAPI, updateProductForAPI, getCurrentQuantity } from "@/lib/productUtils"
import { ArrowLeft, Save } from "lucide-react"

interface ProductFormProps {
  product?: Product
  isEditing?: boolean
}

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { addProduct, updateProduct } = useProducts()

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
  })

  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        quantity: getCurrentQuantity(product).toString(),
      })
      setTimeout(() => {
        setIsFormReady(true)
      }, 100)
    } else if (!isEditing) {
      setIsFormReady(true)
    }
  }, [product, isEditing])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    }

    if (!formData.category) {
      newErrors.category = "La categoría es obligatoria"
    }

    if (!formData.price.trim()) {
      newErrors.price = "El precio es obligatorio"
    } else {
      const price = parseFloat(formData.price)
      if (isNaN(price) || price <= 0) {
        newErrors.price = "El precio debe ser un número mayor a 0"
      }
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "La cantidad es obligatoria"
    } else {
      const quantity = parseInt(formData.quantity, 10)
      if (isNaN(quantity) || quantity < 0 || !Number.isInteger(Number(formData.quantity))) {
        newErrors.quantity = "La cantidad debe ser un número entero mayor o igual a 0"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const price = parseFloat(formData.price)
      const quantity = parseInt(formData.quantity, 10)

      // Validación adicional para asegurarnos de que los números son válidos
      if (isNaN(price) || price <= 0) {
        throw new Error("El precio debe ser un número válido mayor a 0")
      }

      if (isNaN(quantity) || quantity < 0) {
        throw new Error("La cantidad debe ser un número entero válido mayor o igual a 0")
      }

      const productData = createProductForAPI({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: price,
        quantity: quantity,
      })

      console.log("Datos del producto a enviar:", productData) // Debug log

      if (isEditing && product) {
        const updateData = updateProductForAPI({
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price: price,
          quantity: quantity,
        })
        await updateProduct(product.id, updateData)
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
        })
      } else {
        await addProduct(productData)
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente.",
        })
      }

      router.push("/products")
    } catch (error) {
      console.error("Error en formulario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <Button
                variant="ghost"
                onClick={() => router.push("/products")}
                className="mb-4 text-[#007BFF] hover:text-[#003B73] hover:bg-[#E0F0FF]"
                data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Productos
            </Button>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-[#007BFF] text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">
                {isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="product-form">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#003B73] font-medium">
                    Nombre del Producto *
                  </Label>
                  <Input
                      id="name"
                      data-testid="product-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF] ${
                          errors.name ? "border-red-500" : ""
                      }`}
                      placeholder="Ingrese el nombre del producto"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#003B73] font-medium">
                    Descripción *
                  </Label>
                  <Textarea
                      id="description"
                      data-testid="product-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF] min-h-[100px] ${
                          errors.description ? "border-red-500" : ""
                      }`}
                      placeholder="Ingrese la descripción del producto"
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#003B73] font-medium">
                    Categoría *
                  </Label>
                  {isFormReady ? (
                      <Select
                          data-testid="category-select"
                          key={`category-${product?.id || 'new'}-${formData.category}`}
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger
                            className={`border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF] ${
                                errors.category ? "border-red-500" : ""
                            }`}
                        >
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  ) : (
                      <div className="border border-gray-300 rounded-md px-3 py-2 text-gray-500">
                        Cargando...
                      </div>
                  )}
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-[#003B73] font-medium">
                      Precio *
                    </Label>
                    <Input
                        id="price"
                        data-testid="product-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className={`border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF] ${
                            errors.price ? "border-red-500" : ""
                        }`}
                        placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-[#003B73] font-medium">
                      Cantidad *
                    </Label>
                    <Input
                        id="quantity"
                        data-testid="product-quantity"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange("quantity", e.target.value)}
                        className={`border-gray-300 focus:border-[#007BFF] focus:ring-[#007BFF] ${
                            errors.quantity ? "border-red-500" : ""
                        }`}
                        placeholder="0"
                    />
                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/products")}
                      className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      disabled={isLoading}
                      data-testid="cancel-button"
                  >
                    Cancelar
                  </Button>
                  <Button
                      type="submit"
                      className="bg-[#007BFF] text-white hover:bg-[#003B73] focus:ring-[#007BFF]"
                      disabled={isLoading}
                      data-testid="submit-button"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading
                        ? isEditing
                            ? "Actualizando..."
                            : "Guardando..."
                        : isEditing
                            ? "Actualizar Producto"
                            : "Guardar Producto"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
