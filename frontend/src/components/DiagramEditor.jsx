import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Save, Trash2, Database, Loader, Key, Type, Hash, Calendar, ToggleLeft, FileText, Link, Move } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Bot } from 'lucide-react';
import AIChatbot from './AIchatBot';

const DiagramEditor = ({ projectId, diagramId, userId, authToken }) => {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [diagramName, setDiagramName] = useState('ER Diagram');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentDiagramId, setCurrentDiagramId] = useState(diagramId);
  const [currentUserId, setCurrentUserId] = useState(userId);
  const [currentProjectId, setCurrentProjectId] = useState(projectId);
  const [showAIChatbot, setShowAIChatbot] = useState(false);

  // New state for drag-to-connect functionality
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [connectionEnd, setConnectionEnd] = useState(null);
  const [tempConnectionPath, setTempConnectionPath] = useState(null);
  
  const canvasRef = useRef(null);

  // Function to get userId from token if not provided as prop
  const getUserIdFromToken = useCallback(() => {
    if (currentUserId) return currentUserId;
    
    try {
      const token = authToken || localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.userId;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return null;
  }, [currentUserId, authToken]);

  // Function to get projectId from URL params if not provided as prop
  const getProjectIdFromParams = useCallback(() => {
    if (currentProjectId) return currentProjectId;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pathParts = window.location.pathname.split('/');
      
      // Try to get from URL params first
      const projectIdFromParams = urlParams.get('projectId');
      if (projectIdFromParams) return projectIdFromParams;
      
      // Try to get from path (assuming URL structure like /projects/:projectId/diagrams)
      const projectIndex = pathParts.indexOf('projects');
      if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
        return pathParts[projectIndex + 1];
      }
    } catch (error) {
      console.error('Error getting projectId from params:', error);
    }
    return null;
  }, [currentProjectId]);

  // Initialize IDs on component mount
  useEffect(() => {
    const resolvedUserId = getUserIdFromToken();
    const resolvedProjectId = getProjectIdFromParams();
    
    if (resolvedUserId) setCurrentUserId(resolvedUserId);
    if (resolvedProjectId) setCurrentProjectId(resolvedProjectId);
    
    // Configure axios defaults
    const token = authToken || localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [getUserIdFromToken, getProjectIdFromParams, authToken]);

  // NEW: Function to load existing diagram for the project
  const loadExistingDiagramForProject = async (projectId) => {
    if (!projectId) return null;
    
    try {
      const token = authToken || localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/v1/diagrams/from/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      // If no diagram exists (404), that's fine - we'll create a new one
      if (error.response && error.response.status === 404) {
        console.log('No existing diagram found for project, will create new one');
        return null;
      }
      console.error('Error loading existing diagram:', error);
    }
    return null;
  };

  // Modified: Load existing diagram on component mount
  useEffect(() => {
    const loadDiagramData = async () => {
      if (!currentUserId) return;
      
      if (currentDiagramId) {
        // If specific diagram ID is provided, load that diagram
        await loadDiagram();
      } else if (currentProjectId) {
        // If no diagram ID but project ID exists, try to load existing diagram for project
        const existingDiagram = await loadExistingDiagramForProject(currentProjectId);
        if (existingDiagram) {
          setCurrentDiagramId(existingDiagram._id);
          setEntities(existingDiagram.entities || []);
          setDiagramName(existingDiagram.name || 'Untitled Diagram');
          setLastSaved(new Date(existingDiagram.updatedAt));
          console.log('Loaded existing diagram for project:', existingDiagram.name);
        }
      }
    };

    loadDiagramData();
  }, [currentUserId, currentProjectId, currentDiagramId]);

  // Auto-save functionality
  useEffect(() => {
    if (entities.length > 0 && currentUserId && currentProjectId) {
      const saveTimer = setTimeout(() => {
        autoSave();
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [entities, currentDiagramId, currentUserId, currentProjectId]);

  // API Functions
  const loadDiagram = async () => {
    if (!currentDiagramId) return;
    
    setIsLoading(true);
    try {
      const token = authToken || localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/v1/diagrams/${currentDiagramId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const diagram = response.data.data;
        setEntities(diagram.entities || []);
        setDiagramName(diagram.name || 'Untitled Diagram');
        setLastSaved(new Date(diagram.updatedAt));
      }
    } catch (error) {
      console.error('Error loading diagram:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDiagram = async (showNotification = true) => {
    // Ensure we have all required IDs
    const resolvedUserId = currentUserId || getUserIdFromToken();
    const resolvedProjectId = currentProjectId || getProjectIdFromParams();
    
    if (!resolvedUserId) {
      alert('User authentication required. Please log in again.');
      return;
    }
    
    if (!resolvedProjectId) {
      alert('Project ID is required. Please navigate from a valid project.');
      return;
    }
    
    setIsSaving(true);
    try {
      const diagramData = {
        name: diagramName,
        projectId: resolvedProjectId,
        entities
      };
      console.log(entities);
      const token = authToken || localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (currentDiagramId) {
        // Update existing diagram
        response = await axios.put(`${BACKEND_URL}/api/v1/diagrams/${currentDiagramId}`, diagramData, config);
      } else {
        // Create new diagram
        response = await axios.post(`${BACKEND_URL}/api/v1/diagrams`, diagramData, config);
        if (response.data.success) {
          setCurrentDiagramId(response.data.data._id);
        }
      }

      if (response.data.success) {
        setLastSaved(new Date());
        if (showNotification) {
          alert('Diagram saved successfully!');
        }
      } else {
        throw new Error(response.data.message || 'Failed to save diagram');
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      
      // More specific error messages
      if (error.response) {
        const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        alert(`Failed to save diagram: ${errorMessage}`);
      } else if (error.request) {
        alert('Failed to save diagram: No response from server. Please check your connection.');
      } else {
        alert(`Failed to save diagram: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const autoSave = async () => {
    if (entities.length > 0 && currentUserId && currentProjectId) {
      await saveDiagram(false); // Silent save
    }
  };

  // Enhanced drag and drop functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isConnecting && connectionStart && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        setTempConnectionPath({
          x1: connectionStart.x,
          y1: connectionStart.y,
          x2: currentX,
          y2: currentY
        });
        return;
      }
      
      if (!isDragging || !selectedEntity || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      setEntities(prev => prev.map(entity => 
        entity.id === selectedEntity 
          ? { ...entity, x: Math.max(0, newX), y: Math.max(0, newY) }
          : entity
      ));
    };

    const handleMouseUp = () => {
      if (isConnecting) {
        if (connectionStart && connectionEnd) {
          // Create the reference connection
          const sourceEntity = entities.find(e => e.id === connectionStart.entityId);
          const targetEntity = entities.find(e => e.id === connectionEnd.entityId);
          
          if (sourceEntity && targetEntity) {
            const refValue = `${targetEntity.name}.${connectionEnd.attributeName}`;
            updateAttribute(connectionStart.entityId, connectionStart.attributeIndex, 'ref', refValue);
          }
        }
        
        setIsConnecting(false);
        setConnectionStart(null);
        setConnectionEnd(null);
        setTempConnectionPath(null);
        return;
      }
      
      setIsDragging(false);
      setSelectedEntity(null);
    };

    if (isDragging || isConnecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isConnecting, selectedEntity, dragOffset, connectionStart, connectionEnd, entities]);

  const addEntity = useCallback(() => {
    const newEntity = {
      id: Date.now(),
      name: `Entity_${entities.length + 1}`,
      x: 100 + (entities.length * 50) % 400,
      y: 100 + Math.floor(entities.length / 8) * 200,
      attributes: [
        { name: 'id', type: 'number', unique: true, default: '', ref: '' }
      ]
    };
    setEntities([...entities, newEntity]);
  }, [entities]);

  const handleMouseDown = (e, entity) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setSelectedEntity(entity.id);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - entity.x,
      y: e.clientY - rect.top - entity.y
    });
  };

  // New function to handle connection start
  const startConnection = (e, entityId, attributeIndex, attributeName) => {
    e.preventDefault();
    e.stopPropagation();
    
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;
    
    const attributePos = getAttributePosition(entity, attributeName);
    if (!attributePos) return;
    
    setIsConnecting(true);
    setConnectionStart({
      entityId,
      attributeIndex,
      attributeName,
      x: attributePos.x,
      y: attributePos.y
    });
  };

  // New function to handle connection end
  const endConnection = (e, entityId, attributeName) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnecting || !connectionStart) return;
    
    const entity = entities.find(e => e.id === entityId);
    if (!entity) return;
    
    setConnectionEnd({
      entityId,
      attributeName
    });
  };

  const addAttribute = (entityId) => {
    setEntities(prev => prev.map(entity => 
      entity.id === entityId 
        ? { 
            ...entity, 
            attributes: [...entity.attributes, { name: '', type: 'string', unique: false, default: '', ref: '' }]
          }
        : entity
    ));
  };

  const updateAttribute = (entityId, attrIndex, field, value) => {
    setEntities(prev => prev.map(entity => 
      entity.id === entityId 
        ? {
            ...entity,
            attributes: entity.attributes.map((attr, idx) => 
              idx === attrIndex ? { ...attr, [field]: value } : attr
            )
          }
        : entity
    ));
  };

  const updateEntityName = (entityId, name) => {
    setEntities(prev => prev.map(entity => 
      entity.id === entityId ? { ...entity, name } : entity
    ));
  };

  const deleteEntity = (entityId) => {
    setEntities(prev => prev.filter(entity => entity.id !== entityId));
  };

  const deleteAttribute = (entityId, attrIndex) => {
    setEntities(prev => prev.map(entity => 
      entity.id === entityId 
        ? {
            ...entity,
            attributes: entity.attributes.filter((_, idx) => idx !== attrIndex)
          }
        : entity
    ));
  };

  const saveProject = () => {
    saveDiagram();
  };

  // Helper function to get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'number': return <Hash className="w-3 h-3" />;
      case 'date': return <Calendar className="w-3 h-3" />;
      case 'boolean': return <ToggleLeft className="w-3 h-3" />;
      case 'text': return <FileText className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  // Helper function to find attribute position for arrows
  const getAttributePosition = (entity, attributeName) => {
    const attributeIndex = entity.attributes.findIndex(attr => attr.name === attributeName);
    if (attributeIndex === -1) return null;
    
    return {
      x: entity.x + 240, // Right edge of entity (increased from 200)
      y: entity.y + 40 + (attributeIndex * 32) + 16 // Header height + attribute offset + half attribute height
    };
  };

  return (
    // <div className="h-screen bg-gray-900 text-white overflow-hidden flex flex-col">
    //   {/* Header */}
    //   <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
    //     <div className="flex items-center space-x-3">
    //       <Database className="w-6 h-6 text-cyan-400" />
    //       <h1 className="text-xl font-bold text-white">Database Diagram Editor</h1>
    //       {isLoading && <Loader className="w-4 h-4 animate-spin text-cyan-400" />}
    //     </div>
        
    //     <div className="flex items-center space-x-2">
    //       <button 
    //         onClick={addEntity}
    //         className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
    //       >
    //         <Plus className="w-4 h-4" />
    //         <span>Add Entity</span>
    //       </button>
    //       <button 
    //         onClick={saveProject}
    //         disabled={isSaving}
    //         className="bg-green-600 hover:bg-green-500 disabled:bg-green-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
    //       >
    //         {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
    //         <span>{isSaving ? 'Saving...' : 'Save'}</span>
    //       </button>
    //     </div>
    //   </div>

    //   {/* Canvas */}
    //   <div className="flex-1 relative overflow-hidden">
    //     <div 
    //       ref={canvasRef}
    //       className="w-full h-full bg-gray-900 relative overflow-auto"
    //       style={{
    //         backgroundImage: `
    //           radial-gradient(circle, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
    //         `,
    //         backgroundSize: '20px 20px',
    //         cursor: isDragging ? 'grabbing' : isConnecting ? 'crosshair' : 'default'
    //       }}
    //     >
    //       {/* Grid Pattern */}
    //       <div className="absolute inset-0 opacity-20 pointer-events-none">
    //         <svg width="100%" height="100%">
    //           <defs>
    //             <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
    //               <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="0.5"/>
    //             </pattern>
    //           </defs>
    //           <rect width="100%" height="100%" fill="url(#grid)" />
    //         </svg>
    //       </div>

    //       {/* Entities */}
    //       {entities.map((entity) => (
    //         <div
    //           key={entity.id}
    //           className={`absolute bg-gray-800 border rounded-lg shadow-lg min-w-60 max-w-72 select-none ${
    //             selectedEntity === entity.id ? 'border-cyan-400 shadow-cyan-400/20' : 'border-gray-600'
    //           }`}
    //           style={{ left: entity.x, top: entity.y, zIndex: selectedEntity === entity.id ? 10 : 1 }}
    //         >
    //           {/* Entity Header */}
    //           <div 
    //             className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 rounded-t-lg cursor-move"
    //             onMouseDown={(e) => handleMouseDown(e, entity)}
    //           >
    //             <div className="flex items-center justify-between">
    //               <input
    //                 type="text"
    //                 value={entity.name}
    //                 onChange={(e) => updateEntityName(entity.id, e.target.value)}
    //                 className="bg-transparent text-white font-semibold text-base border-none outline-none cursor-text flex-1"
    //                 onMouseDown={(e) => e.stopPropagation()}
    //                 onFocus={(e) => e.stopPropagation()}
    //               />
    //               <button 
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   deleteEntity(entity.id);
    //                 }}
    //                 className="text-red-300 hover:text-red-200 transition-colors ml-2"
    //               >
    //                 <Trash2 className="w-4 h-4" />
    //               </button>
    //             </div>
    //           </div>

    //           {/* Attributes */}
    //           <div className="p-3 space-y-2">
    //             {entity.attributes.map((attr, idx) => (
    //               <div key={idx} className="bg-gray-700 rounded-lg px-3 py-2 border border-gray-600 text-sm">
    //                 <div className="flex items-center justify-between mb-2">
    //                   <div className="flex items-center space-x-2 flex-1">
    //                     {getTypeIcon(attr.type)}
    //                     <input
    //                       type="text"
    //                       placeholder="attribute_name"
    //                       value={attr.name}
    //                       onChange={(e) => updateAttribute(entity.id, idx, 'name', e.target.value)}
    //                       className="bg-transparent text-white text-sm font-medium border-none outline-none flex-1 min-w-0 placeholder-gray-400"
    //                       onMouseDown={(e) => e.stopPropagation()}
    //                     />
    //                     {attr.unique && <Key className="w-4 h-4 text-yellow-400" />}
    //                     {attr.ref && <Link className="w-4 h-4 text-green-400" />}
    //                   </div>
    //                   <div className="flex items-center space-x-1">
    //                     <button
    //                       onClick={(e) => startConnection(e, entity.id, idx, attr.name)}
    //                       className="text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-gray-600"
    //                       title="Drag to connect"
    //                     >
    //                       <Link className="w-3 h-3" />
    //                     </button>
    //                     <button
    //                       onClick={(e) => {
    //                         e.stopPropagation();
    //                         deleteAttribute(entity.id, idx);
    //                       }}
    //                       className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-gray-600"
    //                     >
    //                       <Trash2 className="w-3 h-3" />
    //                     </button>
    //                   </div>
    //                 </div>
                    
    //                 <div className="grid grid-cols-2 gap-2 mb-2">
    //                   <select
    //                     value={attr.type}
    //                     onChange={(e) => updateAttribute(entity.id, idx, 'type', e.target.value)}
    //                     className="bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-cyan-400 outline-none"
    //                     onMouseDown={(e) => e.stopPropagation()}
    //                   >
    //                     <option value="string">String</option>
    //                     <option value="number">Number</option>
    //                     <option value="boolean">Boolean</option>
    //                     <option value="date">Date</option>
    //                     <option value="text">Text</option>
    //                   </select>
    //                   <label className="flex items-center space-x-2 text-sm cursor-pointer">
    //                     <input
    //                       type="checkbox"
    //                       checked={attr.unique}
    //                       onChange={(e) => updateAttribute(entity.id, idx, 'unique', e.target.checked)}
    //                       className="w-4 h-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
    //                       onMouseDown={(e) => e.stopPropagation()}
    //                     />
    //                     <span>Unique</span>
    //                   </label>
    //                 </div>

    //                 <div className="grid grid-cols-1 gap-2">
    //                   <input
    //                     type="text"
    //                     placeholder="Default value"
    //                     value={attr.default}
    //                     onChange={(e) => updateAttribute(entity.id, idx, 'default', e.target.value)}
    //                     className="bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-cyan-400 outline-none placeholder-gray-400"
    //                     onMouseDown={(e) => e.stopPropagation()}
    //                   />
    //                   <div className="relative">
    //                     <input
    //                       type="text"
    //                       placeholder="Reference (Entity.attribute)"
    //                       value={attr.ref}
    //                       onChange={(e) => updateAttribute(entity.id, idx, 'ref', e.target.value)}
    //                       className="bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-cyan-400 outline-none placeholder-gray-400 w-full"
    //                       onMouseDown={(e) => e.stopPropagation()}
    //                       onMouseEnter={(e) => {
    //                         if (isConnecting) {
    //                           endConnection(e, entity.id, attr.name);
    //                         }
    //                       }}
    //                     />
    //                     {isConnecting && (
    //                       <div 
    //                         className="absolute inset-0 bg-cyan-400 bg-opacity-20 rounded border-2 border-cyan-400 border-dashed pointer-events-none"
    //                         onMouseEnter={(e) => endConnection(e, entity.id, attr.name)}
    //                       />
    //                     )}
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
                
    //             <button
    //               onClick={(e) => {
    //                 e.stopPropagation();
    //                 addAttribute(entity.id);
    //               }}
    //               className="w-full bg-gray-700 hover:bg-gray-600 border border-dashed border-gray-500 rounded-lg p-2 flex items-center justify-center space-x-2 transition-colors text-sm"
    //             >
    //               <Plus className="w-4 h-4" />
    //               <span>Add Attribute</span>
    //             </button>
    //           </div>
    //         </div>
    //       ))}

    //       {/* Enhanced Relationship Arrows */}
    //       <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
    //         <defs>
    //           <marker
    //             id="arrowhead"
    //             markerWidth="10"
    //             markerHeight="7"
    //             refX="9"
    //             refY="3.5"
    //             orient="auto"
    //           >
    //             <polygon
    //               points="0 0, 10 3.5, 0 7"
    //               fill="rgba(34, 197, 94, 0.8)"
    //             />
    //           </marker>
    //         </defs>
            
    //         {/* Existing relationships */}
    //         {entities.map(entity => 
    //           entity.attributes
    //             .filter(attr => attr.ref && attr.ref.includes('.'))
    //             .map((attr, idx) => {
    //               const [targetEntityName, targetAttrName] = attr.ref.split('.');
    //               const targetEntity = entities.find(e => e.name === targetEntityName);
    //               if (!targetEntity) return null;
                  
    //               const sourcePos = getAttributePosition(entity, attr.name);
    //               const targetPos = getAttributePosition(targetEntity, targetAttrName);
                  
    //               if (!sourcePos || !targetPos) return null;
                  
    //               // Calculate control points for curved arrow
    //               const midX = (sourcePos.x + targetPos.x) / 2;
    //               const midY = (sourcePos.y + targetPos.y) / 2;
    //               const offsetX = (targetPos.y - sourcePos.y) * 0.2;
    //               const offsetY = (sourcePos.x - targetPos.x) * 0.2;
                  
    //               const pathData = `M ${sourcePos.x} ${sourcePos.y} Q ${midX + offsetX} ${midY + offsetY} ${targetPos.x - 15} ${targetPos.y}`;
                  
    //               return (
    //                 <g key={`${entity.id}-${idx}`}>
    //                   <path
    //                     d={pathData}
    //                     stroke="rgba(34, 197, 94, 0.8)"
    //                     strokeWidth="2"
    //                     fill="none"
    //                     markerEnd="url(#arrowhead)"
    //                   />
    //                   <text 
    //                     x={midX + offsetX} 
    //                     y={midY + offsetY - 8} 
    //                     fill="rgba(34, 197, 94, 0.9)" 
    //                     fontSize="12" 
    //                     textAnchor="middle"
    //                     className="font-medium"
    //                   >
    //                     {attr.name} → {targetAttrName}
    //                   </text>
    //                 </g>
    //               );
    //             })
    //         )}
            
    //         {/* Temporary connection line while dragging */}
    //         {tempConnectionPath && (
    //           <line
    //             x1={tempConnectionPath.x1}
    //             y1={tempConnectionPath.y1}
    //             x2={tempConnectionPath.x2}
    //             y2={tempConnectionPath.y2}
    //             stroke="rgba(34, 197, 94, 0.6)"
    //             strokeWidth="2"
    //             strokeDasharray="5,5"
    //           />
    //         )}
    //       </svg>

    //       {/* Welcome Message */}
    //       {entities.length === 0 && !isLoading && (
    //         <div className="absolute inset-0 flex items-center justify-center">
    //           <div className="text-center">
    //             <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
    //             <h2 className="text-2xl font-bold text-gray-400 mb-2">Start Creating Your Database Diagram</h2>
    //             <p className="text-gray-500 mb-4">Click "Add Entity" to create your first table</p>
    //             <button 
    //               onClick={addEntity}
    //               className="bg-cyan-600 hover:bg-cyan-500 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors mx-auto"
    //             >
    //               <Plus className="w-5 h-5" />
    //               <span>Add Your First Entity</span>
    //             </button>
    //           </div>
    //         </div>
    //       )}
          
    //       {/* Connection Instructions */}
    //       {isConnecting && (
    //         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white px-4 py-2 rounded-lg shadow-lg z-20">
    //           <div className="flex items-center space-x-2">
    //             <Link className="w-4 h-4" />
    //             <span>Drag to connect to a target attribute. Click anywhere to cancel.</span>
    //           </div>
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   {/* Status Bar */}
    //   <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center justify-between text-sm text-gray-400 flex-shrink-0">
    //     <div className="flex items-center space-x-4">
    //       <span>Entities: {entities.length}</span>
    //       <span>Attributes: {entities.reduce((acc, e) => acc + e.attributes.length, 0)}</span>
    //       <span>Relationships: {entities.reduce((acc, e) => acc + e.attributes.filter(a => a.ref).length, 0)}</span>
    //       {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
    //     </div>
    //     <div className="flex items-center space-x-2">
    //       <div className={`w-2 h-2 rounded-full ${
    //         isSaving ? 'bg-yellow-400' : 
    //         entities.length > 0 ? 'bg-green-400' : 'bg-gray-500'
    //       }`}></div>
    //       <span>
    //         {isSaving ? 'Saving...' : 
    //          entities.length > 0 ? 'Diagram Active' : 'Ready'}
    //       </span>
    //       {isConnecting && (
    //         <span className="text-cyan-400 font-medium">
    //           • Connecting Mode
    //         </span>
    //       )}
    //     </div>
    //   </div>
    // </div>
     <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 p-4 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Database Designer</h1>
            <p className="text-xs text-slate-400">Visual ER Diagram Editor</p>
          </div>
          {isLoading && <Loader className="w-4 h-4 animate-spin text-cyan-400" />}
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Chatbot Button */}
          <button
            onClick={() => setShowAIChatbot(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            title="AI Schema Generator"
          >
            <Bot className="w-4 h-4" />
            <span className="font-medium">AI Generate</span>
          </button>
          
          <button
            onClick={addEntity}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add Entity</span>
          </button>
          
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-emerald-700 disabled:to-green-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
          >
            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="font-medium">{isSaving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Enhanced Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative overflow-auto"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              linear-gradient(135deg, #0f172a 0%, #1e293b 100%)
            `,
            cursor: isDragging ? "grabbing" : isConnecting ? "crosshair" : "default",
          }}
        >
          {/* Enhanced Grid Pattern */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="0.5" />
                </pattern>
                <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse">
                  <circle cx="24" cy="24" r="1" fill="rgba(59, 130, 246, 0.2)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          {/* Compact Entities */}
          {entities.map((entity) => (
            <div
              key={entity.id}
              className={`absolute bg-slate-800/90 backdrop-blur-sm border rounded-xl shadow-2xl min-w-48 max-w-56 select-none transition-all duration-200 ${
                selectedEntity === entity.id
                  ? "border-cyan-400 shadow-cyan-400/30 scale-105"
                  : "border-slate-600/50 hover:border-slate-500"
              }`}
              style={{ left: entity.x, top: entity.y, zIndex: selectedEntity === entity.id ? 10 : 1 }}
            >
              {/* Compact Entity Header */}
              <div
                className="bg-gradient-to-r from-slate-700 to-slate-600 p-2.5 rounded-t-xl cursor-move flex items-center justify-between group hover:from-slate-600 hover:to-slate-500 transition-all duration-200"
                onMouseDown={(e) => handleMouseDown(e, entity)}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <Move className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
                  <input
                    type="text"
                    value={entity.name}
                    onChange={(e) => updateEntityName(entity.id, e.target.value)}
                    className="bg-transparent text-white font-semibold text-sm border-none outline-none cursor-text flex-1 placeholder-slate-400"
                    onMouseDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    placeholder="Table name"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteEntity(entity.id)
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-500/20"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Compact Attributes */}
              <div className="p-2 space-y-1">
                {entity.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700/50 rounded-lg px-2 py-1.5 border border-slate-600/30 text-xs group hover:bg-slate-700/70 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                        {getTypeIcon(attr.type)}
                        <input
                          type="text"
                          placeholder="attribute_name"
                          value={attr.name}
                          onChange={(e) => updateAttribute(entity.id, idx, "name", e.target.value)}
                          className="bg-transparent text-white text-xs font-medium border-none outline-none flex-1 min-w-0 placeholder-slate-500"
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center space-x-1">
                          {attr.unique && <Key className="w-3 h-3 text-yellow-400" />}
                          {attr.ref && <Link className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startConnection(e, entity.id, idx, attr.name)}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5 rounded hover:bg-cyan-500/20"
                          title="Drag to connect"
                        >
                          <Link className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteAttribute(entity.id, idx)
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors p-0.5 rounded hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 mb-1">
                      <select
                        value={attr.type}
                        onChange={(e) => updateAttribute(entity.id, idx, "type", e.target.value)}
                        className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-xs border border-slate-500 focus:border-cyan-400 outline-none flex-1"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="text">Text</option>
                      </select>
                      <label className="flex items-center space-x-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attr.unique}
                          onChange={(e) => updateAttribute(entity.id, idx, "unique", e.target.checked)}
                          className="w-3 h-3 text-cyan-600 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                        <span className="text-slate-300">Unique</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Default value"
                        value={attr.default}
                        onChange={(e) => updateAttribute(entity.id, idx, "default", e.target.value)}
                        className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-xs border border-slate-500 focus:border-cyan-400 outline-none w-full placeholder-slate-400"
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Reference (Entity.attribute)"
                          value={attr.ref}
                          onChange={(e) => updateAttribute(entity.id, idx, "ref", e.target.value)}
                          className="bg-slate-600 text-emerald-300 px-1.5 py-0.5 rounded text-xs border border-emerald-500/50 focus:border-emerald-400 outline-none w-full placeholder-slate-400"
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => {
                            if (isConnecting) {
                              endConnection(e, entity.id, attr.name)
                            }
                          }}
                        />
                        {isConnecting && (
                          <div
                            className="absolute inset-0 bg-cyan-400 bg-opacity-20 rounded border border-cyan-400 border-dashed pointer-events-none"
                            onMouseEnter={(e) => endConnection(e, entity.id, attr.name)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addAttribute(entity.id)
                  }}
                  className="w-full bg-slate-700/30 hover:bg-slate-700/50 border border-dashed border-slate-500/50 rounded-lg p-1.5 flex items-center justify-center space-x-1.5 transition-colors text-xs text-slate-300 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Attribute</span>
                </button>
              </div>
            </div>
          ))}

          {/* Enhanced Relationship Arrows */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            <defs>
              <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="rgba(16, 185, 129, 0.9)"
                  stroke="rgba(16, 185, 129, 0.9)"
                  strokeWidth="1"
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Existing relationships with enhanced styling */}
            {entities.map((entity) =>
              entity.attributes
                .filter((attr) => attr.ref && attr.ref.includes("."))
                .map((attr, idx) => {
                  const [targetEntityName, targetAttrName] = attr.ref.split(".")
                  const targetEntity = entities.find((e) => e.name === targetEntityName)
                  if (!targetEntity) return null

                  const sourcePos = getAttributePosition(entity, attr.name)
                  const targetPos = getAttributePosition(targetEntity, targetAttrName)

                  if (!sourcePos || !targetPos) return null

                  // Enhanced curved arrow calculation
                  const dx = targetPos.x - sourcePos.x
                  const dy = targetPos.y - sourcePos.y
                  const distance = Math.sqrt(dx * dx + dy * dy)
                  const curvature = Math.min(distance * 0.3, 100)

                  const midX = (sourcePos.x + targetPos.x) / 2
                  const midY = (sourcePos.y + targetPos.y) / 2
                  const offsetX = (-dy / distance) * curvature
                  const offsetY = (dx / distance) * curvature

                  const pathData = `M ${sourcePos.x} ${sourcePos.y} Q ${midX + offsetX} ${midY + offsetY} ${targetPos.x - 20} ${targetPos.y}`

                  return (
                    <g key={`${entity.id}-${idx}`}>
                      {/* Glow effect */}
                      <path
                        d={pathData}
                        stroke="rgba(16, 185, 129, 0.3)"
                        strokeWidth="6"
                        fill="none"
                        filter="url(#glow)"
                      />
                      {/* Main arrow */}
                      <path
                        d={pathData}
                        stroke="rgba(16, 185, 129, 0.9)"
                        strokeWidth="2.5"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                        className="drop-shadow-lg"
                      />
                      {/* Relationship label */}
                      <g>
                        <rect
                          x={midX + offsetX - 25}
                          y={midY + offsetY - 12}
                          width="50"
                          height="16"
                          rx="8"
                          fill="rgba(16, 185, 129, 0.9)"
                          className="drop-shadow-lg"
                        />
                        <text
                          x={midX + offsetX}
                          y={midY + offsetY - 2}
                          fill="white"
                          fontSize="10"
                          textAnchor="middle"
                          className="font-semibold"
                        >
                          FK
                        </text>
                      </g>
                    </g>
                  )
                }),
            )}

            {/* Enhanced temporary connection line */}
            {tempConnectionPath && (
              <g>
                <line
                  x1={tempConnectionPath.x1}
                  y1={tempConnectionPath.y1}
                  x2={tempConnectionPath.x2}
                  y2={tempConnectionPath.y2}
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  filter="url(#glow)"
                />
                <circle cx={tempConnectionPath.x2} cy={tempConnectionPath.y2} r="4" fill="rgba(59, 130, 246, 0.8)" />
              </g>
            )}
          </svg>

          {/* Enhanced Welcome Message */}
          {entities.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl">
                    <Database className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Start Creating Your Database Diagram</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Click "Add Entity" to create your first table and start designing your database schema.
                </p>
                <button
                  onClick={addEntity}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 mx-auto shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Add Your First Entity</span>
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Connection Instructions */}
          {isConnecting && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl shadow-2xl z-20 backdrop-blur-sm border border-blue-400/30">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <Link className="w-4 h-4" />
                <span className="font-medium">Drag to connect to a target attribute. Click anywhere to cancel.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700/50 p-3 flex items-center justify-between text-sm text-slate-300 flex-shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="font-medium">Entities: {entities.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Attributes: {entities.reduce((acc, e) => acc + e.attributes.length, 0)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>Relationships: {entities.reduce((acc, e) => acc + e.attributes.filter((a) => a.ref).length, 0)}</span>
          </div>
          {lastSaved && (
            <div className="flex items-center space-x-2 text-slate-400">
              <Save className="w-3 h-3" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
              isSaving
                ? "bg-yellow-500/20 text-yellow-300"
                : entities.length > 0
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-500/20 text-slate-400"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isSaving ? "bg-yellow-400 animate-pulse" : entities.length > 0 ? "bg-emerald-400" : "bg-slate-500"
              }`}
            ></div>
            <span>{isSaving ? "Saving..." : entities.length > 0 ? "Diagram Active" : "Ready"}</span>
          </div>
          {isConnecting && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <span>• Connecting Mode</span>
            </div>
          )}
        </div>
      </div>
      {showAIChatbot && (
        <AIChatbot
          isOpen={showAIChatbot}
          onClose={() => setShowAIChatbot(false)}
          onGenerateDiagram={(generatedEntities) => {
            setEntities(generatedEntities);
            setShowAIChatbot(false);
          }}
          entities={entities}
          setEntities={setEntities}
        />
      )}
    </div>
  );
};

export default DiagramEditor;