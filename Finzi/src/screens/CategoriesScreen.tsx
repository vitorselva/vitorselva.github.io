import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { Category } from '../types';

const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE',
];

const CATEGORY_ICONS = [
  'restaurant', 'local-gas-station', 'shopping-cart', 'home', 'school',
  'medical-bag', 'directions-car', 'movie', 'fitness-center', 'phone',
  'electric-bolt', 'water-drop', 'wifi', 'pets', 'child-care',
];

export default function CategoriesScreen() {
  const { state, addCategory, updateCategory, deleteCategory } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome da categoria é obrigatório');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          ...editingCategory,
          ...formData,
          name: formData.name.trim(),
        });
      } else {
        await addCategory({
          ...formData,
          name: formData.name.trim(),
        });
      }
      setShowModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a categoria');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    // Check if category is being used
    const isUsed = state.expenses.some(expense => expense.categoryId === category.id);
    
    if (isUsed) {
      Alert.alert(
        'Categoria em Uso',
        'Esta categoria não pode ser excluída pois está sendo usada em gastos existentes.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a categoria "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const expenseCount = state.expenses.filter(expense => expense.categoryId === item.id).length;
    
    return (
      <View style={styles.categoryItem}>
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <MaterialIcons name={item.icon as any} size={24} color="#fff" />
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryUsage}>
              {expenseCount} gasto{expenseCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCategory(item)}
          >
            <MaterialIcons name="edit" size={20} color="#45B7D1" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCategory(item)}
          >
            <MaterialIcons name="delete" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categorias</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <FlatList
        data={state.categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="category" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Nenhuma categoria encontrada</Text>
            <Text style={styles.emptyStateText}>
              Adicione sua primeira categoria para organizar seus gastos
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            <TouchableOpacity onPress={handleSaveCategory}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Categoria</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Alimentação"
                placeholderTextColor="#999"
              />
            </View>

            {/* Color Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cor</Text>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Icon Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ícone</Text>
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      formData.icon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, icon })}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={formData.icon === icon ? '#fff' : '#666'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visualização</Text>
              <View style={styles.previewContainer}>
                <View style={[styles.previewIcon, { backgroundColor: formData.color }]}>
                  <MaterialIcons name={formData.icon as any} size={32} color="#fff" />
                </View>
                <Text style={styles.previewName}>
                  {formData.name || 'Nome da categoria'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#45B7D1',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryUsage: {
    fontSize: 14,
    color: '#666',
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#45B7D1',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconOptionSelected: {
    backgroundColor: '#45B7D1',
    borderColor: '#45B7D1',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});