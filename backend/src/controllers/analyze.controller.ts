import { Request, Response } from 'express';
import axios from 'axios';
import Analysis from '../models/Analysis';

export const analyzeImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // For now, return mock data (replace with actual ML API call)
    const mockAnalysis = {
      plantPart: 'leaves',
      confidence: 0.95,
      maturityLevel: 'harvest-ready',
      maturityProgress: 85,
      healthStatus: 'healthy',
      diseases: [],
      nutritionalValue: {
        vitaminA: '6,780 μg',
        vitaminC: '51.7 mg',
        iron: '4.0 mg',
        protein: '9.4 g'
      },
      viableProducts: [
        {
          name: 'Fresh Leaves',
          unit: 'Per bundle',
          priceRange: '₱50-65',
          trend: '↑ 8% this week',
          badge: '🔥 High Demand - Quick Sale Expected'
        },
        {
          name: 'Dried Powder',
          unit: 'Per 100g pack',
          priceRange: '₱120-150',
          trend: 'Stable',
          badge: '💎 Premium Value - Longer Shelf Life'
        }
      ]
    };

    // Save analysis to database
    const analysis = new Analysis({
      imageUrl: `/uploads/${req.file.filename}`,
      userId: req.body.userId,
      ...mockAnalysis
    });

    await analysis.save();

    res.json({
      id: analysis._id,
      ...mockAnalysis,
      imageUrl: analysis.imageUrl
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

export const getAnalysisById = async (req: Request, res: Response) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
};

export const getUserAnalyses = async (req: Request, res: Response) => {
  try {
    const analyses = await Analysis.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
};