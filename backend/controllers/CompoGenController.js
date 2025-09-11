
// const FrontendPage = require('../models/FrontendPage');

// // Create new component
// exports.createCompo = async (req, res) => {
//   try {
//     const { pageName, code, projectId } = req.body;

//     if (!pageName || !code || !projectId) {
//       return res.status(400).json({ error: 'pageName, code, and projectId are required' });
//     }

//     const newPage = new FrontendPage({
//       pageName,
//       code,
//       project: projectId
//     });

//     await newPage.save();

//     res.status(201).json(newPage);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create component' });
//   }
// };

const FrontendPage = require('../models/FrontendPage');

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.createCompo = async (req, res) => {
  const defaultComponentCode = (pageName) => `import React from "react";
import "./styles.css";

export default function App() {
  return (
    <div className="">
      
    </div>
  );
}`;

  // const generateComponentWithAI = async (pageName, description) => {
  //   try {
  //     const prompt = `Generate a React functional component based on the following requirements:

  //     Component Name: ${pageName}
  //     Description: ${description}

  //     PLEASE FOLLOW THIS ENHANCED STRUCTURE AND GUIDELINES:

  //     1. REQUIRED STRUCTURE:
  //     - Import React and necessary hooks: import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
  //     - Import "./styles.css"
  //     - Export default function App()
  //     - Use modern functional component syntax with proper TypeScript-like prop handling

  //     2. ADVANCED STYLING REQUIREMENTS:
  //     - Use Tailwind CSS classes exclusively with modern design patterns
  //     - Implement a captivating gradient background: <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
  //     - Add animated background elements: floating particles, geometric shapes, or subtle animations
  //     - Main container with glassmorphism effect: <div className="relative z-10 max-w-4xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 m-8">
  //     - Dynamic title with gradient text: <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-8 text-center tracking-tight">${pageName}</h1>

  //     3. UI/UX ENHANCEMENT REQUIREMENTS:
  //     - Implement smooth hover animations using transition classes
  //     - Add interactive elements with transform effects (hover:scale-105, hover:-translate-y-1)
  //     - Use modern card designs with backdrop-blur effects
  //     - Include subtle shadow variations (shadow-lg, shadow-xl, shadow-2xl)
  //     - Add loading states and micro-interactions
  //     - Implement responsive design with mobile-first approach
  //     - Use modern color palettes with proper contrast ratios
  //     - Include icon placeholders using geometric shapes or Unicode symbols

  //     4. COMPONENT ARCHITECTURE:
  //     - Make it highly functional and interactive based on the description
  //     - Use appropriate React hooks (useState, useEffect, useCallback, useMemo)
  //     - Implement proper state management patterns
  //     - Add form validation if forms are present
  //     - Include error handling and loading states
  //     - Create reusable sub-components within the main component
  //     - Add keyboard navigation support where applicable

  //     5. ADVANCED FEATURES:
  //     - Implement smooth transitions between states
  //     - Add progressive enhancement features
  //     - Include accessibility attributes (aria-labels, roles)
  //     - Use modern layout techniques (CSS Grid, Flexbox)
  //     - Add touch-friendly interactions for mobile
  //     - Implement proper focus management
  //     - Include subtle sound feedback indicators (visual cues)

  //     6. MODERN DESIGN PATTERNS:
  //     - Use neumorphism or glassmorphism effects where appropriate
  //     - Implement dark mode considerations
  //     - Add floating action buttons or speed dials if relevant
  //     - Use modern typography scales and spacing
  //     - Include subtle parallax or depth effects
  //     - Add modern loading spinners and skeleton screens
  //     - Implement modern form styling with floating labels

  //     7. INTERACTION PATTERNS:
  //     - Add smooth page transitions and animations
  //     - Implement drag and drop if relevant to functionality
  //     - Include swipe gestures for mobile (visual indicators)
  //     - Add confirmation dialogs with modern styling
  //     - Implement progressive disclosure patterns
  //     - Use modern pagination or infinite scroll patterns

  //     8. CODE QUALITY REQUIREMENTS:
  //     - Write clean, maintainable, and performant code
  //     - Use meaningful variable and function names
  //     - Implement proper error boundaries where needed
  //     - Add performance optimizations (memo, callback optimizations)
  //     - Follow React best practices and patterns
  //     - Include proper cleanup in useEffect hooks

  //     9. VISUAL HIERARCHY:
  //     - Create clear visual hierarchy with proper spacing
  //     - Use consistent sizing patterns (text-sm, text-base, text-lg, etc.)
  //     - Implement proper contrast ratios for accessibility
  //     - Add visual separators and grouping elements
  //     - Use modern grid systems for layout
  //     - Include proper whitespace and breathing room

  //     10. CODE FORMAT:
  //     - Return ONLY the complete React component code
  //     - No explanations, comments, or markdown formatting
  //     - No code blocks or backticks
  //     - Just the raw JavaScript/JSX code
  //     - Ensure all imports are at the top
  //     - Make sure all hooks and functions are properly defined

  //     CREATIVE REQUIREMENTS:
  //     - Push the boundaries of modern web design
  //     - Create a "wow factor" that would make users stop and admire
  //     - Think like a senior UI/UX designer from a top tech company
  //     - Implement cutting-edge design trends
  //     - Make it feel premium and polished
  //     - Add unexpected but delightful interactions
  //     - Consider the emotional impact of the design
  //     - Make it Instagram-worthy and shareable

  //     Generate a complete, production-ready React component that not only implements the described functionality but also serves as a showcase of modern web design excellence. The component should feel like it belongs in a award-winning design portfolio.`;

  //       const response = await openai.chat.completions.create({
  //         model: "gpt-4o", // Use latest model available
  //         messages: [
  //           {
  //             role: "system",
  //             content: `You are a world-class React developer and UI/UX designer with expertise in modern web design trends. You have experience from companies like Apple, Google, and leading design agencies. Your specialty is creating visually stunning, highly interactive components that push the boundaries of what's possible with React and Tailwind CSS.

  //     CORE PRINCIPLES:
  //     - Every component should have a "wow factor" that makes people stop scrolling
  //     - Modern design isn't just pretty - it's functional, accessible, and performant
  //     - Use cutting-edge CSS techniques and the latest Tailwind utilities
  //     - Think mobile-first but make it desktop-stunning
  //     - Micro-interactions and animations are crucial for premium feel
  //     - Always consider the user's emotional journey through the interface

  //     DESIGN PHILOSOPHY:
  //     - Embrace bold color choices and modern gradients
  //     - Use glassmorphism, neumorphism, and other contemporary effects
  //     - Implement smooth, buttery animations that feel natural
  //     - Create depth and layering for visual interest
  //     - Balance negative space with rich content areas
  //     - Make every interaction feel responsive and alive

  //     Return ONLY the raw React component code - no explanations, no markdown, no code blocks. The code should be immediately usable and represent the pinnacle of modern component design.`
  //           },
  //           {
  //             role: "user",
  //             content: prompt
  //           }
  //         ],
  //         max_tokens: 16384,
  //         temperature: 0.4, // Slightly higher for more creativity
  //       });

  //     return response.choices[0].message.content.trim();
  //   } catch (error) {
  //     console.error('OpenAI API Error:', error);
  //     throw error;
  //   }
  // };
// const generateComponentWithAI = async (pageName, description) => {
//   try {
//     // Intelligent context analysis
//     const analyzeUserContext = (name, desc) => {
//       const combined = `${name} ${desc}`.toLowerCase();
      
//       // Detect page type intelligently
//       const pageType = (() => {
//         if (combined.match(/\b(landing|homepage|main\s*page|home)\b/)) return 'landing';
//         if (combined.match(/\b(auth|login|signin|signup|register|sign\s*up|sign\s*in)\b/)) return 'auth';
//         if (combined.match(/\b(dashboard|admin|panel|control|management)\b/)) return 'dashboard';
//         if (combined.match(/\b(profile|account|user|settings)\b/)) return 'profile';
//         if (combined.match(/\b(pricing|plan|subscription|billing)\b/)) return 'pricing';
//         if (combined.match(/\b(contact|support|help|reach\s*us)\b/)) return 'contact';
//         if (combined.match(/\b(about|team|company|story|mission)\b/)) return 'about';
//         if (combined.match(/\b(blog|article|news|post|content)\b/)) return 'blog';
//         if (combined.match(/\b(product|service|feature|catalog)\b/)) return 'product';
//         if (combined.match(/\b(checkout|payment|cart|order)\b/)) return 'checkout';
//         if (combined.match(/\b(portfolio|gallery|showcase|work)\b/)) return 'portfolio';
//         if (combined.match(/\b(ecommerce|shop|store|marketplace)\b/)) return 'ecommerce';
//         return 'custom';
//       })();

//       // Detect design style preferences
//       const stylePreferences = {
//         complexity: (() => {
//           if (combined.match(/\b(fancy|luxurious|premium|elegant|sophisticated|modern|cutting[-\s]*edge)\b/)) return 'fancy';
//           if (combined.match(/\b(classic|traditional|simple|clean|minimal|basic)\b/)) return 'classic';
//           if (combined.match(/\b(corporate|professional|business|formal)\b/)) return 'corporate';
//           if (combined.match(/\b(creative|artistic|innovative|unique|bold)\b/)) return 'creative';
//           return 'modern';
//         })(),
        
//         theme: (() => {
//           if (combined.match(/\b(dark|night|black|midnight|shadow)\b/)) return 'dark';
//           if (combined.match(/\b(light|bright|white|airy|clean)\b/)) return 'light';
//           if (combined.match(/\b(colorful|vibrant|rainbow|bright|vivid)\b/)) return 'colorful';
//           if (combined.match(/\b(monochrome|grayscale|minimal|neutral)\b/)) return 'monochrome';
//           return 'balanced';
//         })(),
        
//         mood: (() => {
//           if (combined.match(/\b(playful|fun|cheerful|energetic|lively)\b/)) return 'playful';
//           if (combined.match(/\b(serious|formal|professional|corporate)\b/)) return 'serious';
//           if (combined.match(/\b(calm|peaceful|serene|relaxed)\b/)) return 'calm';
//           if (combined.match(/\b(exciting|dynamic|bold|aggressive)\b/)) return 'exciting';
//           return 'balanced';
//         })(),
        
//         audience: (() => {
//           if (combined.match(/\b(kids|children|young|teen|student)\b/)) return 'young';
//           if (combined.match(/\b(enterprise|business|corporate|professional|b2b)\b/)) return 'enterprise';
//           if (combined.match(/\b(creative|artist|designer|agency)\b/)) return 'creative';
//           if (combined.match(/\b(tech|developer|startup|saas)\b/)) return 'tech';
//           return 'general';
//         })()
//       };

//       // Detect specific color preferences
//       const colorPreferences = (() => {
//         const colors = combined.match(/\b(red|blue|green|yellow|purple|pink|orange|cyan|teal|indigo|violet|rose|amber|lime|emerald|sky|fuchsia|slate|gray|zinc|neutral|stone)\b/g);
//         if (colors && colors.length > 0) return colors;
//         return null;
//       })();

//       // Detect industry/niche
//       const industry = (() => {
//         if (combined.match(/\b(fintech|finance|bank|investment|trading)\b/)) return 'finance';
//         if (combined.match(/\b(healthcare|medical|doctor|hospital|clinic)\b/)) return 'healthcare';
//         if (combined.match(/\b(education|learning|course|university|school)\b/)) return 'education';
//         if (combined.match(/\b(travel|tourism|hotel|booking)\b/)) return 'travel';
//         if (combined.match(/\b(food|restaurant|recipe|cooking)\b/)) return 'food';
//         if (combined.match(/\b(fitness|gym|workout|health|sport)\b/)) return 'fitness';
//         if (combined.match(/\b(real[-\s]*estate|property|housing)\b/)) return 'realestate';
//         if (combined.match(/\b(fashion|clothing|style|apparel)\b/)) return 'fashion';
//         if (combined.match(/\b(gaming|game|entertainment)\b/)) return 'gaming';
//         return 'general';
//       })();

//       return {
//         pageType,
//         stylePreferences,
//         colorPreferences,
//         industry,
//         hasSpecificRequirements: combined.length > 50 // Detailed requirements vs simple request
//       };
//     };

//     const context = analyzeUserContext(pageName, description);

//     // Generate intelligent, context-aware prompt
//     const generateDynamicPrompt = (context) => {
//       const { pageType, stylePreferences, colorPreferences, industry, hasSpecificRequirements } = context;
      
//       const basePrompt = `You are an expert UI/UX designer and React developer. Create a comprehensive React component based on the user's needs. Think intelligently about what this component should include based on its purpose and context.

// COMPONENT REQUEST:
// Page Name: ${pageName}
// Description: ${description}
// Detected Type: ${pageType}
// Style Preference: ${stylePreferences.complexity}
// Theme: ${stylePreferences.theme}
// Mood: ${stylePreferences.mood}
// Target Audience: ${stylePreferences.audience}
// Industry Context: ${industry}

// INTELLIGENT DESIGN THINKING:
// You must think like a professional designer and automatically determine:

// 1. STRUCTURE & SECTIONS:
//    - For ${pageType} pages, what sections would users expect to see?
//    - What is the standard industry pattern for this type of page?
//    - How should information be organized for optimal user experience?
//    - What interactive elements would enhance usability?

// 2. COLOR SYSTEM:
//    ${colorPreferences ? `- User mentioned these colors: ${colorPreferences.join(', ')} - incorporate them thoughtfully` : ''}
//    - Based on ${stylePreferences.theme} theme preference, choose appropriate color palette
//    - Consider ${industry} industry standards and conventions
//    - Match colors to ${stylePreferences.mood} mood and ${stylePreferences.audience} audience
//    - Use color psychology to support the page's primary goal

// 3. STYLE ADAPTATION:
//    ${stylePreferences.complexity === 'fancy' ? '- Create luxurious, gradient-heavy design with premium aesthetics, glassmorphism, and sophisticated animations' : ''}
//    ${stylePreferences.complexity === 'classic' ? '- Use clean, timeless design with solid colors, clear typography, and subtle effects' : ''}
//    ${stylePreferences.complexity === 'corporate' ? '- Professional, trustworthy design with conservative colors and structured layouts' : ''}
//    ${stylePreferences.complexity === 'creative' ? '- Bold, unique design with experimental layouts and vibrant color combinations' : ''}
//    ${stylePreferences.complexity === 'modern' ? '- Contemporary design with current trends, balanced complexity, and intuitive UX' : ''}

// 4. FUNCTIONALITY INTELLIGENCE:
//    - What features would users need on a ${pageType} page?
//    - What interactions and state management are essential?
//    - How should data flow and user actions be handled?
//    - What validation, error handling, and feedback is needed?

// DESIGN PHILOSOPHY:
// - Think beyond templates - create contextually appropriate designs
// - Every element should serve the page's primary purpose
// - Balance visual appeal with functionality
// - Consider user journey and conversion goals
// - Make it feel custom-designed, not generic

// TECHNICAL REQUIREMENTS:
// - Use React hooks appropriately (useState, useEffect, useRef, etc.)
// - Implement proper state management for all interactive elements
// - Include comprehensive error handling and loading states
// - Make it fully responsive and accessible
// - Add smooth animations and micro-interactions
// - Use modern CSS techniques (Grid, Flexbox, custom properties)

// VISUAL REQUIREMENTS:
// - Create a cohesive design system within the component
// - Use appropriate spacing, typography hierarchy, and visual rhythm
// - Implement consistent hover states and interactive feedback
// - Add subtle animations that enhance UX without being distracting
// - Ensure proper contrast and readability

// OUTPUT FORMAT:
// - Return ONLY the complete raw React component code that can directly used
// - No explanations, markdown, or comments
// - Component should be immediately functional and production-ready
// - Use modern React patterns and best practices
// - Import React and any hooks at the top

// Think intelligently about what this ${pageType} component should look like and how it should behave based on the context provided. Create something that feels purposeful, well-designed, and perfectly suited to its intended use.`;

//       return basePrompt;
//     };

//     const prompt = generateDynamicPrompt(context);

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o", // Using GPT-4 for better design intelligence
//       messages: [
//         {
//           role: "system",
//           content: `You are an elite UI/UX designer and React architect with deep understanding of:

// DESIGN INTELLIGENCE:
// - Automatically determining appropriate page structures based on purpose
// - Selecting color palettes that match context, industry, and user preferences
// - Adapting complexity and style to match user requirements
// - Creating designs that feel custom and purposeful, not template-based

// CONTEXTUAL AWARENESS:
// - Understanding what users expect from different page types
// - Knowing industry standards and best practices
// - Balancing aesthetic appeal with functionality
// - Creating appropriate user experiences for different audiences

// TECHNICAL MASTERY:
// - Writing clean, performant React code
// - Implementing complex interactions and state management
// - Creating responsive, accessible components
// - Using modern development practices

// Your goal: Generate intelligent, context-aware components that feel like they were custom-designed by a professional team specifically for the user's needs. Think holistically about design, functionality, and user experience.

// Return only the React component code - clean, functional, and ready to use.`
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       max_tokens: 16384,
//       temperature: 0.8, // Higher creativity for design decisions
//     });

//     return response.choices[0].message.content.trim();
//   } catch (error) {
//     console.error('OpenAI API Error:', error);
//     throw error;
//   }
// };
const generateComponentWithAI = async (pageName, description) => {
  try {
    // Intelligent context analysis
    const analyzeUserContext = (name, desc) => {
      const combined = `${name} ${desc}`.toLowerCase();
      
      // Detect page type intelligently
      const pageType = (() => {
        if (combined.match(/\b(landing|homepage|main\s*page|home)\b/)) return 'landing';
        if (combined.match(/\b(auth|login|signin|signup|register|sign\s*up|sign\s*in)\b/)) return 'auth';
        if (combined.match(/\b(dashboard|admin|panel|control|management)\b/)) return 'dashboard';
        if (combined.match(/\b(profile|account|user|settings)\b/)) return 'profile';
        if (combined.match(/\b(pricing|plan|subscription|billing)\b/)) return 'pricing';
        if (combined.match(/\b(contact|support|help|reach\s*us)\b/)) return 'contact';
        if (combined.match(/\b(about|team|company|story|mission)\b/)) return 'about';
        if (combined.match(/\b(blog|article|news|post|content)\b/)) return 'blog';
        if (combined.match(/\b(product|service|feature|catalog)\b/)) return 'product';
        if (combined.match(/\b(checkout|payment|cart|order)\b/)) return 'checkout';
        if (combined.match(/\b(portfolio|gallery|showcase|work)\b/)) return 'portfolio';
        if (combined.match(/\b(ecommerce|shop|store|marketplace)\b/)) return 'ecommerce';
        return 'custom';
      })();

      // Detect design style preferences
      const stylePreferences = {
        complexity: (() => {
          if (combined.match(/\b(fancy|luxurious|premium|elegant|sophisticated|modern|cutting[-\s]*edge)\b/)) return 'fancy';
          if (combined.match(/\b(classic|traditional|simple|clean|minimal|basic)\b/)) return 'classic';
          if (combined.match(/\b(corporate|professional|business|formal)\b/)) return 'corporate';
          if (combined.match(/\b(creative|artistic|innovative|unique|bold)\b/)) return 'creative';
          return 'modern';
        })(),
        
        theme: (() => {
          if (combined.match(/\b(dark|night|black|midnight|shadow)\b/)) return 'dark';
          if (combined.match(/\b(light|bright|white|airy|clean)\b/)) return 'light';
          if (combined.match(/\b(colorful|vibrant|rainbow|bright|vivid)\b/)) return 'colorful';
          if (combined.match(/\b(monochrome|grayscale|minimal|neutral)\b/)) return 'monochrome';
          return 'balanced';
        })(),
        
        mood: (() => {
          if (combined.match(/\b(playful|fun|cheerful|energetic|lively)\b/)) return 'playful';
          if (combined.match(/\b(serious|formal|professional|corporate)\b/)) return 'serious';
          if (combined.match(/\b(calm|peaceful|serene|relaxed)\b/)) return 'calm';
          if (combined.match(/\b(exciting|dynamic|bold|aggressive)\b/)) return 'exciting';
          return 'balanced';
        })(),
        
        audience: (() => {
          if (combined.match(/\b(kids|children|young|teen|student)\b/)) return 'young';
          if (combined.match(/\b(enterprise|business|corporate|professional|b2b)\b/)) return 'enterprise';
          if (combined.match(/\b(creative|artist|designer|agency)\b/)) return 'creative';
          if (combined.match(/\b(tech|developer|startup|saas)\b/)) return 'tech';
          return 'general';
        })()
      };

      // Detect specific color preferences
      const colorPreferences = (() => {
        const colors = combined.match(/\b(red|blue|green|yellow|purple|pink|orange|cyan|teal|indigo|violet|rose|amber|lime|emerald|sky|fuchsia|slate|gray|zinc|neutral|stone)\b/g);
        if (colors && colors.length > 0) return colors;
        return null;
      })();

      // Detect industry/niche
      const industry = (() => {
        if (combined.match(/\b(fintech|finance|bank|investment|trading)\b/)) return 'finance';
        if (combined.match(/\b(healthcare|medical|doctor|hospital|clinic)\b/)) return 'healthcare';
        if (combined.match(/\b(education|learning|course|university|school)\b/)) return 'education';
        if (combined.match(/\b(travel|tourism|hotel|booking)\b/)) return 'travel';
        if (combined.match(/\b(food|restaurant|recipe|cooking)\b/)) return 'food';
        if (combined.match(/\b(fitness|gym|workout|health|sport)\b/)) return 'fitness';
        if (combined.match(/\b(real[-\s]*estate|property|housing)\b/)) return 'realestate';
        if (combined.match(/\b(fashion|clothing|style|apparel)\b/)) return 'fashion';
        if (combined.match(/\b(gaming|game|entertainment)\b/)) return 'gaming';
        return 'general';
      })();

      return {
        pageType,
        stylePreferences,
        colorPreferences,
        industry,
        hasSpecificRequirements: combined.length > 50 // Detailed requirements vs simple request
      };
    };

    const context = analyzeUserContext(pageName, description);

    // Generate intelligent, context-aware prompt
    const generateDynamicPrompt = (context) => {
      const { pageType, stylePreferences, colorPreferences, industry, hasSpecificRequirements } = context;
      
      const basePrompt = `You are an expert UI/UX designer and React developer. Create a comprehensive React component based on the user's needs. Think intelligently about what this component should include based on its purpose and context.

COMPONENT REQUEST:
Page Name: ${pageName}
Description: ${description}
Detected Type: ${pageType}
Style Preference: ${stylePreferences.complexity}
Theme: ${stylePreferences.theme}
Mood: ${stylePreferences.mood}
Target Audience: ${stylePreferences.audience}
Industry Context: ${industry}

INTELLIGENT DESIGN THINKING:
You must think like a professional designer and automatically determine:

1. STRUCTURE & SECTIONS:
   - For ${pageType} pages, what sections would users expect to see?
   - What is the standard industry pattern for this type of page?
   - How should information be organized for optimal user experience?
   - What interactive elements would enhance usability?

2. COLOR SYSTEM:
   ${colorPreferences ? `- User mentioned these colors: ${colorPreferences.join(', ')} - incorporate them thoughtfully` : ''}
   - Based on ${stylePreferences.theme} theme preference, choose appropriate color palette
   - Consider ${industry} industry standards and conventions
   - Match colors to ${stylePreferences.mood} mood and ${stylePreferences.audience} audience
   - Use color psychology to support the page's primary goal

3. STYLE ADAPTATION:
   ${stylePreferences.complexity === 'fancy' ? '- Create luxurious, gradient-heavy design with premium aesthetics, glassmorphism, and sophisticated animations' : ''}
   ${stylePreferences.complexity === 'classic' ? '- Use clean, timeless design with solid colors, clear typography, and subtle effects' : ''}
   ${stylePreferences.complexity === 'corporate' ? '- Professional, trustworthy design with conservative colors and structured layouts' : ''}
   ${stylePreferences.complexity === 'creative' ? '- Bold, unique design with experimental layouts and vibrant color combinations' : ''}
   ${stylePreferences.complexity === 'modern' ? '- Contemporary design with current trends, balanced complexity, and intuitive UX' : ''}

4. FUNCTIONALITY INTELLIGENCE:
   - What features would users need on a ${pageType} page?
   - What interactions and state management are essential?
   - How should data flow and user actions be handled?
   - What validation, error handling, and feedback is needed?

DESIGN PHILOSOPHY:
- Think beyond templates - create contextually appropriate designs
- Every element should serve the page's primary purpose
- Balance visual appeal with functionality
- Consider user journey and conversion goals
- Make it feel custom-designed, not generic

TECHNICAL REQUIREMENTS:
- Use React hooks appropriately (useState, useEffect, useRef, etc.)
- Implement proper state management for all interactive elements
- Include comprehensive error handling and loading states
- Make it fully responsive and accessible
- Add smooth animations and micro-interactions using Tailwind's animation classes
- CRITICAL: Use ONLY Tailwind CSS utility classes - NO custom CSS, NO <style> tags, NO CSS-in-JS

STYLING REQUIREMENTS - TAILWIND ONLY:
- Use ONLY Tailwind utility classes directly on elements (className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300")
- NO <style> tags or CSS-in-JS styling whatsoever
- NO custom CSS variables or custom styles
- Leverage Tailwind's full power: gradients, shadows, transforms, animations, responsive utilities
- Use Tailwind's color palette intelligently based on context
- Implement complex layouts using Tailwind Grid and Flexbox classes
- Create depth with Tailwind shadows, borders, and backdrop effects
- Use Tailwind's animation and transition classes for interactions

ENHANCED UI DESIGN PATTERNS:
- Glassmorphism: Use backdrop-blur-* and bg-opacity-* classes
- Gradients: bg-gradient-to-* with multiple color stops
- Shadows: Complex shadow combinations with shadow-* classes
- Hover effects: Comprehensive hover: and focus: states
- Responsive design: Mobile-first with sm:, md:, lg:, xl: breakpoints
- Typography: Rich typography scale with font-*, text-*, leading-*, tracking-*
- Spacing: Consistent spacing system using Tailwind's spacing scale
- Dark mode support: Use dark: variants when appropriate

VISUAL REQUIREMENTS:
- Create stunning visual hierarchy using Tailwind typography utilities
- Implement sophisticated color schemes using Tailwind's color palette
- Use Tailwind's spacing system for perfect visual rhythm
- Leverage Tailwind's animation system for smooth micro-interactions
- Create depth and dimension with shadows, borders, and transforms
- Ensure pixel-perfect responsive design with Tailwind breakpoints

OUTPUT FORMAT - CRITICAL:
- Return ONLY the raw React component code with NO formatting
- NO markdown code blocks (jsx or )  
- NO explanations, descriptions, or comments before/after the code
- NO "Here's your component:" or similar introductory text
- Start directly with: import React, { useState } from 'react';
- End directly with: export default ComponentName;
- Component should be immediately functional and production-ready
- Use modern React patterns and best practices
- Import only React and hooks: import React, { useState, useEffect } from 'react'
- Every className must use pure Tailwind utility classes only

Think intelligently about what this ${pageType} component should look like and how it should behave based on the context provided. Create something that feels purposeful, well-designed, and perfectly suited to its intended use.

FINAL REMINDERS:
- ABSOLUTELY NO <style> tags or custom CSS anywhere in the code
- Use ONLY Tailwind utility classes in className attributes
- Component must be immediately runnable without any external CSS files
- Every visual element must be styled with Tailwind classes only
- Create stunning, professional UI using Tailwind's complete utility system
- CRITICAL OUTPUT: Return raw code only - NO markdown blocks, NO explanations, NO formatting`;

      return basePrompt;
    };

    const prompt = generateDynamicPrompt(context);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 for better design intelligence
      messages: [
        {
          role: "system",
          content: `You are an elite UI/UX designer and React architect with mastery of Tailwind CSS. Your expertise includes:

DESIGN INTELLIGENCE:
- Automatically determining appropriate page structures based on purpose
- Selecting color palettes that match context, industry, and user preferences
- Adapting complexity and style to match user requirements
- Creating designs that feel custom and purposeful, not template-based

TAILWIND CSS MASTERY:
- CRITICAL: Use ONLY Tailwind utility classes - NEVER use <style> tags or custom CSS
- Expert knowledge of Tailwind's complete utility system
- Creating complex layouts with Tailwind Grid and Flexbox
- Implementing sophisticated designs using only Tailwind classes
- Leveraging Tailwind's color system, spacing scale, and typography
- Using Tailwind animations, transforms, and effects for polish

ADVANCED UI PATTERNS WITH TAILWIND:
- Glassmorphism: backdrop-blur-md bg-white/20 bg-opacity-80
- Complex gradients: bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800
- Sophisticated shadows: shadow-2xl shadow-blue-500/25
- Hover animations: hover:scale-105 hover:shadow-xl transition-all duration-300
- Responsive design: Mobile-first with comprehensive breakpoint usage

CONTEXTUAL AWARENESS:
- Understanding what users expect from different page types
- Knowing industry standards and best practices
- Balancing aesthetic appeal with functionality
- Creating appropriate user experiences for different audiences

TECHNICAL MASTERY:
- Writing clean, performant React code with only Tailwind styling
- Implementing complex interactions and state management
- Creating responsive, accessible components using Tailwind utilities
- Using modern React patterns without any custom CSS

Your goal: Generate intelligent, context-aware components styled exclusively with Tailwind CSS that feel like they were custom-designed by a professional team. Create stunning, production-ready UIs using only Tailwind's utility system.

CRITICAL RULE: Return only React component code with Tailwind classes - absolutely no <style> tags, no custom CSS, no CSS-in-JS. Every design element must be achieved through Tailwind utilities.

RESPONSE FORMAT RULES:
- Return ONLY raw code - no markdown formatting (jsx)
- NO explanatory text before or after the code
- Start immediately with import statement
- End immediately with export statement
- Code must be ready to copy-paste directly into editor`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 16384,
      temperature: 0.8, 
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};
  try {
    const { pageName, description, projectId } = req.body;

    if (!pageName || !description || !projectId) {
      return res.status(400).json({ 
        error: 'pageName, description, and projectId are required' 
      });
    }

    let code;

    // If description is provided and meaningful, use AI generation
    if (description && description.trim().length > 10) {
      try {
        console.log(`Generating AI component for: ${pageName}`);
        code = await generateComponentWithAI(pageName, description);
        console.log('AI component generated successfully');
      } catch (aiError) {
        console.error('AI generation failed, using default:', aiError);
        // Fallback to default code if AI generation fails
        code = defaultComponentCode(pageName);
      }
    } else {
      // Use default code for simple cases
      code = defaultComponentCode(pageName);
    }

    const newPage = new FrontendPage({
      pageName,
      code,
      project: projectId
    });

    await newPage.save();

    res.status(201).json({
      ...newPage.toObject(),
      generatedWithAI: description && description.trim().length > 10
    });

  } catch (err) {
    console.error('Error creating component:', err);
    res.status(500).json({ 
      error: 'Failed to create component',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update component by ID
exports.updateCompo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPage = await FrontendPage.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedPage) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json(updatedPage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update component' });
  }
};

// Get component by ID
exports.getCompoById = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await FrontendPage.findById(id).populate('project');

    if (!page) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch component' });
  }
};

// Get components by project ID
exports.getCompoByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    const pages = await FrontendPage.find({ project: projectId });

    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
};

// Delete component by ID
exports.deleteCompo = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPage = await FrontendPage.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json({ message: 'Component deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete component' });
  }
};
