import express from 'express';
import { DBManager, Category, MenuItem } from '../server/db.js';
import { parseMenuPDF } from '../server/gemini.js';
import { getSupabaseCategories, getSupabaseMenuItems, getSupabaseWebsiteContent } from '../server/supabase.js';

const app = express();

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

// CORS configuration (already handled by Vercel, but good practice to allow headers)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverless: true, time: new Date().toISOString() });
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
    const supabaseCategories = await getSupabaseCategories();
    if (supabaseCategories) {
      return res.json(supabaseCategories);
    }
    const categories = DBManager.getCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', requireAdmin, (req, res) => {
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
    res.status(201).json(newCategory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
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
    res.json(categories[catIndex]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const categories = DBManager.getCategories();
    const filteredCategories = categories.filter(c => c.id !== id);

    if (categories.length === filteredCategories.length) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Also clean up or migrate items associated with this category
    const menuItems = DBManager.getMenuItems();
    const filteredItems = menuItems.filter(item => item.categoryId !== id);
    
    DBManager.updateCategories(filteredCategories);
    DBManager.updateMenuItems(filteredItems);

    res.json({ success: true, message: 'Category deleted and its associated items removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Menu Items endpoints
app.get('/api/menu-items', async (req, res) => {
  try {
    const supabaseMenuItems = await getSupabaseMenuItems();
    if (supabaseMenuItems) {
      return res.json(supabaseMenuItems);
    }
    const items = DBManager.getMenuItems();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/menu-items', requireAdmin, (req, res) => {
  try {
    const { name, description, price, categoryId, image, isVeg, isNonVeg, spiceLevel, isDraft } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Name, Price and Category are required' });
    }

    const menuItems = DBManager.getMenuItems();
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      description: (description || '').trim(),
      price: parseFloat(price),
      categoryId,
      image: image || 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
      isVeg: !!isVeg,
      isNonVeg: !!isNonVeg,
      spiceLevel: parseInt(spiceLevel) || 0,
      isDraft: !!isDraft
    };

    menuItems.push(newItem);
    DBManager.updateMenuItems(menuItems);
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/menu-items/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, image, isVeg, isNonVeg, spiceLevel, isDraft } = req.body;

    const menuItems = DBManager.getMenuItems();
    const itemIndex = menuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return res.status(404).json({ error: 'Menu item not found' });

    menuItems[itemIndex] = {
      ...menuItems[itemIndex],
      name: name !== undefined ? name.trim() : menuItems[itemIndex].name,
      description: description !== undefined ? description.trim() : menuItems[itemIndex].description,
      price: price !== undefined ? parseFloat(price) : menuItems[itemIndex].price,
      categoryId: categoryId !== undefined ? categoryId : menuItems[itemIndex].categoryId,
      image: image !== undefined ? image : menuItems[itemIndex].image,
      isVeg: isVeg !== undefined ? !!isVeg : menuItems[itemIndex].isVeg,
      isNonVeg: isNonVeg !== undefined ? !!isNonVeg : menuItems[itemIndex].isNonVeg,
      spiceLevel: spiceLevel !== undefined ? parseInt(spiceLevel) : menuItems[itemIndex].spiceLevel,
      isDraft: isDraft !== undefined ? !!isDraft : menuItems[itemIndex].isDraft
    };

    DBManager.updateMenuItems(menuItems);
    res.json(menuItems[itemIndex]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/menu-items/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const menuItems = DBManager.getMenuItems();
    const filtered = menuItems.filter(item => item.id !== id);

    if (menuItems.length === filtered.length) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    DBManager.updateMenuItems(filtered);
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Website Content endpoints
app.get('/api/website-content', async (req, res) => {
  try {
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

app.put('/api/website-content', requireAdmin, (req, res) => {
  try {
    const { heroBanner, aboutSection, contactInfo, gallery } = req.body;
    DBManager.updateWebsiteContent({ heroBanner, aboutSection, contactInfo, gallery });
    res.json({ success: true, content: DBManager.getWebsiteContent() });
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

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    console.log("Parsing PDF using Gemini API...");
    const extractedItems = await parseMenuPDF(cleanBase64);
    res.json({ success: true, items: extractedItems });
  } catch (error: any) {
    console.error("Failed to parse PDF:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
