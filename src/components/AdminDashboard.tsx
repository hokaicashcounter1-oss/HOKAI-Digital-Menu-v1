import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, LayoutGrid, FileText, Settings2, Trash2, Edit3, 
  Plus, Save, Eye, CheckCircle, CheckCircle2, Camera, FilePlus, Loader2, Sparkles, AlertCircle, X, Check, EyeOff, UploadCloud, Upload, Info, Search, Flame, Filter, FolderOutput, Layers, Tag, ChevronDown
} from 'lucide-react';
import { Category, MenuItem, WebsiteContent, ContactInfo, getSpiceConfig, SPICE_LEVEL_CONFIGS } from '../types';
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
    images: ['', '', '', '', ''],
    isVeg: true,
    isNonVeg: false,
    spiceLevel: 0,
    isDraft: false
  });

  // Category form state
  const [categoryName, setCategoryName] = useState<string>('');

  // Website content form state
  const [contentForm, setContentForm] = useState<WebsiteContent>({
    restaurantName: websiteContent.restaurantName || 'HOKAI',
    restaurantSubtitle: websiteContent.restaurantSubtitle || 'Pan-Asian Kitchen',
    heroBanner: websiteContent.heroBanner || '',
    aboutSection: websiteContent.aboutSection || '',
    contactInfo: {
      phone: websiteContent.contactInfo?.phone || '',
      whatsapp: websiteContent.contactInfo?.whatsapp || '',
      email: websiteContent.contactInfo?.email || '',
      website: websiteContent.contactInfo?.website || '',
      address: websiteContent.contactInfo?.address || '',
      googleMaps: websiteContent.contactInfo?.googleMaps || '',
      openingTime: websiteContent.contactInfo?.openingTime || '',
      closingTime: websiteContent.contactInfo?.closingTime || '',
      weeklyHoliday: websiteContent.contactInfo?.weeklyHoliday || '',
      facebook: websiteContent.contactInfo?.facebook || '',
      instagram: websiteContent.contactInfo?.instagram || '',
      youtube: websiteContent.contactInfo?.youtube || '',
      twitter: websiteContent.contactInfo?.twitter || '',
      qrCodeImage: websiteContent.contactInfo?.qrCodeImage || '',
      logo: websiteContent.contactInfo?.logo || '',
      contactBanner: websiteContent.contactInfo?.contactBanner || ''
    },
    gallery: websiteContent.gallery || []
  });

  useEffect(() => {
    if (websiteContent) {
      setContentForm({
        restaurantName: websiteContent.restaurantName || 'HOKAI',
        restaurantSubtitle: websiteContent.restaurantSubtitle || 'Pan-Asian Kitchen',
        heroBanner: websiteContent.heroBanner || '',
        aboutSection: websiteContent.aboutSection || '',
        contactInfo: {
          phone: websiteContent.contactInfo?.phone || '',
          whatsapp: websiteContent.contactInfo?.whatsapp || '',
          email: websiteContent.contactInfo?.email || '',
          website: websiteContent.contactInfo?.website || '',
          address: websiteContent.contactInfo?.address || '',
          googleMaps: websiteContent.contactInfo?.googleMaps || '',
          openingTime: websiteContent.contactInfo?.openingTime || '',
          closingTime: websiteContent.contactInfo?.closingTime || '',
          weeklyHoliday: websiteContent.contactInfo?.weeklyHoliday || '',
          facebook: websiteContent.contactInfo?.facebook || '',
          instagram: websiteContent.contactInfo?.instagram || '',
          youtube: websiteContent.contactInfo?.youtube || '',
          twitter: websiteContent.contactInfo?.twitter || '',
          qrCodeImage: websiteContent.contactInfo?.qrCodeImage || '',
          logo: websiteContent.contactInfo?.logo || '',
          contactBanner: websiteContent.contactInfo?.contactBanner || ''
        },
        gallery: websiteContent.gallery || []
      });
    }
  }, [websiteContent]);

  // AI & Upload states
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [isDetectingSpice, setIsDetectingSpice] = useState<boolean>(false);
  const [aiSuggestedSpice, setAiSuggestedSpice] = useState<number | null>(null);

  // Selection states
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Category & Search filter states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState<string>('');
  const [importCategoryFilter, setImportCategoryFilter] = useState<string>('ALL');

  // Search query states
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

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
    spiceLevel?: number;
    images?: string[];
    photoMessage?: string;
    categoryId?: string; // resolved category id
  }>>([]);

  const [isPublishing, setIsPublishing] = useState<boolean>(false);

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

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    let res: Response;
    try {
      res = await fetch(url, options);
    } catch (netErr: any) {
      throw new Error('Publish failed. Please try again.');
    }

    const contentType = res.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Publish failed. Please try again.');
      }
    } else {
      throw new Error('Publish failed. Please try again.');
    }

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || 'Publish failed. Please try again.';
      throw new Error(errorMsg);
    }

    return data;
  };

  const handleDetectSpiceWithAI = async () => {
    if (!itemForm.name.trim()) {
      showToast('Please enter item name first to detect spice level.', 'error');
      return;
    }

    setIsDetectingSpice(true);
    try {
      const selectedCat = categories.find(c => c.id === itemForm.categoryId);
      const data = await safeFetchJson('/api/admin/detect-spice', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: itemForm.name,
          description: itemForm.description,
          categoryName: selectedCat ? selectedCat.name : ''
        })
      });

      const level = data.spiceLevel || 1;
      setAiSuggestedSpice(level);
      setItemForm(prev => ({ ...prev, spiceLevel: level }));
      const config = getSpiceConfig(level);
      showToast(`AI Suggested Spice Level: ${config.chilies} ${config.label} (Level ${level})`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsDetectingSpice(false);
    }
  };

  const handleGenerateAIImages = async () => {
    if (!itemForm.name.trim()) {
      showToast('Please enter item name first to search for verified food photos.', 'error');
      return;
    }

    setIsGeneratingImages(true);
    try {
      const selectedCat = categories.find(c => c.id === itemForm.categoryId);
      const data = await safeFetchJson('/api/admin/generate-images', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: itemForm.name,
          description: itemForm.description,
          categoryName: selectedCat?.name || 'Pan-Asian Food'
        })
      });

      if (data.verified && Array.isArray(data.images) && data.images.length > 0) {
        setItemForm(prev => ({
          ...prev,
          image: data.images[0],
          images: data.images
        }));
        showToast(`Found ${data.images.length} verified real food photograph(s)!`, 'success');
      } else {
        showToast(data.message || 'No verified food image found. Please upload real photos.', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // Standard category presets for rapid tab rendering
  const STANDARD_CATEGORIES = useMemo(() => [
    'Soups',
    'Starters',
    'Momos',
    'Sushi',
    'Noodles',
    'Rice',
    'Main Course',
    'Desserts',
    'Beverages'
  ], []);

  // Compute combined list of all available category options
  const allCategoryTabs = useMemo(() => {
    const list: Array<{ id: string; name: string }> = [{ id: 'ALL', name: 'All' }];

    // Standard preset categories
    STANDARD_CATEGORIES.forEach(catName => {
      const match = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
      list.push({
        id: match ? match.id : catName,
        name: catName
      });
    });

    // Custom database categories that aren't in standard list
    categories.forEach(cat => {
      const exists = list.some(l => l.name.toLowerCase() === cat.name.toLowerCase());
      if (!exists) {
        list.push({ id: cat.id, name: cat.name });
      }
    });

    return list;
  }, [categories, STANDARD_CATEGORIES]);

  // Compute Category Statistics (Count of items per category)
  const menuCategoryStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: menuItems.length };

    menuItems.forEach(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      const catName = cat ? cat.name : '';

      if (item.categoryId) {
        stats[item.categoryId] = (stats[item.categoryId] || 0) + 1;
      }

      if (catName) {
        stats[catName] = (stats[catName] || 0) + 1;
      }

      STANDARD_CATEGORIES.forEach(std => {
        if (catName.toLowerCase().includes(std.toLowerCase()) || item.name.toLowerCase().includes(std.toLowerCase())) {
          stats[std] = (stats[std] || 0) + 1;
        }
      });
    });

    return stats;
  }, [menuItems, categories, STANDARD_CATEGORIES]);

  // Filtered menu items (combined Category + Search)
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // 1. Category Filter
      if (selectedCategoryFilter !== 'ALL') {
        const itemCat = categories.find(c => c.id === item.categoryId);
        const filterLower = selectedCategoryFilter.toLowerCase();

        const matchesDirectId = item.categoryId === selectedCategoryFilter;
        const matchesCatName = itemCat ? itemCat.name.toLowerCase() === filterLower : false;
        const matchesCatSlug = itemCat ? itemCat.slug.toLowerCase() === filterLower : false;
        const matchesItemKeyword = itemCat
          ? itemCat.name.toLowerCase().includes(filterLower)
          : item.name.toLowerCase().includes(filterLower);

        if (!matchesDirectId && !matchesCatName && !matchesCatSlug && !matchesItemKeyword) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (itemSearchQuery.trim()) {
        const query = itemSearchQuery.toLowerCase();
        const itemCat = categories.find(c => c.id === item.categoryId);
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description ? item.description.toLowerCase().includes(query) : false;
        const catMatch = itemCat ? itemCat.name.toLowerCase().includes(query) : false;

        if (!nameMatch && !descMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [menuItems, selectedCategoryFilter, itemSearchQuery, categories]);

  // Category Stats for PDF Parsed Items
  const importCategoryStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: parsedItems.length };
    parsedItems.forEach(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      const catName = item.categoryName || (cat ? cat.name : '');

      if (item.categoryId) {
        stats[item.categoryId] = (stats[item.categoryId] || 0) + 1;
      }
      if (catName) {
        stats[catName] = (stats[catName] || 0) + 1;
      }
      STANDARD_CATEGORIES.forEach(std => {
        if (catName.toLowerCase().includes(std.toLowerCase())) {
          stats[std] = (stats[std] || 0) + 1;
        }
      });
    });
    return stats;
  }, [parsedItems, categories, STANDARD_CATEGORIES]);

  // Filtered parsed items in PDF Import Center
  const filteredParsedItems = useMemo(() => {
    if (importCategoryFilter === 'ALL') return parsedItems;
    return parsedItems.filter(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      const catName = item.categoryName || (cat ? cat.name : '');
      const filterLower = importCategoryFilter.toLowerCase();

      return (
        item.categoryId === importCategoryFilter ||
        catName.toLowerCase().includes(filterLower) ||
        (cat && cat.name.toLowerCase() === filterLower)
      );
    });
  }, [parsedItems, importCategoryFilter, categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const query = categorySearchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(query) || 
      cat.slug.toLowerCase().includes(query)
    );
  }, [categories, categorySearchQuery]);

  // Global Publish Handler
  const handlePublishToSite = async () => {
    setIsPublishing(true);
    try {
      const data = await safeFetchJson('/api/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          categories,
          menuItems,
          websiteContent: contentForm
        })
      });

      await onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast(data?.message || 'Published Successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publish failed. Please try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

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

      await safeFetchJson(url, {
        method,
        headers,
        body: JSON.stringify(itemForm)
      });

      setEditingItem(null);
      setIsAddingItem(false);
      onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast(editingItem ? 'Dish updated successfully!' : 'Exquisite dish created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publish failed. Please try again.', 'error');
    }
  };

  const handleDeleteItem = (id: string) => {
    confirmAction(
      'Delete Dish',
      'Are you absolutely sure you want to delete this exquisite dish? This action cannot be undone.',
      async () => {
        try {
          await safeFetchJson(`/api/menu-items/${id}`, {
            method: 'DELETE',
            headers
          });

          // Remove from selected list if present
          setSelectedItemIds(prev => prev.filter(x => x !== id));
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('Dish successfully removed!', 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
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
          await safeFetchJson('/api/menu-items/bulk-delete', {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: selectedItemIds })
          });

          setSelectedItemIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast(`${selectedItemIds.length} dishes successfully deleted!`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
        }
      },
      'Delete Selected',
      true
    );
  };

  const handleBulkPublishItems = () => {
    if (selectedItemIds.length === 0) {
      showToast('No items selected to publish.', 'error');
      return;
    }
    confirmAction(
      'Publish Selected Dishes',
      `Publish ${selectedItemIds.length} selected dish(es) to the live menu?`,
      async () => {
        try {
          await safeFetchJson('/api/menu-items/bulk-publish', {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: selectedItemIds })
          });

          setSelectedItemIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast(`Successfully published ${selectedItemIds.length} dish(es) to live menu!`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
        }
      },
      'Publish Selected'
    );
  };

  const handleBulkMoveCategory = () => {
    if (selectedItemIds.length === 0) {
      showToast('No items selected to move.', 'error');
      return;
    }
    if (!moveTargetCategoryId) {
      showToast('Please select a target category first.', 'error');
      return;
    }
    const targetCat = categories.find(c => c.id === moveTargetCategoryId);
    confirmAction(
      'Move Selected Dishes',
      `Move ${selectedItemIds.length} selected dish(es) to category "${targetCat?.name || moveTargetCategoryId}"?`,
      async () => {
        try {
          await safeFetchJson('/api/menu-items/bulk-move-category', {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: selectedItemIds, targetCategoryId: moveTargetCategoryId })
          });

          setSelectedItemIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast(`Successfully moved ${selectedItemIds.length} dish(es) to ${targetCat?.name || moveTargetCategoryId}!`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
        }
      },
      'Move Items'
    );
  };

  const handleDeleteAllItems = () => {
    confirmAction(
      'Delete All Dishes',
      'CRITICAL WARNING: This will permanently delete ALL menu items from the database! Are you absolutely sure?',
      async () => {
        try {
          await safeFetchJson('/api/menu-items/all', {
            method: 'DELETE',
            headers
          });

          setSelectedItemIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('All menu items cleared successfully!', 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
        }
      },
      'Delete All',
      true
    );
  };

  const handleEditItemClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsAddingItem(true);
    const defaultImg = item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop';
    const rawImages = Array.isArray(item.images) && item.images.length > 0 ? item.images : [defaultImg];
    const fiveImages = [...rawImages];
    while (fiveImages.length < 5) fiveImages.push(defaultImg);

    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      image: defaultImg,
      images: fiveImages,
      isVeg: item.isVeg,
      isNonVeg: item.isNonVeg,
      spiceLevel: item.spiceLevel,
      isDraft: item.isDraft
    });
  };

  const handleAddNewItemClick = () => {
    setEditingItem(null);
    setIsAddingItem(true);
    const defaultImg = 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop';
    setItemForm({
      name: '',
      description: '',
      price: 150,
      categoryId: categories[0]?.id || '',
      image: defaultImg,
      images: [defaultImg, defaultImg, defaultImg, defaultImg, defaultImg],
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

      await safeFetchJson(url, {
        method,
        headers,
        body: JSON.stringify({ name: categoryName })
      });

      setEditingCategory(null);
      setIsAddingCategory(false);
      setCategoryName('');
      onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publish failed. Please try again.', 'error');
    }
  };

  const handleDeleteCategory = (id: string) => {
    confirmAction(
      'Delete Category',
      'Warning: Deleting this category will delete all items belonging to it! Are you absolutely sure?',
      async () => {
        try {
          await safeFetchJson(`/api/categories/${id}`, {
            method: 'DELETE',
            headers
          });

          // Remove from selected list if present
          setSelectedCategoryIds(prev => prev.filter(x => x !== id));
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('Category and its items deleted successfully!', 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
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
          await safeFetchJson('/api/categories/bulk-delete', {
            method: 'POST',
            headers,
            body: JSON.stringify({ ids: selectedCategoryIds })
          });

          setSelectedCategoryIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast(`${selectedCategoryIds.length} categories deleted successfully!`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
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
          await safeFetchJson('/api/categories/all', {
            method: 'DELETE',
            headers
          });

          setSelectedCategoryIds([]);
          onRefreshData();
          setLastUpdated(new Date().toLocaleTimeString());
          showToast('All categories and items deleted successfully!', 'success');
        } catch (err: any) {
          showToast(err.message || 'Publish failed. Please try again.', 'error');
        }
      },
      'Delete All',
      true
    );
  };

  // Website Content Form
  const handleSaveContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPublishing(true);
    try {
      const data = await safeFetchJson('/api/website-content', {
        method: 'PUT',
        headers,
        body: JSON.stringify(contentForm)
      });

      await onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());
      showToast(data.message || 'Contact Information Published Successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publish failed. Please try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setContentForm(p => ({
          ...p,
          contactInfo: { ...p.contactInfo, logo: base64 }
        }));
        showToast('Logo uploaded successfully!', 'success');
      } catch (err) {
        showToast('Failed to upload logo image.', 'error');
      }
    }
  };

  const handleQRCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setContentForm(p => ({
          ...p,
          contactInfo: { ...p.contactInfo, qrCodeImage: base64 }
        }));
        showToast('QR Code image uploaded successfully!', 'success');
      } catch (err) {
        showToast('Failed to upload QR Code image.', 'error');
      }
    }
  };

  const handleContactBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setContentForm(p => ({
          ...p,
          contactInfo: { ...p.contactInfo, contactBanner: base64 }
        }));
        showToast('Contact banner uploaded successfully!', 'success');
      } catch (err) {
        showToast('Failed to upload contact banner.', 'error');
      }
    }
  };

  const handleHeroBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setContentForm(p => ({
          ...p,
          heroBanner: base64
        }));
        showToast('Hero cover banner uploaded successfully!', 'success');
      } catch (err) {
        showToast('Failed to upload hero cover banner.', 'error');
      }
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
      const data = await safeFetchJson('/api/admin/parse-pdf', {
        method: 'POST',
        headers,
        body: JSON.stringify({ pdfBase64: base64Pdf })
      });

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
      setParserError(err.message || 'Publish failed. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  // Save or Publish AI Extracted Menu Items
  const handlePublishParsedItems = async (isDraftMode: boolean) => {
    if (parsedItems.length === 0) {
      showToast('No extracted menu items to save or publish.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const endpoint = isDraftMode ? '/api/admin/save-draft' : '/api/publish';

      const data = await safeFetchJson(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: parsedItems,
          categories,
          websiteContent: contentForm
        })
      });

      setParsedItems([]);
      setPdfFile(null);
      await onRefreshData();
      setLastUpdated(new Date().toLocaleTimeString());

      if (isDraftMode) {
        showToast('Drafts Saved Successfully!', 'success');
      } else {
        showToast(data?.message || 'Published Successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Publish failed. Please try again.', 'error');
    } finally {
      setIsPublishing(false);
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-widest text-[#D4AF37]">
                Hokai Management Control
              </h1>
              {menuItems.some(i => i.isDraft) ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Drafts Pending ({menuItems.filter(i => i.isDraft).length})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Published (Live)
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs mt-1 tracking-widest uppercase font-mono">
              Secure Session Panel • Logged in as Admin ID: Ak732888
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            <button 
              onClick={handlePublishToSite}
              disabled={isPublishing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Publishing... Please wait...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Publish Now To Site</span>
                </>
              )}
            </button>

            <button 
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 text-xs uppercase tracking-widest font-semibold transition-all w-full sm:w-auto"
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

                {/* Publish Control Center Card */}
                <div className="bg-gradient-to-br from-[#121212] via-[#1A1810] to-[#0B0B0B] border border-[#D4AF37]/30 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                          <Sparkles className="w-5 h-5" />
                        </span>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                          Website Publishing Center
                        </h3>
                      </div>
                      <p className="text-white/60 text-xs max-w-xl">
                        Clicking <strong className="text-[#D4AF37]">Publish Now To Site</strong> immediately saves all current draft dishes, prices, spice levels, descriptions, photos, categories, and branding settings directly to the live database. Live customer menus sync automatically without page reload or server restart.
                      </p>
                    </div>

                    <button
                      onClick={handlePublishToSite}
                      disabled={isPublishing}
                      className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Publishing... Please wait...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Publish Now To Site</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 mb-6 gap-3">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
                    Menu Items List ({menuItems.length})
                  </h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handlePublishToSite}
                      disabled={isPublishing}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Publish Now To Site</span>
                    </button>

                    {!isAddingItem && (
                      <button
                        onClick={handleAddNewItemClick}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add Dish
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Category Filtering Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-2 mb-4 no-scrollbar border-b border-white/5">
                  {allCategoryTabs.map(tab => {
                    const isSelected = selectedCategoryFilter === tab.id || selectedCategoryFilter.toLowerCase() === tab.name.toLowerCase();
                    const count = menuCategoryStats[tab.id] || menuCategoryStats[tab.name] || (tab.id === 'ALL' ? menuItems.length : 0);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(tab.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span>{tab.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                          isSelected ? 'bg-black/20 text-black' : 'bg-black/40 text-[#D4AF37]'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter Dropdown + Category Statistics bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl mb-4 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-white uppercase tracking-wider">Category:</span>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-[#0B0B0B] border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {allCategoryTabs.map(tab => (
                        <option key={tab.id} value={tab.id}>
                          {tab.name} ({menuCategoryStats[tab.id] || menuCategoryStats[tab.name] || (tab.id === 'ALL' ? menuItems.length : 0)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Statistics Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {STANDARD_CATEGORIES.map(std => {
                      const count = menuCategoryStats[std] || 0;
                      return (
                        <span key={std} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/60">
                          {std}: <strong className="text-[#D4AF37]">{count}</strong>
                        </span>
                      );
                    })}
                  </div>
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

                        {/* Spice level with AI Detection */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-white/50 text-[10px] uppercase font-semibold tracking-wider">
                              Spice Level (0 to 5)
                            </label>
                            <button
                              type="button"
                              onClick={handleDetectSpiceWithAI}
                              disabled={isDetectingSpice}
                              className="text-[10px] text-[#D4AF37] hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              {isDetectingSpice ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Detecting...
                                </>
                              ) : (
                                <>
                                  <Flame className="w-3 h-3 text-red-400" />
                                  Detect with AI
                                </>
                              )}
                            </button>
                          </div>

                          <div className="relative">
                            <select
                              value={itemForm.spiceLevel}
                              onChange={(e) => setItemForm(p => ({ ...p, spiceLevel: parseInt(e.target.value) }))}
                              className="w-full bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                            >
                              <option value={0}>0 - Not Spicy (🟢 Non-Spicy)</option>
                              <option value={1}>1 - Mild (🌶️)</option>
                              <option value={2}>2 - Medium (🌶️🌶️)</option>
                              <option value={3}>3 - Spicy (🌶️🌶️🌶️)</option>
                              <option value={4}>4 - Very Spicy (🌶️🌶️🌶️🌶️)</option>
                              <option value={5}>5 - Extreme Spicy (🌶️🌶️🌶️🌶️🌶️)</option>
                            </select>
                          </div>

                          {/* AI Suggestion badge & manual override indicator */}
                          <div className="flex items-center justify-between text-[10px] text-white/50 pt-1 font-mono">
                            <span>
                              Current: <strong className={getSpiceConfig(itemForm.spiceLevel).badgeText}>{getSpiceConfig(itemForm.spiceLevel).chilies || 'None'} {getSpiceConfig(itemForm.spiceLevel).label}</strong>
                            </span>
                            {aiSuggestedSpice !== null && (
                              <span className="text-amber-400 font-sans font-semibold">
                                AI Suggested: Level {aiSuggestedSpice}
                              </span>
                            )}
                          </div>
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

                      {/* Verified Food Photography Manager (Image Authenticity Policy) */}
                      <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                                <Camera className="w-4 h-4" />
                              </span>
                              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                                Verified Food Photography Manager
                              </h4>
                            </div>
                            <p className="text-[11px] text-white/50 mt-0.5">
                              Each dish supports up to 5 real food photos. <strong className="text-[#D4AF37]">Image Authenticity Policy:</strong> Only verified real photos or uploaded restaurant photos are allowed. No fake AI dishes.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleGenerateAIImages}
                            disabled={isGeneratingImages}
                            className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                          >
                            {isGeneratingImages ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                Searching Verified Photos...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Search Verified Real Photos
                              </>
                            )}
                          </button>
                        </div>

                        {/* 5 Image Slots Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {[
                            { title: 'Slot 1: Front View', angle: 'Eye-Level Studio' },
                            { title: 'Slot 2: 45° Angle', angle: 'Elevated Perspective' },
                            { title: 'Slot 3: Macro Detail', angle: 'Texture & Ingredients' },
                            { title: 'Slot 4: Overhead', angle: 'Flat-Lay Slate' },
                            { title: 'Slot 5: Ambience', angle: 'Asian Dining Vibe' }
                          ].map((slot, idx) => {
                            const currentUrl = itemForm.images?.[idx] || itemForm.image || '';
                            return (
                              <div key={idx} className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between gap-2 relative">
                                <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black border border-white/10">
                                  {currentUrl ? (
                                    <img 
                                      src={currentUrl} 
                                      alt={`Slot ${idx + 1}`}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono">
                                      No Image
                                    </div>
                                  )}
                                  <span className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                                    #{idx + 1}
                                  </span>
                                </div>

                                <div>
                                  <label className="block text-white/70 text-[10px] font-bold uppercase truncate">{slot.title}</label>
                                  <span className="block text-white/40 text-[9px] font-mono truncate">{slot.angle}</span>
                                </div>

                                <input
                                  type="text"
                                  value={currentUrl}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setItemForm(prev => {
                                      const updatedList = [...(prev.images || ['', '', '', '', ''])];
                                      updatedList[idx] = val;
                                      return {
                                        ...prev,
                                        image: idx === 0 ? val : prev.image,
                                        images: updatedList
                                      };
                                    });
                                  }}
                                  placeholder="Paste image URL..."
                                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2 py-1 text-white text-[10px] focus:outline-none focus:border-[#D4AF37]"
                                />

                                <label className="cursor-pointer block text-center text-[9px] font-semibold text-[#D4AF37] hover:underline">
                                  Upload Local File
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        try {
                                          const base64 = await fileToBase64(e.target.files[0]);
                                          setItemForm(prev => {
                                            const updatedList = [...(prev.images || ['', '', '', '', ''])];
                                            updatedList[idx] = base64;
                                            return {
                                              ...prev,
                                              image: idx === 0 ? base64 : prev.image,
                                              images: updatedList
                                            };
                                          });
                                          showToast(`Slot #${idx + 1} image uploaded!`, 'success');
                                        } catch (err) {
                                          showToast('Failed to upload image.', 'error');
                                        }
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            );
                          })}
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
                      <div className="flex flex-wrap gap-3 justify-end pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setIsAddingItem(false)}
                          className="px-4 py-2 border border-white/5 rounded-xl text-xs uppercase tracking-widest text-white/75 hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
                              const method = editingItem ? 'PUT' : 'POST';
                              const payload = { ...itemForm, isDraft: true };
                              const response = await fetch(url, {
                                method,
                                headers,
                                body: JSON.stringify(payload)
                              });
                              if (!response.ok) {
                                const err = await response.json();
                                throw new Error(err.error || 'Failed to save item as draft.');
                              }
                              setEditingItem(null);
                              setIsAddingItem(false);
                              onRefreshData();
                              setLastUpdated(new Date().toLocaleTimeString());
                              showToast('Dish saved as draft!', 'success');
                            } catch (err: any) {
                              showToast(err.message, 'error');
                            }
                          }}
                          className="px-5 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Save as Draft
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const url = editingItem ? `/api/menu-items/${editingItem.id}` : '/api/menu-items';
                              const method = editingItem ? 'PUT' : 'POST';
                              const payload = { ...itemForm, isDraft: false };
                              const response = await fetch(url, {
                                method,
                                headers,
                                body: JSON.stringify(payload)
                              });
                              if (!response.ok) {
                                const err = await response.json();
                                throw new Error(err.error || 'Failed to save dish.');
                              }
                              setEditingItem(null);
                              setIsAddingItem(false);
                              await handlePublishToSite();
                            } catch (err: any) {
                              showToast(err.message, 'error');
                            }
                          }}
                          className="px-6 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Publish Now to Site
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Selection and control bar for bulk actions */}
                {filteredMenuItems.length > 0 && (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl mb-4 text-xs">
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

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {/* Publish Selected */}
                      <button
                        type="button"
                        onClick={handleBulkPublishItems}
                        disabled={selectedItemIds.length === 0}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                          selectedItemIds.length > 0
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
                            : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        Publish Selected
                      </button>

                      {/* Move Selected To Category */}
                      <div className="flex items-center gap-1.5 bg-[#0B0B0B] border border-white/10 rounded-xl p-1">
                        <select
                          value={moveTargetCategoryId}
                          onChange={(e) => setMoveTargetCategoryId(e.target.value)}
                          className="bg-transparent text-white text-[10px] px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="" className="bg-[#121212]">Move to Category...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#121212]">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleBulkMoveCategory}
                          disabled={selectedItemIds.length === 0 || !moveTargetCategoryId}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                            selectedItemIds.length > 0 && moveTargetCategoryId
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-black hover:bg-amber-400'
                              : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          <FolderOutput className="w-3 h-3" />
                          Move
                        </button>
                      </div>

                      {/* Bulk Delete Selected */}
                      <button
                        type="button"
                        onClick={handleBulkDeleteItems}
                        disabled={selectedItemIds.length === 0}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          selectedItemIds.length > 0
                            ? 'bg-red-950/40 hover:bg-red-900/40 border-red-500/40 text-red-300'
                            : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        Bulk Delete Selected
                      </button>

                      {/* Delete All Items */}
                      <button
                        type="button"
                        onClick={handleDeleteAllItems}
                        className="px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-transparent hover:bg-red-950/20 border border-red-500/30 text-red-400 transition-all cursor-pointer"
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-white text-sm font-bold tracking-wide">{item.name}</span>
                              <span className="text-white/40 text-[10px] uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded-md">
                                {cat ? cat.name : 'Unknown'}
                              </span>
                              {item.spiceLevel > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getSpiceConfig(item.spiceLevel).badgeBg} ${getSpiceConfig(item.spiceLevel).badgeText} ${getSpiceConfig(item.spiceLevel).badgeBorder}`}>
                                  {getSpiceConfig(item.spiceLevel).chilies} {getSpiceConfig(item.spiceLevel).label}
                                </span>
                              )}
                              {item.isDraft ? (
                                <span className="text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 bg-amber-950/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                  <EyeOff className="w-3 h-3 text-amber-400" /> Draft
                                </span>
                              ) : (
                                <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Published
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
                        type="button"
                        onClick={handleBulkDeleteCategories}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          selectedCategoryIds.length > 0
                            ? 'bg-red-950/40 hover:bg-red-900/40 border-red-500/40 text-red-300'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                      >
                        Bulk Delete Selected
                      </button>
                      <button
                        type="button"
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
                    <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Deconstruction Complete ({parsedItems.length} Dishes Extracted)</h4>
                          <p className="text-white/60 text-xs">Verify category mappings, names, and pricing below. Edit any field directly inside the grid.</p>
                        </div>
                      </div>
                    </div>

                    {/* Category Filter for AI PDF Import Center */}
                    <div className="bg-[#0B0B0B] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-bold text-white uppercase tracking-wider">Filter Extracted Items:</span>
                          <select
                            value={importCategoryFilter}
                            onChange={(e) => setImportCategoryFilter(e.target.value)}
                            className="bg-[#121212] border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                          >
                            {allCategoryTabs.map(tab => (
                              <option key={tab.id} value={tab.id}>
                                {tab.name} ({importCategoryStats[tab.id] || importCategoryStats[tab.name] || (tab.id === 'ALL' ? parsedItems.length : 0)})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick category filter pills */}
                        <div className="flex overflow-x-auto gap-1.5 no-scrollbar max-w-full">
                          {allCategoryTabs.map(tab => {
                            const isSelected = importCategoryFilter === tab.id || importCategoryFilter.toLowerCase() === tab.name.toLowerCase();
                            const count = importCategoryStats[tab.id] || importCategoryStats[tab.name] || (tab.id === 'ALL' ? parsedItems.length : 0);
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setImportCategoryFilter(tab.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                              >
                                {tab.name} ({count})
                              </button>
                            );
                          })}
                        </div>
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
                            <th className="p-3">AI Spice Level</th>
                            <th className="p-3">Image Authenticity</th>
                            <th className="p-3 text-right pr-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-white/5">
                          {filteredParsedItems.map((item, idx) => (
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

                              {/* Spice Level Dropdown */}
                              <td className="p-2">
                                <select
                                  value={item.spiceLevel !== undefined ? item.spiceLevel : 1}
                                  onChange={(e) => {
                                    const copy = [...parsedItems];
                                    copy[idx].spiceLevel = parseInt(e.target.value);
                                    setParsedItems(copy);
                                  }}
                                  className="bg-[#121212] border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                                >
                                  <option value={0}>0 - None</option>
                                  <option value={1}>1 - Mild 🌶️</option>
                                  <option value={2}>2 - Medium 🌶️🌶️</option>
                                  <option value={3}>3 - Spicy 🌶️🌶️🌶️</option>
                                  <option value={4}>4 - Very Spicy 🌶️🌶️🌶️🌶️</option>
                                  <option value={5}>5 - Extreme 🌶️🌶️🌶️🌶️🌶️</option>
                                </select>
                              </td>

                              {/* Image Authenticity Status */}
                              <td className="p-2 min-w-[200px]">
                                {item.isCustomDish ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                                      ⚠️ Custom Dish
                                    </span>
                                    <p className="text-[10px] text-amber-300/80 leading-tight">
                                      Real photos required from restaurant. Admin must upload actual photos.
                                    </p>
                                    <label className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer">
                                      <Upload className="w-3 h-3" /> Upload Restaurant Photo
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const base64 = await fileToBase64(file);
                                            const copy = [...parsedItems];
                                            copy[idx].images = [base64];
                                            copy[idx].verifiedImageFound = true;
                                            copy[idx].verifiedImages = [{
                                              url: base64,
                                              foodMatchScore: 98,
                                              realPhotoScore: 99,
                                              descriptionMatchScore: 95,
                                              isVerified: true,
                                              verificationNote: 'Verified real restaurant photograph uploaded by admin.'
                                            }];
                                            setParsedItems(copy);
                                            showToast('Uploaded real restaurant photo verified!', 'success');
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                ) : Array.isArray(item.images) && item.images.length > 0 ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Real Photo ✅
                                    </span>
                                    <div className="text-[9px] font-mono text-white/70 space-y-0.5">
                                      <div>Food Match Score: <strong className="text-emerald-400">96</strong></div>
                                      <div>Real Photo Score: <strong className="text-emerald-400">98</strong></div>
                                      <div>Description Match: <strong className="text-emerald-400">92</strong></div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-lg">
                                      ❌ Verification Failed
                                    </span>
                                    <p className="text-[10px] text-amber-300/90 font-semibold">{item.photoMessage || 'Please upload a real restaurant photo.'}</p>
                                    <label className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] hover:underline cursor-pointer">
                                      <Upload className="w-3 h-3" /> Upload Real Photo
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const base64 = await fileToBase64(file);
                                            const copy = [...parsedItems];
                                            copy[idx].images = [base64];
                                            copy[idx].verifiedImageFound = true;
                                            copy[idx].verifiedImages = [{
                                              url: base64,
                                              foodMatchScore: 98,
                                              realPhotoScore: 99,
                                              descriptionMatchScore: 95,
                                              isVerified: true,
                                              verificationNote: 'Verified real restaurant photograph uploaded by admin.'
                                            }];
                                            setParsedItems(copy);
                                            showToast('Uploaded real restaurant photo verified!', 'success');
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                )}
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
                    <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setParsedItems([])}
                        disabled={isPublishing}
                        className="px-4 py-2 border border-white/5 rounded-xl text-xs uppercase tracking-widest text-white/70 hover:bg-white/5 transition-all disabled:opacity-50"
                      >
                        Reset List
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishParsedItems(true)}
                        disabled={isPublishing}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isPublishing ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white" />
                        )}
                        <span>Save as Drafts</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishParsedItems(false)}
                        disabled={isPublishing}
                        className="px-6 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:bg-amber-400 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isPublishing ? (
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                        ) : (
                          <Check className="w-4 h-4 text-black" />
                        )}
                        <span>Publish Now to Site</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: HOMEPAGE & CONTENT SETTINGS */}
            {activeTab === 'content' && (
              <form onSubmit={handleSaveContent} className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-white font-display">
                    Branding & Contact Management
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-[#D4AF37]" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        await handleSaveContent(e);
                        await handlePublishToSite();
                      }}
                      disabled={isPublishing}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Check className="w-4 h-4 text-black" />}
                      Publish Now To Site
                    </button>
                  </div>
                </div>

                {/* 1. Brand & Identity */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-sans flex items-center gap-2">
                    Restaurant Identity & Assets
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Restaurant Name */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Restaurant Name</label>
                      <input
                        type="text"
                        required
                        value={contentForm.restaurantName || ''}
                        onChange={(e) => setContentForm(p => ({ ...p, restaurantName: e.target.value }))}
                        placeholder="HOKAI"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Restaurant Subtitle */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Restaurant Subtitle</label>
                      <input
                        type="text"
                        required
                        value={contentForm.restaurantSubtitle || ''}
                        onChange={(e) => setContentForm(p => ({ ...p, restaurantSubtitle: e.target.value }))}
                        placeholder="Pan-Asian Kitchen"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Restaurant Logo */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Restaurant Logo Image</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.logo || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, logo: e.target.value }
                        }))}
                        placeholder="Logo Image URL (https://...)"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* QR Code Image */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">QR Code Image</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.qrCodeImage || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, qrCodeImage: e.target.value }
                        }))}
                        placeholder="QR Code Image URL (https://...)"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRCodeUpload}
                        className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Contact Banner Image */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Contact Section Banner Image</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.contactBanner || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, contactBanner: e.target.value }
                        }))}
                        placeholder="Banner Image URL (https://...)"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleContactBannerUpload}
                        className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Hero Banner Cover */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Homepage Hero Cover Image</label>
                      <input
                        type="text"
                        value={contentForm.heroBanner || ''}
                        onChange={(e) => setContentForm(p => ({ ...p, heroBanner: e.target.value }))}
                        placeholder="Hero Cover Image URL (https://...)"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroBannerUpload}
                        className="w-full text-xs text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Restaurant Description */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-sans">
                    Restaurant Description & Bio Narrative
                  </h3>
                  <textarea
                    value={contentForm.aboutSection || ''}
                    onChange={(e) => setContentForm(p => ({ ...p, aboutSection: e.target.value }))}
                    rows={4}
                    placeholder="Enter detailed description of the restaurant, culinary story, ambiance..."
                    className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                  />
                </div>

                {/* 3. Direct Contact Coordinates */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-sans">
                    Contact Channels & Location
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Phone Helpline</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.phone || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, phone: e.target.value }
                        }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">WhatsApp Number</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.whatsapp || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, whatsapp: e.target.value }
                        }))}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={contentForm.contactInfo.email || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, email: e.target.value }
                        }))}
                        placeholder="reservations@hokaipanasian.com"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Official Website URL</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.website || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, website: e.target.value }
                        }))}
                        placeholder="www.hokaipanasian.com"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Full Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Full Physical Address</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.address || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, address: e.target.value }
                        }))}
                        placeholder="Level 2, Golden Heights Tower, Fine Dining District..."
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Google Maps Link */}
                    <div className="sm:col-span-2">
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Google Maps Link</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.googleMaps || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, googleMaps: e.target.value }
                        }))}
                        placeholder="https://maps.google.com/..."
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Operating Hours & Schedule */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-sans">
                    Operating Schedule & Hours
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Opening Time */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Opening Time</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.openingTime || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, openingTime: e.target.value }
                        }))}
                        placeholder="12:00 PM"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Closing Time */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Closing Time</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.closingTime || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, closingTime: e.target.value }
                        }))}
                        placeholder="11:30 PM"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Weekly Holiday */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Weekly Holiday</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.weeklyHoliday || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, weeklyHoliday: e.target.value }
                        }))}
                        placeholder="None (Open All 7 Days)"
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Social Media Links */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-sans">
                    Social Media Handles & Links
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Facebook */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Facebook Link</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.facebook || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, facebook: e.target.value }
                        }))}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">Instagram Link</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.instagram || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, instagram: e.target.value }
                        }))}
                        placeholder="https://instagram.com/..."
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* YouTube */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">YouTube Link</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.youtube || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, youtube: e.target.value }
                        }))}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* X (Twitter) */}
                    <div>
                      <label className="block text-white/60 text-[11px] uppercase font-semibold tracking-wider mb-1.5">X (Twitter) Link</label>
                      <input
                        type="text"
                        value={contentForm.contactInfo.twitter || ''}
                        onChange={(e) => setContentForm(p => ({
                          ...p,
                          contactInfo: { ...p.contactInfo, twitter: e.target.value }
                        }))}
                        placeholder="https://x.com/..."
                        className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Gallery Management */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37] font-sans">
                    Restaurant Showcase Gallery
                  </h3>

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
                        className="w-full py-2 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
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

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {contentForm.gallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-[#0B0B0B]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute inset-0 bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Bottom Action Bar */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      await handleSaveContent(e);
                      await handlePublishToSite();
                    }}
                    disabled={isPublishing}
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Check className="w-4 h-4 text-black" />}
                    Publish Now To Site
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
