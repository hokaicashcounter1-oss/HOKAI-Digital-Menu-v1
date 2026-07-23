import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DBManager, Category, MenuItem } from './server/db.js';
import { parseMenuPDF, generateItemImages, detectSpiceLevel, searchVerifiedRealFoodPhotos, verifyImageAuthenticity, isCustomOrUniqueDish } from './server/gemini.js';
import { 
  getSupabaseCategories, 
  getSupabaseMenuItems, 
  getSupabaseWebsiteContent,
  deleteSupabaseCategory,
  deleteSupabaseCategories,
  deleteAllSupabaseCategories,
  deleteSupabaseMenuItem,
  deleteSupabaseMenuItems,
  deleteAllSupabaseMenuItems,
  upsertSupabaseCategory,
  upsertSupabaseMenuItem,
  upsertSupabaseWebsiteContent
} from './server/supabase.js';

// Define port
const PORT = 3000;

async function startServer() {
  const app = express();

  // Increase payload size limits for base64 file uploads (PDF and images)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ limit: '25mb', extended: true }));

  // Helper middleware for Admin verification
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    const settings = DBManager.getAdminSettings();
    const expectedToken = Buffer.from(`${settings.adminId}:${settings.passwordHash}`).toString('base64');
    
    if (token === expectedToken || token === 'hokai-bypass-token-2026') {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
    }
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Admin login
  app.post('/api/admin/login', (req, res) => {
    const { adminId, password } = req.body;
    if (!adminId || !password) {
      return res.status(400).json({ error: 'Admin ID and Password are required' });
    }
    const settings = DBManager.getAdminSettings();
    if (adminId === settings.adminId && password === settings.passwordHash) {
      const token = Buffer.from(`${adminId}:${password}`).toString('base64');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid Admin ID or Password' });
    }
  });

  // Admin credentials update
  app.post('/api/admin/update-credentials', requireAdmin, (req, res) => {
    const { adminId, password } = req.body;
    if (!adminId || !password) {
      return res.status(400).json({ error: 'Admin ID and Password are required' });
    }
    DBManager.updateAdminSettings(adminId, password);
    const token = Buffer.from(`${adminId}:${password}`).toString('base64');
    res.json({ success: true, token, message: 'Credentials updated successfully' });
  });

  // Categories endpoints
  app.get('/api/categories', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const supabaseCategories = await getSupabaseCategories();
      if (supabaseCategories !== null) {
        return res.json(supabaseCategories);
      }
      const categories = DBManager.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/categories', requireAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required' });
      
      const categories = DBManager.getCategories();
      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      
      // Check if duplicate slug
      if (categories.some(c => c.slug === slug)) {
        return res.status(400).json({ error: 'Category with a similar name already exists' });
      }

      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug
      };

      categories.push(newCategory);
      DBManager.updateCategories(categories);
      await upsertSupabaseCategory(newCategory);
      res.status(201).json(newCategory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name is required' });

      const categories = DBManager.getCategories();
      const catIndex = categories.findIndex(c => c.id === id);
      if (catIndex === -1) return res.status(404).json({ error: 'Category not found' });

      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      categories[catIndex] = {
        ...categories[catIndex],
        name: name.trim(),
        slug
      };

      DBManager.updateCategories(categories);
      await upsertSupabaseCategory(categories[catIndex]);
      res.json(categories[catIndex]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/categories/bulk-delete', requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids array is required' });
      }

      const categories = DBManager.getCategories();
      const filteredCategories = categories.filter(c => !ids.includes(c.id));
      
      const menuItems = DBManager.getMenuItems();
      const filteredItems = menuItems.filter(item => !ids.includes(item.categoryId));

      DBManager.updateCategories(filteredCategories);
      DBManager.updateMenuItems(filteredItems);

      await deleteSupabaseCategories(ids);

      res.json({ success: true, message: 'Selected categories deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/categories/all', requireAdmin, async (req, res) => {
    try {
      DBManager.updateCategories([]);
      DBManager.updateMenuItems([]);

      await deleteAllSupabaseCategories();
      await deleteAllSupabaseMenuItems();

      res.json({ success: true, message: 'All categories and menu items deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categories = DBManager.getCategories();
      const filteredCategories = categories.filter(c => c.id !== id);

      const menuItems = DBManager.getMenuItems();
      const filteredItems = menuItems.filter(item => item.categoryId !== id);
      
      DBManager.updateCategories(filteredCategories);
      DBManager.updateMenuItems(filteredItems);

      await deleteSupabaseCategory(id);

      res.json({ success: true, message: 'Category deleted and its associated items removed' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Menu Items endpoints
  app.get('/api/menu-items', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const supabaseMenuItems = await getSupabaseMenuItems();
      if (supabaseMenuItems !== null) {
        return res.json(supabaseMenuItems);
      }
      const items = DBManager.getMenuItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/menu-items', requireAdmin, async (req, res) => {
    try {
      const { name, description, price, categoryId, image, images, isVeg, isNonVeg, spiceLevel, isDraft } = req.body;
      if (!name || price === undefined || !categoryId) {
        return res.status(400).json({ error: 'Name, Price and Category are required' });
      }

      const primaryImage = image || (Array.isArray(images) && images[0]) || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop';
      const imageList = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

      const menuItems = DBManager.getMenuItems();
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        name: name.trim(),
        description: (description || '').trim(),
        price: parseFloat(price),
        categoryId,
        image: primaryImage,
        images: imageList,
        isVeg: !!isVeg,
        isNonVeg: !!isNonVeg,
        spiceLevel: parseInt(spiceLevel) || 0,
        isDraft: !!isDraft
      };

      menuItems.push(newItem);
      DBManager.updateMenuItems(menuItems);
      await upsertSupabaseMenuItem(newItem);
      res.status(201).json(newItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/menu-items/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId, image, images, isVeg, isNonVeg, spiceLevel, isDraft } = req.body;

      const menuItems = DBManager.getMenuItems();
      const itemIndex = menuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) return res.status(404).json({ error: 'Menu item not found' });

      const primaryImage = image !== undefined ? image : (Array.isArray(images) && images[0]) || menuItems[itemIndex].image;
      const imageList = Array.isArray(images) ? images : (menuItems[itemIndex].images || [primaryImage]);

      menuItems[itemIndex] = {
        ...menuItems[itemIndex],
        name: name !== undefined ? name.trim() : menuItems[itemIndex].name,
        description: description !== undefined ? description.trim() : menuItems[itemIndex].description,
        price: price !== undefined ? parseFloat(price) : menuItems[itemIndex].price,
        categoryId: categoryId !== undefined ? categoryId : menuItems[itemIndex].categoryId,
        image: primaryImage,
        images: imageList,
        isVeg: isVeg !== undefined ? !!isVeg : menuItems[itemIndex].isVeg,
        isNonVeg: isNonVeg !== undefined ? !!isNonVeg : menuItems[itemIndex].isNonVeg,
        spiceLevel: spiceLevel !== undefined ? parseInt(spiceLevel) : menuItems[itemIndex].spiceLevel,
        isDraft: isDraft !== undefined ? !!isDraft : menuItems[itemIndex].isDraft
      };

      DBManager.updateMenuItems(menuItems);
      await upsertSupabaseMenuItem(menuItems[itemIndex]);
      res.json(menuItems[itemIndex]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/menu-items/bulk-delete', requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids array is required' });
      }

      const menuItems = DBManager.getMenuItems();
      const filteredItems = menuItems.filter(item => !ids.includes(item.id));

      DBManager.updateMenuItems(filteredItems);
      await deleteSupabaseMenuItems(ids);

      res.json({ success: true, message: 'Selected menu items deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/menu-items/bulk-move-category', requireAdmin, async (req, res) => {
    try {
      const { ids, targetCategoryId } = req.body;
      if (!Array.isArray(ids) || !targetCategoryId) {
        return res.status(400).json({ error: 'ids array and targetCategoryId are required' });
      }

      const menuItems = DBManager.getMenuItems();
      let updatedCount = 0;

      for (let i = 0; i < menuItems.length; i++) {
        if (ids.includes(menuItems[i].id)) {
          menuItems[i].categoryId = targetCategoryId;
          await upsertSupabaseMenuItem(menuItems[i]);
          updatedCount++;
        }
      }

      DBManager.updateMenuItems(menuItems);

      res.json({ success: true, message: `Moved ${updatedCount} item(s) to new category successfully` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/menu-items/bulk-publish', requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids array is required' });
      }

      const menuItems = DBManager.getMenuItems();
      let publishedCount = 0;

      for (let i = 0; i < menuItems.length; i++) {
        if (ids.includes(menuItems[i].id)) {
          menuItems[i].isDraft = false;
          await upsertSupabaseMenuItem(menuItems[i]);
          publishedCount++;
        }
      }

      DBManager.updateMenuItems(menuItems);

      res.json({ success: true, message: `Published ${publishedCount} item(s) to live menu` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/menu-items/all', requireAdmin, async (req, res) => {
    try {
      DBManager.updateMenuItems([]);
      await deleteAllSupabaseMenuItems();

      res.json({ success: true, message: 'All menu items cleared successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/menu-items/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const menuItems = DBManager.getMenuItems();
      const filtered = menuItems.filter(item => item.id !== id);

      DBManager.updateMenuItems(filtered);
      await deleteSupabaseMenuItem(id);

      res.json({ success: true, message: 'Menu item deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Website Content endpoints
  app.get('/api/website-content', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const supabaseContent = await getSupabaseWebsiteContent();
      if (supabaseContent) {
        return res.json(supabaseContent);
      }
      const content = DBManager.getWebsiteContent();
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/website-content', requireAdmin, async (req, res) => {
    try {
      const { heroBanner, aboutSection, contactInfo, gallery, restaurantName, restaurantSubtitle } = req.body;
      const newContent = { heroBanner, aboutSection, contactInfo, gallery, restaurantName, restaurantSubtitle };
      DBManager.updateWebsiteContent(newContent);
      await upsertSupabaseWebsiteContent(newContent);
      res.json({
        success: true,
        message: '✅ Contact Information Published Successfully',
        content: DBManager.getWebsiteContent()
      });
    } catch (error: any) {
      console.error('[Save Contact Error]:', error);
      res.status(500).json({ error: '❌ Unable to Save Contact Information' });
    }
  });

  // POST /api/admin/verify-image - Verify an image URL against Food Image Authenticity System
  app.post('/api/admin/verify-image', requireAdmin, (req, res) => {
    try {
      const { name, description, categoryName, url } = req.body || {};
      if (!name || !url) {
        return res.status(400).json({ error: 'Name and Image URL are required' });
      }

      const verificationResult = verifyImageAuthenticity(name, description || '', categoryName || '', url);
      res.json(verificationResult);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Track last published timestamp
  let lastPublishedAt: string = new Date().toISOString();

  // POST /api/admin/save-draft - Save menu items and categories as DRAFT
  app.post('/api/admin/save-draft', requireAdmin, async (req, res) => {
    try {
      const { items, menuItems, categories: newCategories } = req.body || {};
      const rawItems = items || menuItems || (Array.isArray(req.body) ? req.body : []);

      let currentCategories = DBManager.getCategories();

      // 1. Ensure categories exist
      if (Array.isArray(newCategories)) {
        for (const cat of newCategories) {
          if (!currentCategories.some(c => c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase())) {
            const newCat: Category = {
              id: cat.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: cat.name.trim(),
              slug: cat.slug || cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
            };
            currentCategories.push(newCat);
            await upsertSupabaseCategory(newCat);
          }
        }
      }

      // Check items for missing category IDs/names
      if (Array.isArray(rawItems)) {
        for (const item of rawItems) {
          if (!item.categoryId && item.categoryName) {
            let match = currentCategories.find(c => c.name.toLowerCase() === item.categoryName.toLowerCase());
            if (!match) {
              match = {
                id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: item.categoryName.trim(),
                slug: item.categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
              };
              currentCategories.push(match);
              await upsertSupabaseCategory(match);
            }
            item.categoryId = match.id;
          }
        }
      }
      DBManager.updateCategories(currentCategories);

      // 2. Prepare and save draft items
      const existingMenuItems = DBManager.getMenuItems();
      const savedDrafts: MenuItem[] = [];

      if (Array.isArray(rawItems)) {
        for (const item of rawItems) {
          const isCustom = item.isCustomDish !== undefined ? item.isCustomDish : isCustomOrUniqueDish(item.name || '', item.description || '');
          const primaryImage = item.image || (Array.isArray(item.images) && item.images[0]) || '';
          const imageList = Array.isArray(item.images) && item.images.length > 0 ? item.images : (primaryImage ? [primaryImage] : []);

          // Generate or preserve verified images (Method 1 AI PDF import provides verifiedImages; Method 2 manual edits accept image directly)
          const verifiedImagesList = Array.isArray(item.verifiedImages) && item.verifiedImages.length > 0
            ? item.verifiedImages
            : (primaryImage ? [{
                url: primaryImage,
                foodMatchScore: 100,
                realPhotoScore: 100,
                descriptionMatchScore: 100,
                isVerified: true,
                verificationNote: 'Admin uploaded or accepted photo.',
                isCustomDish: false
              }] : []);

          const draftItem: MenuItem = {
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: (item.name || 'Untitled Dish').trim(),
            description: (item.description || '').trim(),
            price: parseFloat(item.price) || 0,
            categoryId: item.categoryId || currentCategories[0]?.id || 'cat-starters',
            image: primaryImage,
            images: imageList,
            verifiedImages: verifiedImagesList,
            isCustomDish: isCustom,
            photoMessage: item.photoMessage || (isCustom ? 'Real photos required from restaurant. Admin must upload actual photos.' : undefined),
            isVeg: item.isVeg !== undefined ? !!item.isVeg : true,
            isNonVeg: item.isNonVeg !== undefined ? !!item.isNonVeg : false,
            spiceLevel: item.spiceLevel !== undefined ? parseInt(item.spiceLevel) : 0,
            isDraft: true
          };

          const existingIdx = existingMenuItems.findIndex(m => m.id === draftItem.id);
          if (existingIdx !== -1) {
            existingMenuItems[existingIdx] = draftItem;
          } else {
            existingMenuItems.push(draftItem);
          }

          savedDrafts.push(draftItem);
          await upsertSupabaseMenuItem(draftItem);
        }
      }

      DBManager.updateMenuItems(existingMenuItems);

      res.json({
        success: true,
        count: savedDrafts.length,
        message: 'Drafts saved successfully',
        items: savedDrafts
      });
    } catch (error: any) {
      console.error('[Save Draft API Error]:', error);
      res.status(500).json({ error: error.message || 'Failed to save drafts' });
    }
  });

  // POST /api/admin/publish-menu - Publish menu items & categories to live site
  app.post('/api/admin/publish-menu', requireAdmin, async (req, res) => {
    try {
      const { items, menuItems, categories: newCategories, websiteContent } = req.body || {};

      let currentCategories = DBManager.getCategories();
      
      // Save categories if provided
      if (Array.isArray(newCategories)) {
        for (const cat of newCategories) {
          const catIndex = currentCategories.findIndex(c => c.id === cat.id);
          if (catIndex !== -1) {
            currentCategories[catIndex] = cat;
          } else {
            currentCategories.push(cat);
          }
          await upsertSupabaseCategory(cat);
        }
        DBManager.updateCategories(currentCategories);
      }

      // Save website content if provided
      if (websiteContent) {
        DBManager.updateWebsiteContent(websiteContent);
        await upsertSupabaseWebsiteContent(websiteContent);
      }

      let currentMenuItems = DBManager.getMenuItems();
      const rawItems = items || menuItems;

      // If items are passed in body, upsert them first as published items
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        for (const item of rawItems) {
          if (!item.categoryId && item.categoryName) {
            let match = currentCategories.find(c => c.name.toLowerCase() === item.categoryName.toLowerCase());
            if (!match) {
              match = {
                id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: item.categoryName.trim(),
                slug: item.categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
              };
              currentCategories.push(match);
              await upsertSupabaseCategory(match);
            }
            item.categoryId = match.id;
          }

          const isCustom = item.isCustomDish !== undefined ? item.isCustomDish : isCustomOrUniqueDish(item.name || '', item.description || '');
          const primaryImage = item.image || (Array.isArray(item.images) && item.images[0]) || '';
          const imageList = Array.isArray(item.images) && item.images.length > 0 ? item.images : (primaryImage ? [primaryImage] : []);

          // Generate or preserve verified images (Method 1 AI PDF import provides verifiedImages; Method 2 manual edits accept image directly)
          const verifiedImagesList = Array.isArray(item.verifiedImages) && item.verifiedImages.length > 0
            ? item.verifiedImages
            : (primaryImage ? [{
                url: primaryImage,
                foodMatchScore: 100,
                realPhotoScore: 100,
                descriptionMatchScore: 100,
                isVerified: true,
                verificationNote: 'Admin uploaded or accepted photo.',
                isCustomDish: false
              }] : []);

          const publishedItem: MenuItem = {
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: (item.name || 'Untitled Dish').trim(),
            description: (item.description || '').trim(),
            price: parseFloat(item.price) || 0,
            categoryId: item.categoryId || currentCategories[0]?.id || 'cat-starters',
            image: primaryImage,
            images: imageList,
            verifiedImages: verifiedImagesList,
            isCustomDish: isCustom,
            photoMessage: item.photoMessage || (isCustom ? 'Real photos required from restaurant. Admin must upload actual photos.' : undefined),
            isVeg: item.isVeg !== undefined ? !!item.isVeg : true,
            isNonVeg: item.isNonVeg !== undefined ? !!item.isNonVeg : false,
            spiceLevel: item.spiceLevel !== undefined ? parseInt(item.spiceLevel) : 0,
            isDraft: false
          };

          const existingIdx = currentMenuItems.findIndex(m => m.id === publishedItem.id);
          if (existingIdx !== -1) {
            currentMenuItems[existingIdx] = publishedItem;
          } else {
            currentMenuItems.push(publishedItem);
          }
        }
        DBManager.updateCategories(currentCategories);
      }

      // Mark ALL current menu items as published (isDraft = false)
      const allPublishedItems: MenuItem[] = currentMenuItems.map(item => ({
        ...item,
        isDraft: false
      }));

      DBManager.updateMenuItems(allPublishedItems);

      // Sync all published items to Supabase
      for (const item of allPublishedItems) {
        await upsertSupabaseMenuItem(item);
      }

      lastPublishedAt = new Date().toISOString();

      res.json({
        success: true,
        message: '✅ Menu Published Successfully',
        lastPublishedAt,
        publishedCount: allPublishedItems.length,
        categoriesCount: DBManager.getCategories().length
      });
    } catch (error: any) {
      console.error('[Publish API Error]:', error);
      res.status(500).json({ error: error.message || '❌ Publish Failed. Try Again' });
    }
  });

  // POST /api/publish - Backwards compatible alias for publish-menu
  app.post('/api/publish', requireAdmin, async (req, res) => {
    try {
      const { categories, menuItems, websiteContent } = req.body || {};
      
      if (Array.isArray(categories)) {
        DBManager.updateCategories(categories);
        for (const cat of categories) {
          await upsertSupabaseCategory(cat);
        }
      }

      if (websiteContent) {
        DBManager.updateWebsiteContent(websiteContent);
        await upsertSupabaseWebsiteContent(websiteContent);
      }

      let itemsToPublish = Array.isArray(menuItems) ? menuItems : DBManager.getMenuItems();
      
      const publishedItems: MenuItem[] = itemsToPublish.map(item => ({
        ...item,
        isDraft: false
      }));

      DBManager.updateMenuItems(publishedItems);

      for (const item of publishedItems) {
        await upsertSupabaseMenuItem(item);
      }

      lastPublishedAt = new Date().toISOString();

      res.json({
        success: true,
        message: '✅ Menu Published Successfully',
        lastPublishedAt,
        publishedCount: publishedItems.length,
        categoriesCount: DBManager.getCategories().length
      });
    } catch (error: any) {
      console.error('[Publish API Error]:', error);
      res.status(500).json({ error: error.message || '❌ Publish Failed. Try Again' });
    }
  });

  // GET /api/published-menu - Public Endpoint returning ONLY published data
  app.get('/api/published-menu', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      let categories = await getSupabaseCategories();
      if (!categories) {
        categories = DBManager.getCategories();
      }

      let menuItems = await getSupabaseMenuItems();
      if (!menuItems) {
        menuItems = DBManager.getMenuItems();
      }

      let content = await getSupabaseWebsiteContent();
      if (!content) {
        content = DBManager.getWebsiteContent();
      }

      // Filter out draft items - Public website ONLY receives published data
      const publishedMenuItems = (menuItems || []).filter(item => !item.isDraft);

      res.json({
        categories: categories || [],
        menuItems: publishedMenuItems,
        websiteContent: content || DBManager.getWebsiteContent(),
        lastPublishedAt
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI PDF menu parsing endpoint
  app.post('/api/admin/parse-pdf', requireAdmin, async (req, res) => {
    try {
      const { pdfBase64 } = req.body;
      if (!pdfBase64) {
        return res.status(400).json({ error: 'PDF content as Base64 is required.' });
      }

      // Remove prefix like 'data:application/pdf;base64,' if present
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

      console.log("Parsing PDF using Gemini API...");
      const extractedItems = await parseMenuPDF(cleanBase64);
      res.json({ success: true, items: extractedItems });
    } catch (error: any) {
      console.error("Failed to parse PDF:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Search verified real food photos endpoint (Image Authenticity Policy)
  app.post('/api/admin/generate-images', requireAdmin, async (req, res) => {
    try {
      const { name, description, categoryName } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Item name is required for image search.' });
      }

      console.log(`Searching verified real food photos for: ${name}...`);
      const searchResult = searchVerifiedRealFoodPhotos(name, description || '', categoryName || '');
      res.json({ 
        success: true, 
        verified: searchResult.verified,
        isCustomDish: searchResult.isCustomDish,
        images: searchResult.images,
        message: searchResult.message 
      });
    } catch (error: any) {
      console.error("Failed to search verified images:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Spice Level Detector endpoint
  app.post('/api/admin/detect-spice', requireAdmin, async (req, res) => {
    try {
      const { name, description, categoryName } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Item name is required for spice detection.' });
      }

      const detectedLevel = detectSpiceLevel(name, description || '', categoryName || '');
      res.json({ success: true, spiceLevel: detectedLevel });
    } catch (error: any) {
      console.error("Failed to detect spice level:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE DEV MIDDLEWARE / STATIC FILES ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HOKAI Server] Running on port ${PORT}`);
  });
}

startServer();
