const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all providers who offer Kundli services
router.get('/kundli', async (req, res) => {
  try {
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .eq('kundli', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching Kundli providers:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch providers',
        details: error.message 
      });
    }

    res.json({ 
      success: true, 
      providers: providers || [],
      count: providers ? providers.length : 0
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get all providers with their services
router.get('/', async (req, res) => {
  try {
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching providers:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch providers',
        details: error.message 
      });
    }

    res.json({ 
      success: true, 
      providers: providers || [],
      count: providers ? providers.length : 0
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get provider by ID
router.get('/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
      .eq('providerId', providerId)
      .single();

    if (error) {
      console.error('Error fetching provider:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch provider',
        details: error.message 
      });
    }

    if (!provider) {
      return res.status(404).json({ 
        error: 'Provider not found' 
      });
    }

    res.json({ 
      success: true, 
      provider 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;
