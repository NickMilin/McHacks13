import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { pantryFirebase } from '@/lib/pantryFirebase'
import { categoryLabels } from '@/lib/mockData'

export function Pantry() {
  const { user, isAuthenticated } = useAuth()
  const [pantryItems, setPantryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: 'other',
    expiryDate: ''
  })

  // Load items automatically when component mounts or user changes
  useEffect(() => {
    loadItems()
  }, [user])

  const loadItems = async () => {
    if (!user) return
    try {
      setLoading(true)
      const items = await pantryFirebase.getItems(user.uid)
      setPantryItems(items)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!user) return
    if (!newItem.name || !newItem.quantity) {
      setError('Name and quantity are required')
      return
    }
    try {
      const item = await pantryFirebase.addItem(user.uid, {
        name: newItem.name,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit || '',
        category: newItem.category,
        expiryDate: newItem.expiryDate || null
      })
      setPantryItems(prev => [...prev, item])
      setNewItem({
        name: '',
        quantity: '',
        unit: '',
        category: 'other',
        expiryDate: ''
      })
      setIsAddDialogOpen(false)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditItem = async () => {
    if (!user || !editingItem) return
    if (!editingItem.name || !editingItem.quantity) {
      setError('Name and quantity are required')
      return
    }
    try {
      await pantryFirebase.updateItem(user.uid, editingItem.id, {
        name: editingItem.name,
        quantity: parseFloat(editingItem.quantity),
        unit: editingItem.unit || '',
        category: editingItem.category,
        expiryDate: editingItem.expiryDate || null
      })
      setPantryItems(prev => prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      ))
      setEditingItem(null)
      setIsEditDialogOpen(false)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const openEditDialog = (item) => {
    setEditingItem({ ...item })
    setIsEditDialogOpen(true)
  }

  const deleteItem = async (itemId) => {
    if (!user) return
    try {
      await pantryFirebase.deleteItem(user.uid, itemId)
      setPantryItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      setError(err.message)
    }
  }

  const exportCSV = async () => {
    if (!user) return
    try {
      await pantryFirebase.exportToCSV(user.uid)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Pantry</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={!user}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      
      <div className="p-4 bg-gray-100 rounded space-y-2">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user?.email || 'None'}</p>
        <p><strong>Items:</strong> {pantryItems.length}</p>
        {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
      </div>

      <div className="space-x-2">
        <Button onClick={exportCSV} disabled={!user} variant="outline">
          Export CSV
        </Button>
      </div>

      <div className="space-y-2">
        {pantryItems.map(item => (
          <div key={item.id} className="p-4 bg-white border rounded flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold text-lg">{item.name}</p>
              <p className="text-sm text-gray-600">
                Quantity: <strong>{item.quantity}</strong> {item.unit}
              </p>
              <p className="text-sm text-gray-600">
                Category: <strong>{categoryLabels[item.category] || item.category}</strong>
              </p>
              {item.expiryDate && (
                <p className="text-sm text-gray-600">
                  Expires: <strong>{item.expiryDate}</strong>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => openEditDialog(item)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => deleteItem(item.id)} 
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {pantryItems.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No items in pantry. Click "Add Item" to get started!
          </p>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Pantry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Milk, Chicken, Tomatoes"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="e.g., kg, pcs, liters"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Milk, Chicken, Tomatoes"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 2"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    placeholder="e.g., kg, pcs, liters"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={editingItem.expiryDate || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
