import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, LayoutGrid, FileText, Settings2, Trash2, Edit3, 
  Plus, Save, Eye, CheckCircle, FilePlus, Loader2, Sparkles, AlertCircle, X, Check, EyeOff, UploadCloud, Info, Search
} from 'lucide-react';
import { Category, MenuItem, WebsiteContent, ContactInfo } from '../types';
import ConfirmationDialog from './ConfirmationDialog';

interface AdminDashboardProps {
  categories: Category[];
  menuItems: MenuItem[];
  websiteContent: WebsiteContent;
  onRefreshData: () => void;
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({
  categories,
  menuItems,
  websiteContent,
  onRefreshData,
  token,
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'categories' | 'ai-import' | 'content'>('overview');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Editing states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);

  // New item form state
  const [itemForm, setItemForm] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id || '',
    image: '',
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  });

  // Selection states
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Search query states
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return menuItems;
    const query = itemSearchQuery.toLowerCase();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query)) ||
      categories.find(c => c.id === item.categoryId)?.name.toLowerCase().includes(query)
    );
  }, [menuItems, itemSearchQuery, categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const query = categorySearchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) || 
      cat.slug.toLowerCase().includes(query)
    );
  }, [categories, categorySearchQuery]);

  // Premium Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmLabel?: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmLabel = 'Delete',
    isDanger = true
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmLabel,
      isDanger
    });
  };

  // New category form state
  const [categoryName, setCategoryName] = useState<string>('');

  // Website content form state
  const [contentForm, setContentForm] = useState<WebsiteContent>({
    restaurantName: websiteContent.restaurantName || 'HOKAI',
    restaurantSubtitle: websiteContent.restaurantSubtitle || 'Pan-Asian Kitchen',
    heroBanner: websiteContent.heroBanner,
    aboutSection: websiteContent.aboutSection,
    contactInfo: websiteContent.contactInfo,
    gallery: websiteContent.gallery
  });

  // PDF Parser States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingStep, setParsingStep] = useState<string>('');
  const [parserError, setParserError] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<Array<{
    categoryName: string;
    name: string;
    description: string;
    price: number;
    isVeg: boolean;
    categoryId?: string; // resolved category id
  }>>([]);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  // File to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- ACTIONS HANDLERS ---

  // Items CRUD
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(itemForm)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save menu item.');
      }

      setEditingItem(null);
      setIsAddingItem(false);
      onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast(editingItem ? 'Dish updated successfully!' : 'Exquisite dish created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteItem = (id: string) => {
    confirmAction(
      'Delete Dish',
      'Are you absolutely sure you want to delete this exquisite dish? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/menu-items/${id}`, {
            method: 'DELETE',
            headers
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to delete menu item.');
          }

          // Remove from selected list if present
          setSelectedItemIds(prev => prev.filter(x => x !== id));
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('Dish successfully removed!', 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      'Delete',
      true
    );
  };

  const handleBulkDeleteItems = () => {
    if (selectedItemIds.length === 0) {
      showToast('No items selected for bulk deletion.', 'error');
      return;
    }
    confirmAction(
      'Bulk Delete Dishes',
      `Are you absolutely sure you want to delete the ${selectedItemIds.length} selected dishes? This action cannot be undone.`,
      async () => {
        try {
          const response = await fetch('/api/menu-items/bulk-delete', {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: selectedItemIds })
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to delete selected items.');
          }

          setSelectedItemIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast(`${selectedItemIds.length} dishes successfully deleted!`, 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      'Delete Selected',
      true
    );
  };

  const handleDeleteAllItems = () => {
    confirmAction(
      'Delete All Dishes',
      'CRITICAL WARNING: This will permanently delete ALL menu items from the database! Are you absolutely sure?',
      async () => {
        try {
          const response = await fetch('/api/menu-items/all', {
            method: 'DELETE',
            headers
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to clear all menu items.');
          }

          setSelectedItemIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('All menu items cleared successfully!', 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      'Delete All',
      true
    );
  };

  const handleEditItemClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddingItem(true);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      image: item.image,
      isVeg: item.isVeg,
      isNonVeg: item.isNonVeg,
      spiceLevel: item.spiceLevel,
      isDraft: item.isDraft
    });
  };

  const handleAddNewItemClick = () => {
    setEditingItem(null);
    setIsAddingItem(true);
    setItemForm({
      name: '',
      description: '',
      price: 150,
      categoryId: categories[0]?.id || '',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
      isVeg: true,
      isNonVeg: false,
      spiceLevel: 0,
      isDraft: false
    });
  };

  // Convert uploaded image to base64 for easy hosting in JSON
  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setItemForm(prev => ({ ...prev, image: base64 }));
        showToast('Image uploaded and optimized!', 'success');
      } catch (err) {
        console.error('Error loading image file:', err);
        showToast('Failed to parse uploaded image.', 'error');
      }
    }
  };

  // Categories CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ name: categoryName })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save category.');
      }

      setEditingCategory(null);
      setIsAddingCategory(false);
      setCategoryName('');
      onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = (id: string) => {
    confirmAction(
      'Delete Category',
      'Warning: Deleting this category will delete all items belonging to it! Are you absolutely sure?',
      async () => {
        try {
          const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to delete category.');
          }

          // Remove from selected list if present
          setSelectedCategoryIds(prev => prev.filter(x => x !== id));
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('Category and its items deleted successfully!', 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      'Delete',
      true
    );
  };

  const handleBulkDeleteCategories = () => {
    if (selectedCategoryIds.length === 0) {
      showToast('No categories selected for bulk deletion.', 'error');
      return;
    }
    confirmAction(
      'Bulk Delete Categories',
      `Warning: Deleting these ${selectedCategoryIds.length} categories will also delete all associated menu dishes! Are you absolutely sure?`,
      async () => {
        try {
          const response = await fetch('/api/categories/bulk-delete', {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: selectedCategoryIds })
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to delete selected categories.');
          }

          setSelectedCategoryIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast(`${selectedCategoryIds.length} categories deleted successfully!`, 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      'Delete Selected',
      true
    );
  };

  const handleDeleteAllCategories = () => {
    confirmAction(
      'Delete All Categories',
      'CRITICAL WARNING: This will permanently delete ALL categories AND ALL menu items! Are you absolutely sure?',
      async () => {
        try {
          const response = await fetch('/api/categories/all', {
            method: 'DELETE',
            headers
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to clear all categories.');
          }

          setSelectedCategoryIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('All categories and items deleted successfully!', 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      },
      'Delete All',
      true
    );
  };

  // Website Content Form
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/website-content', {
        method: 'PUT',
        headers,
        body: JSON.stringify(contentForm)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update website content.');
      }

      onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast('Website brand settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Add gallery image
  const [newGalleryUrl, setNewGalleryUrl] = useState<string>('');
  const handleAddGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      setContentForm(prev => ({
        ...prev,
        gallery: [...prev.gallery, newGalleryUrl.trim()]
      }));
      setNewGalleryUrl('');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const newImages = [];
        for (let i = 0; i < e.target.files.length; i++) {
          const base64 = await fileToBase64(e.target.files[i]);
          newImages.push(base64);
        }
        setContentForm(prev => ({
          ...prev,
          gallery: [...prev.gallery, ...newImages]
        }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setContentForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx)
    }));
  };

  // AI PDF Importer workflow
  const handlePdfUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setParserError(null);
    }
  };

  const triggerAIParsing = async () => {
    if (!pdfFile) return;
    setIsParsing(true);
    setParserError(null);
    setParsingStep('Initializing parser environment...');

    try {
      setParsingStep('Converting PDF document to binary Base64 representation...');
      const base64Pdf = await fileToBase64(pdfFile);

      setParsingStep('Querying Gemini 3.6-flash AI model to read and structure your menu...');
      const response = await fetch('/api/admin/parse-pdf', {
        method: 'POST',
        headers,
        body: JSON.stringify({ pdfBase64: base64Pdf })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The model failed to parse this specific document layout.');
      }

      setParsingStep('Resolving extracted food categories against current database...');
      // Align or mapping extracted categories
      const mapped = data.items.map((item: any) => {
        // Find existing category matching by slug or name
        const match = categories.find(c => 
          c.name.toLowerCase() === item.categoryName.toLowerCase() ||
          c.slug === item.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        );
        return {
          ...item,
          categoryId: match ? match.id : categories[0]?.id // Fallback to first category
        };
      });

      setParsedItems(mapped);
      setParsingStep('Parsing successfully completed!');
    } catch (err: any) {
      setParserError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  // Publish AI extracted draft menu
  const handlePublishParsedItems = async (isDraftMode: boolean) => {
    try {
      // Loop over and post each item
      for (const item of parsedItems) {
        const itemPayload = {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId || categories[0]?.id,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
          isVeg: item.isVeg,
          isNonVeg: !item.isVeg,
          spiceLevel: 0,
          isDraft: isDraftMode // publish now or save as draft
        };

        const res = await fetch('/api/menu-items', {
          method: 'POST',
          headers,
          body: JSON.stringify(itemPayload)
        });
        if (!res.ok) {
          throw new Error('Failed while saving some imported menu items.');
        }
      }

      setParsedItems([]);
      setPdfFile(null);
      onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      alert(isDraftMode ? 'Seeded successfully as DRAFTS. Check Menu Items tab to preview!' : 'AI Menu Published instantly to live website!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pt-24 pb-16 relative">
      {/* Premium Success/Error Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-[#121212]/95 border-emerald-500/50 text-emerald-300'
                : 'bg-[#121212]/95 border-red-500/50 text-red-300'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-widest text-[#D4AF37]">
              Hokai Management Control
            </h1>
            <p className="text-white/50 text-xs mt-1 tracking-widest uppercase">
              Secure Session Panel • Logged in as Admin ID: Ak732888
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 text-xs uppercase tracking-widest font-semibold transition-all w-full md:w-auto"
            >
              Terminate Session
            </button>
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Tabs (3 cols) */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 bg-white/5 border border-white/10 backdrop-blur-xl p-2 rounded-2xl no-scrollbar shadow-lg">
            {/* Overview */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeTab === 'overview'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-transparent border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>

            {/* Menu Items */}
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeTab === 'menu'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-transparent border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Menu Items
            </button>

            {/* Categories */}
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeTab === 'categories'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-transparent border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              Categories
            </button>

            {/* AI PDF Importer */}
            <button
              onClick={() => setActiveTab('ai-import')}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeTab === 'ai-import'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'bg-transparent border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI PDF Import
            </button>

            {/* Website Content */}
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                activeTab === 'content'
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-transparent border-transparent text-white/70 hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              Content Settings
            </button>
          </div>

          {/* Core Content Area (9 cols) */}
          <div className="lg:col-span-9 bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl min-h-[500px] shadow-2xl">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-6 font-display border-b border-white/10 pb-2">
                  System Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {/* Total Items */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden shadow-xl">
                    <div className="absolute right-3 top-3 opacity-10 text-[#D4AF37]"><LayoutGrid className="w-12 h-12" /></div>
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Total Menu Items</span>
                    <span className="text-4xl font-bold font-mono text-white">{menuItems.length}</span>
                    <span className="block text-[10px] text-white/30 mt-2 font-mono">Published: {menuItems.filter(i=>!i.isDraft).length} • Drafts: {menuItems.filter(i=>i.isDraft).length}</span>
                  </div>

                  {/* Total Categories */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden shadow-xl">
                    <div className="absolute right-3 top-3 opacity-10 text-[#D4AF37]"><Settings2 className="w-12 h-12" /></div>
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Active Categories</span>
                    <span className="text-4xl font-bold font-mono text-[#D4AF37]">{categories.length}</span>
                    <span className="block text-[10px] text-white/30 mt-2">Dynamic smartphone routing</span>
                  </div>

                  {/* Last Sync */}
                  <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden shadow-xl">
                    <div className="absolute right-3 top-3 opacity-10 text-emerald-500"><CheckCircle className="w-12 h-12" /></div>
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">Database Integrity</span>
                    <span className="text-xl font-bold text-emerald-400 block truncate mt-2 font-mono">ONLINE</span>
                    <span className="block text-[10px] text-white/30 mt-1 font-mono">Last update: {lastUpdated}</span>
                  </div>
                </div>

                <div className="bg-yellow-950/15 border border-yellow-500/20 p-5 rounded-2xl flex gap-3 items-start">
                  <Info className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[#D4AF37] text-sm font-semibold tracking-wider uppercase mb-1">QR Code Menu Integration Note</h3>
                    <p className="text-white/70 text-xs leading-relaxed">
                      All modifications, edits, and AI additions to your digital menu update instantly on the smartphone interface. Because your hosting URL does not change, existing printed QR codes will work indefinitely without needing regeneration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MENU ITEMS MANAGER */}
            {activeTab === 'menu' && (
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
                    Menu Items List ({menuItems.length})
                  </h2>
                  {!isAddingItem && (
                    <button
                      onClick={handleAddNewItemClick}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  )}
                </div>

                {/* Premium Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Search dishes by name, description, category..."
                    className="block w-full pl-10 pr-10 py-3 bg-[#0B0B0B] border border-white/10 rounded-xl text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                  {itemSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setItemSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Adding or Editing Item Form */}
                <AnimatePresence>
                  {isAddingItem && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSaveItem}
                      className="bg-[#0B0B0B] border border-white/10 rounded-2xl p-5 mb-8 space-y-4"
                    >
                      <h3 className="text-white text-sm font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2 mb-2">
                        {editingItem ? `Edit Item: ${editingItem.name}` : 'Create New Gastronomic Creation'}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Item Name *</label>
                          <input
                            type="text"
                            required
                            value={itemForm.name}
                            onChange={(e) => setItemForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Price (₹) *</label>
                          <input
                            type="number"
                            required
                            value={itemForm.price}
                            onChange={(e) => setItemForm(p => ({ ...p, price: parseFloat(e.target.value) }))}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>

                        {/* Category Selector */}
                        <div>
                          <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Category *</label>
                          <select
                            value={itemForm.categoryId}
                            onChange={(e) => setItemForm(p => ({ ...p, categoryId: e.target.value }))}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Spice level */}
                        <div>
                          <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Spice Level (0 to 3)</label>
                          <select
                            value={itemForm.spiceLevel}
                            onChange={(e) => setItemForm(p => ({ ...p, spiceLevel: parseInt(e.target.value) }))}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                          >
                            <option value={0}>0 - No Spice</option>
                            <option value={1}>1 - Mild 🌶️</option>
                            <option value={2}>2 - Medium 🌶️🌶️</option>
                            <option value={3}>3 - Fiery 🌶️🌶️🌶️</option>
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Appetizing Description</label>
                        <textarea
                          value={itemForm.description}
                          onChange={(e) => setItemForm(p => ({ ...p, description: e.target.value }))}
                          rows={2}
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      {/* Image Source & Local File Upload combo */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-8">
                          <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Food Image URL</label>
                          <input
                            type="text"
                            value={itemForm.image}
                            onChange={(e) => setItemForm(p => ({ ...p, image: e.target.value }))}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Or Upload Local Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleItemImageUpload}
                            className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Diet switches & Draft toggle */}
                      <div className="flex flex-wrap gap-6 pt-2 border-t border-white/5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={itemForm.isVeg}
                            onChange={(e) => {
                              setItemForm(p => ({
                                ...p,
                                isVeg: e.target.checked,
                                isNonVeg: !e.target.checked
                              }));
                            }}
                            className="rounded border-white/20 text-[#D4AF37] focus:ring-0"
                          />
                          <span className="text-xs uppercase tracking-wider font-semibold text-white/80">Vegetarian Option</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={itemForm.isDraft}
                            onChange={(e) => setItemForm(p => ({ ...p, isDraft: e.target.checked }))}
                            className="rounded border-white/20 text-[#D4AF37] focus:ring-0"
                          />
                          <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">Keep as Draft (Invisible on Public menu)</span>
                        </label>
                      </div>

                      {/* Form buttons */}
                      <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setIsAddingItem(false)}
                          className="px-4 py-2 border border-white/5 rounded-xl text-xs uppercase tracking-widest text-white/75 hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1 shadow-lg"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Dish
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Selection and control bar for bulk actions */}
                {filteredMenuItems.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl mb-4 text-xs">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-white/70 font-semibold uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={filteredMenuItems.length > 0 && filteredMenuItems.every(i => selectedItemIds.includes(i.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const filteredIds = filteredMenuItems.map(i => i.id);
                              setSelectedItemIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                            } else {
                              const filteredIds = filteredMenuItems.map(i => i.id);
                              setSelectedItemIds(prev => prev.filter(id => !filteredIds.includes(id)));
                            }
                          }}
                          className="rounded border-white/20 text-[#D4AF37] focus:ring-0 w-4 h-4"
                        />
                        Select All
                      </label>
                      <span className="text-white/40 font-mono">({selectedItemIds.length} Selected)</span>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleBulkDeleteItems}
                        disabled={selectedItemIds.length === 0}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          selectedItemIds.length > 0
                            ? 'bg-red-950/40 hover:bg-red-900/40 border-red-500/40 text-red-300 cursor-pointer'
                            : 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        Bulk Delete Selected
                      </button>
                      <button
                        onClick={handleDeleteAllItems}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-transparent hover:bg-red-950/20 border border-red-500/30 text-red-400 transition-all cursor-pointer ml-auto sm:ml-0"
                      >
                        Delete All Items
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State for Search */}
                {filteredMenuItems.length === 0 && (
                  <div className="p-8 text-center bg-[#0B0B0B]/60 border border-white/5 rounded-2xl">
                    <p className="text-white/50 text-sm font-sans mb-3">No dishes matched your search criteria.</p>
                    <button
                      onClick={() => setItemSearchQuery('')}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Items grid for admin control */}
                <div className="space-y-3">
                  {filteredMenuItems.map(item => {
                    const cat = categories.find(c => c.id === item.categoryId);
                    return (
                      <div 
                        key={item.id}
                        className={`bg-[#0B0B0B] border rounded-2xl p-3 flex items-center justify-between gap-4 transition-all ${
                          selectedItemIds.includes(item.id) ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItemIds(prev => [...prev, item.id]);
                              } else {
                                setSelectedItemIds(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            className="rounded border-white/20 text-[#D4AF37] focus:ring-0 w-4 h-4 flex-shrink-0 cursor-pointer"
                          />
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white text-sm font-bold tracking-wide">{item.name}</span>
                              <span className="text-white/40 text-[10px] uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded-md">
                                {cat ? cat.name : 'Unknown'}
                              </span>
                              {item.isDraft && (
                                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20 bg-amber-500/10 px-1.5 rounded-md">
                                  Draft
                                </span>
                              )}
                            </div>
                            <span className="text-[#D4AF37] font-semibold text-xs font-mono">₹{item.price}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditItemClick(item)}
                            className="p-2 bg-white/5 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition-all"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-900/30 transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CATEGORIES MANAGER */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
                    Categories List ({categories.length})
                  </h2>
                  {!isAddingCategory && (
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryName('');
                        setIsAddingCategory(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Category
                    </button>
                  )}
                </div>

                {/* Premium Search Bar */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="Search categories by name or slug..."
                    className="block w-full pl-10 pr-10 py-3 bg-[#0B0B0B] border border-white/10 rounded-xl text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Add/Edit Category Form */}
                <AnimatePresence>
                  {isAddingCategory && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSaveCategory}
                      className="bg-[#0B0B0B] border border-white/10 rounded-2xl p-5 mb-6 flex gap-4 items-end"
                    >
                      <div className="flex-1">
                        <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-2">Category Name *</label>
                        <input
                          type="text"
                          required
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="e.g. Dim Sums, Curries..."
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-4 py-2.5 border border-white/5 rounded-xl text-xs uppercase tracking-widest text-white/75 hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest transition-all rounded-xl shadow-lg"
                        >
                          Save
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Selection and control bar for bulk actions */}
                {filteredCategories.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl mb-4 text-xs">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-white/70 font-semibold uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={filteredCategories.length > 0 && filteredCategories.every(c => selectedCategoryIds.includes(c.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const filteredIds = filteredCategories.map(c => c.id);
                              setSelectedCategoryIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                            } else {
                              const filteredIds = filteredCategories.map(c => c.id);
                              setSelectedCategoryIds(prev => prev.filter(id => !filteredIds.includes(id)));
                            }
                          }}
                          className="rounded border-white/20 text-[#D4AF37] focus:ring-0 w-4 h-4"
                        />
                        Select All
                      </label>
                      <span className="text-white/40 font-mono">({selectedCategoryIds.length} Selected)</span>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleBulkDeleteCategories}
                        disabled={selectedCategoryIds.length === 0}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          selectedCategoryIds.length > 0
                            ? 'bg-red-950/40 hover:bg-red-900/40 border-red-500/40 text-red-300 cursor-pointer'
                            : 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        Bulk Delete Selected
                      </button>
                      <button
                        onClick={handleDeleteAllCategories}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-transparent hover:bg-red-950/20 border border-red-500/30 text-red-400 transition-all cursor-pointer ml-auto sm:ml-0"
                      >
                        Delete All Categories
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State for Search */}
                {filteredCategories.length === 0 && (
                  <div className="p-8 text-center bg-[#0B0B0B]/60 border border-white/5 rounded-2xl">
                    <p className="text-white/50 text-sm font-sans mb-3">No categories matched your search criteria.</p>
                    <button
                      onClick={() => setCategorySearchQuery('')}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Categories listings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCategories.map(cat => (
                    <div 
                      key={cat.id}
                      className={`bg-[#0B0B0B] border rounded-2xl p-4 flex items-center justify-between transition-all ${
                        selectedCategoryIds.includes(cat.id) ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds(prev => [...prev, cat.id]);
                            } else {
                              setSelectedCategoryIds(prev => prev.filter(id => id !== cat.id));
                            }
                          }}
                          className="rounded border-white/20 text-[#D4AF37] focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <span className="text-white text-base font-bold tracking-wide block">{cat.name}</span>
                          <span className="block text-white/40 text-[10px] font-mono mt-0.5">slug: {cat.slug}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryName(cat.name);
                            setIsAddingCategory(true);
                          }}
                          className="p-2 bg-white/5 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-900/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: AI PDF MENU IMPORT SYSTEM */}
            {activeTab === 'ai-import' && (
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display mb-2 border-b border-white/5 pb-2">
                  AI PDF Menu Import Center
                </h2>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                  Instantly synchronize physical menu sheets. Upload a restaurant menu PDF, and our server-side Google Gemini 3.6-flash model will analyze the text, extract dishes, align prices, and categorize them accurately in real-time.
                </p>

                {/* Upload Area */}
                {!parsedItems.length && !isParsing && (
                  <div className="border-2 border-dashed border-white/10 hover:border-[#D4AF37]/50 rounded-2xl bg-[#0B0B0B]/40 p-8 text-center transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={handlePdfUploadChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-12 h-12 text-[#D4AF37] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    {pdfFile ? (
                      <div>
                        <h3 className="text-white font-medium text-sm mb-1">{pdfFile.name}</h3>
                        <p className="text-white/40 text-xs font-mono">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-white font-medium text-sm mb-1">Drag and drop restaurant menu PDF here</h3>
                        <p className="text-white/40 text-xs">Or click to select file from smartphone/desktop</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Parse action button */}
                {pdfFile && !parsedItems.length && !isParsing && (
                  <div className="mt-4 flex gap-3 justify-end">
                    <button 
                      onClick={() => setPdfFile(null)}
                      className="px-4 py-2 border border-white/5 rounded-xl text-xs uppercase tracking-widest text-white/70"
                    >
                      Clear File
                    </button>
                    <button
                      onClick={triggerAIParsing}
                      className="px-6 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-amber-400 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      Deconstruct with AI
                    </button>
                  </div>
                )}

                {/* Parsing loader */}
                {isParsing && (
                  <div className="p-12 text-center bg-[#0B0B0B]/50 border border-white/5 rounded-2xl">
                    <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-4" />
                    <h3 className="text-[#D4AF37] text-sm uppercase tracking-wider font-semibold mb-2 animate-pulse">Analyzing Document</h3>
                    <p className="text-white/70 text-xs font-mono max-w-md mx-auto">{parsingStep}</p>
                  </div>
                )}

                {/* Error feedback */}
                {parserError && (
                  <div className="mt-4 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex gap-3 items-start text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Failed to Parse Menu Layout</h4>
                      <p className="text-xs text-white/70">{parserError}</p>
                    </div>
                  </div>
                )}

                {/* Parsed items preview & interactive edit spreadsheet */}
                {parsedItems.length > 0 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl flex gap-3 items-center">
                      <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Deconstruction Complete</h4>
                        <p className="text-white/60 text-xs">Verify category mappings, names, and pricing below. Edit any field directly inside the grid.</p>
                      </div>
                    </div>

                    {/* Simple parsed table */}
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0B0B0B]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#121212] border-b border-white/5 text-[10px] uppercase text-white/50 tracking-wider">
                            <th className="p-3 pl-4">Extracted Category</th>
                            <th className="p-3">Resolve Category</th>
                            <th className="p-3">Dish Name</th>
                            <th className="p-3">Appetizing Description</th>
                            <th className="p-3">Price (₹)</th>
                            <th className="p-3">Diet</th>
                            <th className="p-3 text-right pr-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                          {parsedItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-white/5">
                              {/* Extracted Category name */}
                              <td className="p-3 pl-4 text-xs font-mono text-white/50">{item.categoryName}</td>
                              
                              {/* Resolved Selector */}
                              <td className="p-2">
                                <select
                                  value={item.categoryId}
                                  onChange={(e) => {
                                    const copy = [...parsedItems];
                                    copy[idx].categoryId = e.target.value;
                                    setParsedItems(copy);
                                  }}
                                  className="bg-[#121212] border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                >
                                  {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </td>

                              {/* Dish name input */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => {
                                    const copy = [...parsedItems];
                                    copy[idx].name = e.target.value;
                                    setParsedItems(copy);
                                  }}
                                  className="bg-[#121212] border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                              </td>

                              {/* Description text input */}
                              <td className="p-2 min-w-[200px]">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => {
                                    const copy = [...parsedItems];
                                    copy[idx].description = e.target.value;
                                    setParsedItems(copy);
                                  }}
                                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                />
                              </td>

                              {/* Price input */}
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => {
                                    const copy = [...parsedItems];
                                    copy[idx].price = parseFloat(e.target.value) || 0;
                                    setParsedItems(copy);
                                  }}
                                  className="w-16 bg-[#121212] border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                                />
                              </td>

                              {/* Diet toggle */}
                              <td className="p-2">
                                <button
                                  onClick={() => {
                                    const copy = [...parsedItems];
                                    copy[idx].isVeg = !copy[idx].isVeg;
                                    setParsedItems(copy);
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
                                    item.isVeg ? 'bg-green-950/40 text-green-400 border border-green-500/25' : 'bg-red-950/40 text-red-400 border border-red-500/25'
                                  }`}
                                >
                                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                                </button>
                              </td>

                              {/* Remove row */}
                              <td className="p-2 text-right pr-4">
                                <button
                                  onClick={() => {
                                    setParsedItems(p => p.filter((_, i) => i !== idx));
                                  }}
                                  className="p-1.5 bg-red-950/20 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-900/30"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Publish Actions */}
                    <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={() => setParsedItems([])}
                        className="px-4 py-2 border border-white/5 rounded-xl text-xs uppercase tracking-widest text-white/70"
                      >
                        Reset List
                      </button>
                      <button
                        onClick={() => handlePublishParsedItems(true)}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-widest flex items-center gap-1.5"
                      >
                        <EyeOff className="w-4 h-4" />
                        Save as Drafts
                      </button>
                      <button
                        onClick={() => handlePublishParsedItems(false)}
                        className="px-6 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-amber-400 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Publish Now to Site
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: HOMEPAGE & CONTENT SETTINGS */}
            {activeTab === 'content' && (
              <form onSubmit={handleSaveContent} className="space-y-6">
                <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display border-b border-white/5 pb-2">
                  Branding & Narrative Settings
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-2">Restaurant Name</label>
                    <input
                      type="text"
                      required
                      value={contentForm.restaurantName || ''}
                      onChange={(e) => setContentForm(p => ({ ...p, restaurantName: e.target.value }))}
                      placeholder="HOKAI"
                      className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {/* Restaurant Subtitle */}
                  <div>
                    <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-2">Restaurant Subtitle</label>
                    <input
                      type="text"
                      required
                      value={contentForm.restaurantSubtitle || ''}
                      onChange={(e) => setContentForm(p => ({ ...p, restaurantSubtitle: e.target.value }))}
                      placeholder="Pan-Asian Kitchen"
                      className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Hero Banner Image */}
                <div>
                  <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-2">Homepage Hero Cover URL</label>
                  <input
                    type="text"
                    value={contentForm.heroBanner}
                    onChange={(e) => setContentForm(p => ({ ...p, heroBanner: e.target.value }))}
                    className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* About Paragraph Text */}
                <div>
                  <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-2">About Section Bio Narrative</label>
                  <textarea
                    value={contentForm.aboutSection}
                    onChange={(e) => setContentForm(p => ({ ...p, aboutSection: e.target.value }))}
                    rows={4}
                    className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                  />
                </div>

                {/* Contact Coordinates */}
                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-white text-base font-bold font-display uppercase tracking-wider mb-4 text-[#D4AF37]">
                    Contact Coordinates & Social Channels
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.phone}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, phone: e.target.value }
                        }))}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">WhatsApp ID (numbers only)</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.whatsapp}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, whatsapp: e.target.value }
                        }))}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Business Email</label>
                      <input
                        type="email"
                        value={contentForm.contactInfo.email}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, email: e.target.value }
                        }))}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.address}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, address: e.target.value }
                        }))}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Facebook */}
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Facebook Handle</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.facebook}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, facebook: e.target.value }
                        }))}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.instagram}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, instagram: e.target.value }
                        }))}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Management */}
                <div className="border-t border-white/5 pt-6">
                  <h3 className="text-white text-base font-bold font-display uppercase tracking-wider mb-4 text-[#D4AF37]">
                    Exquisite Gallery Manager
                  </h3>

                  {/* Add URL or upload multiple files */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
                    <div className="md:col-span-6">
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Add Image URL</label>
                      <input
                        type="text"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="w-full py-2 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                      >
                        Add URL
                      </button>
                    </div>
                    <div className="md:col-span-4">
                      <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider mb-1">Or Upload Gallery Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Images list with deletes */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {contentForm.gallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-[#0B0B0B]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute inset-0 bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
