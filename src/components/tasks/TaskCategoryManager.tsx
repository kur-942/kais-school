import React, { useState } from 'react';
import { useTaskCategoryStore, predefinedIcons, predefinedColors, type TaskCategory } from '../../store/taskCategoryStore';
import { useAuth } from '../../context/AuthContext';

interface TaskCategoryManagerProps {
  onClose: () => void;
}

export const TaskCategoryManager: React.FC<TaskCategoryManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory } = useTaskCategoryStore();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#10b981',
    icon: '📌'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (editingCategory) {
      await updateCategory(editingCategory, formData);
    } else {
      await addCategory(user.id, formData.name, formData.color, formData.icon);
    }

    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: '', color: '#10b981', icon: '📌' });
  };

  const handleEdit = (category: TaskCategory) => {
    setEditingCategory(category.id);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les tâches associées ne seront pas supprimées mais n\'auront plus de catégorie.')) {
      await deleteCategory(categoryId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Gérer les catégories</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Add Category Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouvelle catégorie</span>
            </button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-700 mb-4">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h3>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Ex: Mathématiques"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({...formData, icon})}
                        className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all
                          ${formData.icon === icon 
                            ? 'bg-green-500 text-white ring-2 ring-green-500 ring-offset-2' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                  <div className="flex flex-wrap gap-3">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`w-8 h-8 rounded-full transition-all
                          ${formData.color === color 
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                            : ''
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCategory(null);
                      setFormData({ name: '', color: '#10b981', icon: '📌' });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
                  >
                    {editingCategory ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map(category => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{category.name}</h4>
                    <p className="text-xs text-gray-500">{category.task_count || 0} tâches</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune catégorie pour le moment</p>
                <p className="text-sm mt-2">Créez votre première catégorie pour organiser vos tâches</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};