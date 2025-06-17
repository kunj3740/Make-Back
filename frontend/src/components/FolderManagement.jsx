// import React, { useState, useEffect } from 'react';
// import { Plus, Folder, Edit2, Trash2, Save, X, FileCode, AlertCircle } from 'lucide-react';
// import axios from 'axios';
// import { BACKEND_URL } from '../config'

// const FolderManagement = ({ 
//   projectId = "684e85c2e4057008b9532c30", 
//   userId = "684d4af18371719a6892c8ed",
// }) => {
//   const [folders, setFolders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingFolder, setEditingFolder] = useState(null);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [newFolder, setNewFolder] = useState({ name: '', description: '' });
//   const [error, setError] = useState('');
//   const [authToken, setAuthToken] = useState("");
  

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setAuthToken(token);
//     }
//   }, []);

//   useEffect(() => {
//     if (projectId && authToken) {
//       fetchFolders();
//     }
//   }, [projectId, authToken]);

//   const fetchFolders = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${BACKEND_URL}/api/v1/folders/project/${projectId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });
//       setFolders(res.data.data || []);
//     } catch (err) {
//       setError('Failed to fetch folders');
//       console.error('Error fetching folders:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createFolder = async () => {
//     if (!newFolder.name.trim()) {
//       setError('Folder name is required');
//       return;
//     }

//     setError('');
//     try {
//       const res = await axios.post(`${BACKEND_URL}/api/v1/folders/`, {
//         name: newFolder.name,
//         description: newFolder.description,
//         projectId,
//         userId
//       }, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev => [...prev, res.data.data]);
//       setNewFolder({ name: '', description: '' });
//       setShowCreateForm(false);
//     } catch (err) {
//       setError('Failed to create folder');
//       console.error('Error creating folder:', err);
//     }
//   };

//   const updateFolder = async (folderId, updatedData) => {
//     setError('');
//     try {
//       await axios.put(`${BACKEND_URL}/api/v1/folders/${folderId}`, updatedData, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev =>
//         prev.map(f => f._id === folderId ? { ...f, ...updatedData } : f)
//       );
//       setEditingFolder(null);
//     } catch (err) {
//       setError('Failed to update folder');
//       console.error('Error updating folder:', err);
//     }
//   };

//   const deleteFolder = async (folderId) => {
//     const confirmed = window.confirm('Are you sure you want to delete this folder and its APIs?');
//     if (!confirmed) return;

//     setError('');
//     try {
//       await axios.delete(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev => prev.filter(f => f._id !== folderId));
//     } catch (err) {
//       setError('Failed to delete folder');
//       console.error('Error deleting folder:', err);
//     }
//   };

//   const createSampleApi = async (folderId) => {
//     const randomApi = {
//       name: 'Get User Profile',
//       description: 'Retrieve user profile information by user ID',
//       method: 'GET',
//       endpoint: '/users/:id/profile/xyz',
//       controllerCode: `const getUserProfileController = async (req, res) => {
//             try {
//               const { id } = req.params;
              
//               // Validation
//               if (!id) {
//                 return res.status(400).json({ 
//                   success: false, 
//                   message: 'User ID is required' 
//                 });
//               }
              
//               // Mock user profile data
//               const userProfile = {
//                 id,
//                 name: 'John Doe',
//                 email: 'john.doe@example.com',
//                 phone: '+1234567890',
//                 address: {
//                   street: '123 Main St',
//                   city: 'New York',
//                   state: 'NY',
//                   zipCode: '10001',
//                   country: 'USA'
//                 },
//                 preferences: {
//                   notifications: true,
//                   theme: 'light',
//                   language: 'en'
//                 },
//                 createdAt: '2024-01-15T10:30:00Z',
//                 updatedAt: new Date().toISOString(),
//                 isActive: true
//               };
              
//               res.status(200).json({
//                 success: true,
//                 data: userProfile,
//                 message: 'User profile retrieved successfully'
//               });
              
//             } catch (error) {
//               res.status(500).json({ 
//                 success: false, 
//                 message: 'Internal server error',
//                 error: error.message 
//               });
//             }
//           };`,
//       testCases: [
//         {
//           name: 'Get User Profile Success',
//           input: {
//             params: { id: '507f1f77bcf86cd799439011' },
//             query: {},
//             body: {}
//           },
//           expectedOutput: {
//             response: {
//               success: true,
//               data: {
//                 id: '507f1f77bcf86cd799439011',
//                 name: 'John Doe',
//                 email: 'john.doe@example.com',
//                 isActive: true
//               },
//               message: 'User profile retrieved successfully'
//             }
//           },
//           description: 'Test successful retrieval of user profile with valid user ID'
//         },
//       ],
//       documentation: {
//         summary: 'Retrieve detailed user profile information including personal details, address, and preferences',
//         parameters: [
//           {
//             name: 'id',
//             type: 'string',
//             required: true,
//             description: 'Unique identifier of the user (MongoDB ObjectId format)',
//             location: 'params'
//           }
//         ]
//       },
//     };
    
    
//     setError('');
//     try {
//         const res = await axios.post(`${BACKEND_URL}/api/v1/folders/${folderId}/api`, randomApi, {
//               headers: { Authorization: `Bearer ${authToken}` }
//             });      
//         setFolders(prev =>
//           prev.map(f => f._id === folderId
//             ? { ...f, apis: [...(f.apis || []), res.data.data] }
//             : f
//           )
//         );
//     } catch (err) {
//       setError('Failed to create API');
//       console.error('Error creating API:', err);
//     }
//   };

//   const FolderCard = ({ folder }) => {
//     const [editData, setEditData] = useState({ name: folder.name, description: folder.description });
//     const isEditing = editingFolder === folder._id;

//     return (
//       <div className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center space-x-2 flex-1">
//             <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
//             {isEditing ? (
//               <input
//                 type="text"
//                 value={editData.name}
//                 onChange={(e) => setEditData({ ...editData, name: e.target.value })}
//                 className="text-lg font-semibold border rounded px-2 py-1 flex-1"
//                 placeholder="Folder name"
//               />
//             ) : (
//               <h3 className="text-lg font-semibold text-gray-800 truncate">{folder.name}</h3>
//             )}
//           </div>
//           <div className="flex space-x-2 flex-shrink-0">
//             {isEditing ? (
//               <>
//                 <button 
//                   onClick={() => updateFolder(folder._id, editData)}
//                   className="p-1 hover:bg-green-50 rounded"
//                   title="Save changes"
//                 >
//                   <Save className="h-4 w-4 text-green-600" />
//                 </button>
//                 <button 
//                   onClick={() => { 
//                     setEditData({ name: folder.name, description: folder.description }); 
//                     setEditingFolder(null); 
//                   }}
//                   className="p-1 hover:bg-gray-50 rounded"
//                   title="Cancel editing"
//                 >
//                   <X className="h-4 w-4 text-gray-600" />
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button 
//                   onClick={() => setEditingFolder(folder._id)}
//                   className="p-1 hover:bg-blue-50 rounded"
//                   title="Edit folder"
//                 >
//                   <Edit2 className="h-4 w-4 text-blue-600" />
//                 </button>
//                 <button 
//                   onClick={() => deleteFolder(folder._id)}
//                   className="p-1 hover:bg-red-50 rounded"
//                   title="Delete folder"
//                 >
//                   <Trash2 className="h-4 w-4 text-red-600" />
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {isEditing ? (
//           <textarea
//             value={editData.description}
//             onChange={(e) => setEditData({ ...editData, description: e.target.value })}
//             className="w-full border rounded px-3 py-2 resize-none"
//             rows="3"
//             placeholder="Folder description (optional)"
//           />
//         ) : (
//           <p className="text-gray-600 mb-4 min-h-[1.5rem]">
//             {folder.description || 'No description'}
//           </p>
//         )}

//         <div className="flex items-center justify-between mt-4 pt-4 border-t">
//           <div className="text-sm text-gray-500">
//             {folder.apis?.length || 0} APIs · Created {new Date(folder.createdAt).toLocaleDateString()}
//           </div>
//           <button 
//             onClick={() => createSampleApi(folder._id)} 
//             className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:underline transition-colors"
//           >
//             <FileCode className="h-4 w-4" />
//             <span>Create API</span>
//           </button>
//         </div>

//         {folder.apis?.length > 0 && (
//           <div className="mt-4">
//             <h4 className="text-sm font-semibold mb-2">APIs:</h4>
//             <div className="space-y-2 max-h-48 overflow-y-auto">
//               {folder.apis.map((api, i) => (
//                 <div key={api._id || i} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
//                   <span className={`text-xs px-2 py-1 rounded font-medium ${
//                     api.method === 'GET' ? 'bg-green-100 text-green-800' :
//                     api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
//                     api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
//                     api.method === 'DELETE' ? 'bg-red-100 text-red-800' : 
//                     'bg-gray-200 text-gray-700'
//                   }`}>
//                     {api.method}
//                   </span>
//                   <div className="flex-1 min-w-0">
//                     <div className="text-sm font-medium text-gray-900 truncate">{api.name}</div>
//                     <div className="text-xs text-gray-500 truncate">{api.endpoint}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2 text-gray-600">Loading folders...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Folder Management</h2>
//           <p className="text-gray-600 mt-1">Organize your APIs into folders</p>
//         </div>
//         <button 
//           onClick={() => setShowCreateForm(true)} 
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
//         >
//           <Plus className="h-4 w-4" />
//           <span>Create Folder</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
//           <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
//           <span className="text-red-700">{error}</span>
//         </div>
//       )}

//       {showCreateForm && (
//         <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
//           <h3 className="font-semibold text-lg mb-4 text-gray-900">Create New Folder</h3>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Folder Name *
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter folder name..."
//                 value={newFolder.name}
//                 onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 placeholder="Enter folder description (optional)..."
//                 value={newFolder.description}
//                 onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 rows="3"
//               />
//             </div>
//           </div>
//           <div className="flex space-x-3 mt-6">
//             <button 
//               onClick={createFolder} 
//               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Create Folder
//             </button>
//             <button 
//               onClick={() => { 
//                 setShowCreateForm(false); 
//                 setNewFolder({ name: '', description: '' }); 
//                 setError('');
//               }} 
//               className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {folders.length === 0 ? (
//         <div className="text-center py-12">
//           <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No folders found</h3>
//           <p className="text-gray-500 mb-4">Create your first folder to organize your APIs</p>
//           <button 
//             onClick={() => setShowCreateForm(true)}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Create Folder
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {folders.map(folder => (
//             folder && folder._id && <FolderCard key={folder._id} folder={folder} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FolderManagement;
// import React, { useState, useEffect } from 'react';
// import { 
//   Plus, 
//   Folder, 
//   Edit2, 
//   Trash2, 
//   Save, 
//   X, 
//   FileCode, 
//   AlertCircle, 
//   ArrowLeft,
//   Eye,
//   Settings,
//   Code,
//   Play,
//   BookOpen,
//   ChevronRight,
//   Search,
//   Filter,
//   MoreVertical
// } from 'lucide-react';
// import axios from 'axios';
// import { BACKEND_URL } from '../config';

// const FolderManagement = ({ 
//   projectId = "684e85c2e4057008b9532c30", 
//   userId = "684d4af18371719a6892c8ed",
// }) => {
//   const [folders, setFolders] = useState([]);
//   const [selectedFolder, setSelectedFolder] = useState(null);
//   const [currentView, setCurrentView] = useState('folders'); // 'folders', 'apis', 'api-detail'
//   const [selectedApi, setSelectedApi] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editingFolder, setEditingFolder] = useState(null);
//   const [editingApi, setEditingApi] = useState(null);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [showCreateApiForm, setShowCreateApiForm] = useState(false);
//   const [newFolder, setNewFolder] = useState({ name: '', description: '' });
//   const [newApi, setNewApi] = useState({
//     name: '',
//     description: '',
//     method: 'GET',
//     endpoint: '',
//     controllerCode: '',
//     testCases: [],
//     documentation: { summary: '', parameters: [] }
//   });
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [authToken, setAuthToken] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setAuthToken(token);
//     }
//   }, []);

//   useEffect(() => {
//     if (projectId && authToken) {
//       fetchFolders();
//     }
//   }, [projectId, authToken]);

//   const fetchFolders = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${BACKEND_URL}/api/v1/folders/project/${projectId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });
//       setFolders(res.data.data || []);
//     } catch (err) {
//       setError('Failed to fetch folders');
//       console.error('Error fetching folders:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createFolder = async () => {
//     if (!newFolder.name.trim()) {
//       setError('Folder name is required');
//       return;
//     }

//     setError('');
//     try {
//       const res = await axios.post(`${BACKEND_URL}/api/v1/folders/`, {
//         name: newFolder.name,
//         description: newFolder.description,
//         projectId,
//         userId
//       }, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev => [...prev, res.data.data]);
//       setNewFolder({ name: '', description: '' });
//       setShowCreateForm(false);
//     } catch (err) {
//       setError('Failed to create folder');
//       console.error('Error creating folder:', err);
//     }
//   };

//   const updateFolder = async (folderId, updatedData) => {
//     setError('');
//     try {
//       await axios.put(`${BACKEND_URL}/api/v1/folders/${folderId}`, updatedData, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev =>
//         prev.map(f => f._id === folderId ? { ...f, ...updatedData } : f)
//       );
      
//       if (selectedFolder && selectedFolder._id === folderId) {
//         setSelectedFolder({ ...selectedFolder, ...updatedData });
//       }
      
//       setEditingFolder(null);
//     } catch (err) {
//       setError('Failed to update folder');
//       console.error('Error updating folder:', err);
//     }
//   };

//   const deleteFolder = async (folderId) => {
//     const confirmed = window.confirm('Are you sure you want to delete this folder and its APIs?');
//     if (!confirmed) return;

//     setError('');
//     try {
//       await axios.delete(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev => prev.filter(f => f._id !== folderId));
      
//       if (selectedFolder && selectedFolder._id === folderId) {
//         handleBackToFolders();
//       }
//     } catch (err) {
//       setError('Failed to delete folder');
//       console.error('Error deleting folder:', err);
//     }
//   };

//   const fetchFolderDetails = async (folderId) => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });
//       setSelectedFolder(res.data.data);
//     } catch (err) {
//       setError('Failed to fetch folder details');
//       console.error('Error fetching folder details:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createApi = async () => {
//     if (!newApi.name.trim() || !newApi.endpoint.trim()) {
//       setError('API name and endpoint are required');
//       return;
//     }

//     setError('');
//     try {
//       const res = await axios.post(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api`, newApi, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev =>
//         prev.map(f => f._id === selectedFolder._id
//           ? { ...f, apis: [...(f.apis || []), res.data.data] }
//           : f
//         )
//       );
      
//       setSelectedFolder(prev => ({
//         ...prev,
//         apis: [...(prev.apis || []), res.data.data]
//       }));
      
//       setNewApi({
//         name: '',
//         description: '',
//         method: 'GET',
//         endpoint: '',
//         controllerCode: '',
//         testCases: [],
//         documentation: { summary: '', parameters: [] }
//       });
//       setShowCreateApiForm(false);
//     } catch (err) {
//       setError('Failed to create API');
//       console.error('Error creating API:', err);
//     }
//   };

//   const fetchApiDetails = async (folderId, apiId) => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${BACKEND_URL}/api/v1/folders/${folderId}/api/${apiId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });
//       console.log(res.data.data)
//       setSelectedApi(res.data.data);
//     } catch (err) {
//       setError('Failed to fetch API details');
//       console.error('Error fetching API details:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateApi = async (apiId, updatedData) => {
//     setError('');
//     try {
//       await axios.put(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api/${apiId}`, updatedData, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev =>
//         prev.map(f => f._id === selectedFolder._id
//           ? { ...f, apis: f.apis.map(api => api._id === apiId ? { ...api, ...updatedData } : api) }
//           : f
//         )
//       );
      
//       setSelectedFolder(prev => ({
//         ...prev,
//         apis: prev.apis.map(api => api._id === apiId ? { ...api, ...updatedData } : api)
//       }));
      
//       if (selectedApi && selectedApi._id === apiId) {
//         setSelectedApi({ ...selectedApi, ...updatedData });
//       }
      
//       setEditingApi(null);
//     } catch (err) {
//       setError('Failed to update API');
//       console.error('Error updating API:', err);
//     }
//   };

//   const deleteApi = async (apiId) => {
//     const confirmed = window.confirm('Are you sure you want to delete this API?');
//     if (!confirmed) return;

//     setError('');
//     try {
//       await axios.delete(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api/${apiId}`, {
//         headers: { Authorization: `Bearer ${authToken}` }
//       });

//       setFolders(prev =>
//         prev.map(f => f._id === selectedFolder._id
//           ? { ...f, apis: f.apis.filter(api => api._id !== apiId) }
//           : f
//         )
//       );
      
//       setSelectedFolder(prev => ({
//         ...prev,
//         apis: prev.apis.filter(api => api._id !== apiId)
//       }));
      
//       if (selectedApi && selectedApi._id === apiId) {
//         setCurrentView('apis');
//         setSelectedApi(null);
//       }
//     } catch (err) {
//       setError('Failed to delete API');
//       console.error('Error deleting API:', err);
//     }
//   };

//   const handleFolderClick = (folder) => {
//     setSelectedFolder(folder);
//     setCurrentView('apis');
//     if (!folder.apis || folder.apis.length === 0) {
//       fetchFolderDetails(folder._id);
//     }
//   };

//   const handleApiClick = (api) => {
//     setSelectedApi(api);
//     setCurrentView('api-detail');
//     fetchApiDetails(selectedFolder._id, api._id);
//   };

//   const handleBackToFolders = () => {
//     setCurrentView('folders');
//     setSelectedFolder(null);
//     setSelectedApi(null);
//   };

//   const handleBackToApis = () => {
//     setCurrentView('apis');
//     setSelectedApi(null);
//   };

//   const getMethodColor = (method) => {
//     switch (method) {
//       case 'GET': return 'bg-green-500/20 text-green-400 border-green-500/30';
//       case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
//       case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
//       case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
//       default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
//     }
//   };

//   const filteredFolders = folders.filter(folder =>
//     folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const filteredApis = selectedFolder && selectedFolder.apis ? selectedFolder.apis.filter(api =>
//     api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     api.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
//   ) : [];

//   if (loading && currentView === 'folders') {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center">
//         <div className="flex items-center space-x-3">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
//           <span className="text-gray-300 text-lg">Loading folders...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {/* Header */}
//       <div className="bg-gray-800 border-b border-gray-700">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               {currentView !== 'folders' && (
//                 <button
//                   onClick={currentView === 'api-detail' ? handleBackToApis : handleBackToFolders}
//                   className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
//                 >
//                   <ArrowLeft className="h-5 w-5" />
//                   <span>Back</span>
//                 </button>
//               )}
              
//               <div className="flex items-center space-x-2">
//                 <div className="bg-blue-500/20 p-2 rounded-lg">
//                   {currentView === 'folders' ? (
//                     <Folder className="h-6 w-6 text-blue-400" />
//                   ) : currentView === 'apis' ? (
//                     <FileCode className="h-6 w-6 text-blue-400" />
//                   ) : (
//                     <Code className="h-6 w-6 text-blue-400" />
//                   )}
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold">
//                     {currentView === 'folders' ? 'Folder Management' :
//                      currentView === 'apis' ? selectedFolder?.name :
//                      selectedApi?.name}
//                   </h1>
//                   <p className="text-gray-400 text-sm">
//                     {currentView === 'folders' ? 'Organize your APIs into folders' :
//                      currentView === 'apis' ? `${selectedFolder?.apis?.length || 0} APIs in this folder` :
//                      selectedApi?.description || 'API Details'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Search and Actions */}
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
//                 <input
//                   type="text"
//                   placeholder={`Search ${currentView}...`}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
//                 />
//               </div>
              
//               {currentView === 'folders' && (
//                 <button
//                   onClick={() => setShowCreateForm(true)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                 >
//                   <Plus className="h-4 w-4" />
//                   <span>New Folder</span>
//                 </button>
//               )}
              
//               {currentView === 'apis' && (
//                 <button
//                   onClick={() => setShowCreateApiForm(true)}
//                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                 >
//                   <Plus className="h-4 w-4" />
//                   <span>New API</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 mx-6 mt-6 rounded-lg flex items-center space-x-2">
//           <AlertCircle className="h-5 w-5 flex-shrink-0" />
//           <span>{error}</span>
//           <button
//             onClick={() => setError('')}
//             className="ml-auto text-red-400 hover:text-red-300"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-6">
//         {/* Folders View */}
//         {currentView === 'folders' && (
//           <>
//             {/* Create Folder Form */}
//             {showCreateForm && (
//               <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
//                 <h3 className="text-lg font-semibold mb-4 text-white">Create New Folder</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Folder Name *
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter folder name..."
//                       value={newFolder.name}
//                       onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
//                       className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Description
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter description..."
//                       value={newFolder.description}
//                       onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
//                       className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex space-x-3 mt-6">
//                   <button
//                     onClick={createFolder}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Create Folder
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowCreateForm(false);
//                       setNewFolder({ name: '', description: '' });
//                       setError('');
//                     }}
//                     className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Folders Grid */}
//             {filteredFolders.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
//                   <Folder className="h-12 w-12 text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-300 mb-2">No folders found</h3>
//                 <p className="text-gray-500 mb-6">Create your first folder to organize your APIs</p>
//                 <button
//                   onClick={() => setShowCreateForm(true)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
//                 >
//                   Create Folder
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredFolders.map(folder => (
//                   <FolderCard 
//                     key={folder._id} 
//                     folder={folder} 
//                     onEdit={setEditingFolder}
//                     onDelete={deleteFolder}
//                     onUpdate={updateFolder}
//                     onClick={handleFolderClick}
//                     isEditing={editingFolder === folder._id}
//                   />
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {/* APIs View */}
//         {currentView === 'apis' && (
//           <>
//             {/* Create API Form */}
//             {showCreateApiForm && (
//               <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
//                 <h3 className="text-lg font-semibold mb-4 text-white">Create New API</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       API Name *
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter API name..."
//                       value={newApi.name}
//                       onChange={(e) => setNewApi({ ...newApi, name: e.target.value })}
//                       className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Method
//                     </label>
//                     <select
//                       value={newApi.method}
//                       onChange={(e) => setNewApi({ ...newApi, method: e.target.value })}
//                       className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="GET">GET</option>
//                       <option value="POST">POST</option>
//                       <option value="PUT">PUT</option>
//                       <option value="DELETE">DELETE</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Endpoint *
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="/api/endpoint..."
//                       value={newApi.endpoint}
//                       onChange={(e) => setNewApi({ ...newApi, endpoint: e.target.value })}
//                       className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Description
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter description..."
//                       value={newApi.description}
//                       onChange={(e) => setNewApi({ ...newApi, description: e.target.value })}
//                       className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-300 mb-2">
//                     Controller Code
//                   </label>
//                   <textarea
//                     placeholder="Enter controller code..."
//                     value={newApi.controllerCode}
//                     onChange={(e) => setNewApi({ ...newApi, controllerCode: e.target.value })}
//                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                     rows="10"
//                   />
//                 </div>
//                 <div className="flex space-x-3">
//                   <button
//                     onClick={createApi}
//                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Create API
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowCreateApiForm(false);
//                       setNewApi({
//                         name: '',
//                         description: '',
//                         method: 'GET',
//                         endpoint: '',
//                         controllerCode: '',
//                         testCases: [],
//                         documentation: { summary: '', parameters: [] }
//                       });
//                       setError('');
//                     }}
//                     className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* APIs List */}
//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
//                 <span className="ml-3 text-gray-300">Loading APIs...</span>
//               </div>
//             ) : filteredApis.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
//                   <FileCode className="h-12 w-12 text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-300 mb-2">No APIs found</h3>
//                 <p className="text-gray-500 mb-6">Create your first API in this folder</p>
//                 <button
//                   onClick={() => setShowCreateApiForm(true)}
//                   className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
//                 >
//                   Create API
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 gap-4">
//                 {filteredApis.map(api => (
//                   <ApiCard
//                     key={api._id}
//                     api={api}
//                     onEdit={setEditingApi}
//                     onDelete={deleteApi}
//                     onUpdate={updateApi}
//                     onClick={handleApiClick}
//                     isEditing={editingApi === api._id}
//                     getMethodColor={getMethodColor}
//                   />
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {/* API Detail View */}
//         {currentView === 'api-detail' && selectedApi && (
//           <ApiDetailView
//             api={selectedApi}
//             onUpdate={updateApi}
//             getMethodColor={getMethodColor}
//             loading={loading}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// const FolderCard = ({ folder, onEdit, onDelete, onUpdate, onClick, isEditing }) => {
//   const [editData, setEditData] = useState({ 
//     name: folder.name, 
//     description: folder.description || '' 
//   });

//   return (
//     <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer group">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center space-x-3 flex-1" onClick={() => onClick(folder)}>
//           <div className="bg-blue-500/20 p-2 rounded-lg">
//             <Folder className="h-6 w-6 text-blue-400" />
//           </div>
//           {isEditing ? (
//             <input
//               type="text"
//               value={editData.name}
//               onChange={(e) => setEditData({ ...editData, name: e.target.value })}
//               className="text-lg font-semibold bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 flex-1"
//               onClick={(e) => e.stopPropagation()}
//             />
//           ) : (
//             <div>
//               <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
//                 {folder.name}
//               </h3>
//               <p className="text-gray-400 text-sm">
//                 {folder.apis?.length || 0} APIs
//               </p>
//             </div>
//           )}
//         </div>
        
//         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           {isEditing ? (
//             <>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onUpdate(folder._id, editData);
//                 }}
//                 className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
//               >
//                 <Save className="h-4 w-4 text-green-400" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setEditData({ name: folder.name, description: folder.description || '' });
//                   onEdit(null);
//                 }}
//                 className="p-2 hover:bg-gray-500/20 rounded-lg transition-colors"
//               >
//                 <X className="h-4 w-4 text-gray-400" />
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onEdit(folder._id);
//                 }}
//                 className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
//               >
//                 <Edit2 className="h-4 w-4 text-blue-400" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete(folder._id);
//                 }}
//                 className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
//               >
//                 <Trash2 className="h-4 w-4 text-red-400" />
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {isEditing ? (
//         <textarea
//           value={editData.description}
//           onChange={(e) => setEditData({ ...editData, description: e.target.value })}
//           placeholder="Enter folder description..."
//           className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm resize-none"
//           rows="3"
//           onClick={(e) => e.stopPropagation()}
//         />
//       ) : (
//         <div onClick={() => onClick(folder)}>
//           <p className="text-gray-400 text-sm mb-3">
//             {folder.description || 'No description provided'}
//           </p>
          
//           <div className="flex items-center justify-between text-xs text-gray-500">
//             <span>
//               Created: {new Date(folder.createdAt).toLocaleDateString()}
//             </span>
//             <div className="flex items-center space-x-1">
//               <ChevronRight className="h-4 w-4" />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ApiCard = ({ api, onEdit, onDelete, onUpdate, onClick, isEditing, getMethodColor }) => {
//   const [editData, setEditData] = useState({
//     name: api.name,
//     description: api.description || '',
//     method: api.method,
//     endpoint: api.endpoint,
//     controllerCode: api.controllerCode || ''
//   });

//   return (
//     <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer group">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center space-x-3 flex-1" onClick={() => onClick(api)}>
//           <div className="bg-green-500/20 p-2 rounded-lg">
//             <FileCode className="h-6 w-6 text-green-400" />
//           </div>
          
//           <div className="flex-1">
//             {isEditing ? (
//               <div className="space-y-2">
//                 <input
//                   type="text"
//                   value={editData.name}
//                   onChange={(e) => setEditData({ ...editData, name: e.target.value })}
//                   className="text-lg font-semibold bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 w-full"
//                   onClick={(e) => e.stopPropagation()}
//                   placeholder="API Name"
//                 />
//                 <div className="flex space-x-2">
//                   <select
//                     value={editData.method}
//                     onChange={(e) => setEditData({ ...editData, method: e.target.value })}
//                     className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <option value="GET">GET</option>
//                     <option value="POST">POST</option>
//                     <option value="PUT">PUT</option>
//                     <option value="DELETE">DELETE</option>
//                   </select>
//                   <input
//                     type="text"
//                     value={editData.endpoint}
//                     onChange={(e) => setEditData({ ...editData, endpoint: e.target.value })}
//                     className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm flex-1"
//                     onClick={(e) => e.stopPropagation()}
//                     placeholder="Endpoint"
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors mb-2">
//                   {api.name}
//                 </h3>
//                 <div className="flex items-center space-x-3 mb-2">
//                   <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getMethodColor(api.method)}`}>
//                     {api.method}
//                   </span>
//                   <code className="text-gray-300 text-sm bg-gray-700/50 px-2 py-1 rounded">
//                     {api.endpoint}
//                   </code>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           {isEditing ? (
//             <>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onUpdate(api._id, editData);
//                 }}
//                 className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
//               >
//                 <Save className="h-4 w-4 text-green-400" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setEditData({
//                     name: api.name,
//                     description: api.description || '',
//                     method: api.method,
//                     endpoint: api.endpoint,
//                     controllerCode: api.controllerCode || ''
//                   });
//                   onEdit(null);
//                 }}
//                 className="p-2 hover:bg-gray-500/20 rounded-lg transition-colors"
//               >
//                 <X className="h-4 w-4 text-gray-400" />
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onEdit(api._id);
//                 }}
//                 className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
//               >
//                 <Edit2 className="h-4 w-4 text-blue-400" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete(api._id);
//                 }}
//                 className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
//               >
//                 <Trash2 className="h-4 w-4 text-red-400" />
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {isEditing ? (
//         <div className="space-y-3">
//           <textarea
//             value={editData.description}
//             onChange={(e) => setEditData({ ...editData, description: e.target.value })}
//             placeholder="Enter API description..."
//             className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm resize-none"
//             rows="2"
//             onClick={(e) => e.stopPropagation()}
//           />
//           <textarea
//             value={editData.controllerCode}
//             onChange={(e) => setEditData({ ...editData, controllerCode: e.target.value })}
//             placeholder="Enter controller code..."
//             className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm font-mono resize-none"
//             rows="6"
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       ) : (
//         <div onClick={() => onClick(api)}>
//           <p className="text-gray-400 text-sm mb-3">
//             {api.description || 'No description provided'}
//           </p>
          
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4 text-xs text-gray-500">
//               <span>
//                 Created: {new Date(api.createdAt).toLocaleDateString()}
//               </span>
//               {api.testCases && api.testCases.length > 0 && (
//                 <span className="flex items-center space-x-1">
//                   <Play className="h-3 w-3" />
//                   <span>{api.testCases.length} tests</span>
//                 </span>
//               )}
//             </div>
//             <div className="flex items-center space-x-1 text-gray-500">
//               <Eye className="h-4 w-4" />
//               <ChevronRight className="h-4 w-4" />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ApiDetailView = ({ api, onUpdate, getMethodColor, loading }) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({
//     name: api?.name || '',
//     description: api?.description || '',
//     method: api?.method || 'GET',
//     endpoint: api?.endpoint || '',
//     controllerCode: api?.controllerCode || '',
//     documentation: api?.documentation || { summary: '', parameters: [] }
//   });

//   useEffect(() => {
//     if (api) {
//       setEditData({
//         name: api.name || '',
//         description: api.description || '',
//         method: api.method || 'GET',
//         endpoint: api.endpoint || '',
//         controllerCode: api.controllerCode || '',
//         documentation: api.documentation || { summary: '', parameters: [] }
//       });
//     }
//   }, [api]);

//   const handleSave = () => {
//     onUpdate(api._id, editData);
//     setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setEditData({
//       name: api.name || '',
//       description: api.description || '',
//       method: api.method || 'GET',
//       endpoint: api.endpoint || '',
//       controllerCode: api.controllerCode || '',
//       documentation: api.documentation || { summary: '', parameters: [] }
//     });
//     setIsEditing(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
//         <span className="ml-3 text-gray-300">Loading API details...</span>
//       </div>
//     );
//   }

//   if (!api) {
//     return (
//       <div className="text-center py-12">
//         <div className="bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
//           <AlertCircle className="h-12 w-12 text-gray-400" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-300 mb-2">API not found</h3>
//         <p className="text-gray-500">The requested API could not be loaded</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* API Header */}
//       <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center space-x-4 flex-1">
//             <div className="bg-green-500/20 p-3 rounded-lg">
//               <Code className="h-8 w-8 text-green-400" />
//             </div>
            
//             <div className="flex-1">
//               {isEditing ? (
//                 <div className="space-y-3">
//                   <input
//                     type="text"
//                     value={editData.name}
//                     onChange={(e) => setEditData({ ...editData, name: e.target.value })}
//                     className="text-2xl font-bold bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
//                     placeholder="API Name"
//                   />
//                   <div className="flex space-x-3">
//                     <select
//                       value={editData.method}
//                       onChange={(e) => setEditData({ ...editData, method: e.target.value })}
//                       className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2"
//                     >
//                       <option value="GET">GET</option>
//                       <option value="POST">POST</option>
//                       <option value="PUT">PUT</option>
//                       <option value="DELETE">DELETE</option>
//                     </select>
//                     <input
//                       type="text"
//                       value={editData.endpoint}
//                       onChange={(e) => setEditData({ ...editData, endpoint: e.target.value })}
//                       className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 flex-1 font-mono"
//                       placeholder="Endpoint"
//                     />
//                   </div>
//                   <textarea
//                     value={editData.description}
//                     onChange={(e) => setEditData({ ...editData, description: e.target.value })}
//                     className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 resize-none"
//                     rows="2"
//                     placeholder="API Description"
//                   />
//                 </div>
//               ) : (
//                 <div>
//                   <h1 className="text-2xl font-bold text-white mb-2">{api.name}</h1>
//                   <div className="flex items-center space-x-3 mb-2">
//                     <span className={`px-3 py-1 rounded-md text-sm font-medium border ${getMethodColor(api.method)}`}>
//                       {api.method}
//                     </span>
//                     <code className="text-gray-300 bg-gray-700/50 px-3 py-1 rounded font-mono">
//                       {api.endpoint}
//                     </code>
//                   </div>
//                   <p className="text-gray-400">
//                     {api.description || 'No description provided'}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <div className="flex space-x-2">
//             {isEditing ? (
//               <>
//                 <button
//                   onClick={handleSave}
//                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                 >
//                   <Save className="h-4 w-4" />
//                   <span>Save</span>
//                 </button>
//                 <button
//                   onClick={handleCancel}
//                   className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                 >
//                   <X className="h-4 w-4" />
//                   <span>Cancel</span>
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//               >
//                 <Edit2 className="h-4 w-4" />
//                 <span>Edit</span>
//               </button>
//             )}
//           </div>
//         </div>
        
//         {/* API Metadata */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
//           <div className="text-center">
//             <div className="text-2xl font-bold text-white">{api.testCases?.length || 0}</div>
//             <div className="text-sm text-gray-400">Test Cases</div>
//           </div>
//           <div className="text-center">
//             <div className="text-2xl font-bold text-white">
//               {api.createdAt ? new Date(api.createdAt).toLocaleDateString() : 'N/A'}
//             </div>
//             <div className="text-sm text-gray-400">Created</div>
//           </div>
//           <div className="text-center">
//             <div className="text-2xl font-bold text-white">
//               {api.updatedAt ? new Date(api.updatedAt).toLocaleDateString() : 'N/A'}
//             </div>
//             <div className="text-sm text-gray-400">Last Updated</div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-gray-800 border border-gray-700 rounded-lg">
//         <div className="border-b border-gray-700">
//           <nav className="flex space-x-8 px-6">
//             {[
//               { id: 'overview', label: 'Overview', icon: Eye },
//               { id: 'code', label: 'Controller Code', icon: Code },
//               { id: 'documentation', label: 'Documentation', icon: BookOpen },
//               { id: 'testing', label: 'Testing', icon: Play }
//             ].map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
//                   activeTab === tab.id
//                     ? 'border-blue-500 text-blue-400'
//                     : 'border-transparent text-gray-400 hover:text-gray-300'
//                 }`}
//               >
//                 <tab.icon className="h-4 w-4" />
//                 <span>{tab.label}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-white mb-3">API Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="bg-gray-700/50 p-4 rounded-lg">
//                     <label className="block text-sm font-medium text-gray-300 mb-1">Method</label>
//                     <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${getMethodColor(api.method)}`}>
//                       {api.method}
//                     </span>
//                   </div>
//                   <div className="bg-gray-700/50 p-4 rounded-lg">
//                     <label className="block text-sm font-medium text-gray-300 mb-1">Endpoint</label>
//                     <code className="text-gray-300 font-mono text-sm">{api.endpoint}</code>
//                   </div>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
//                 <div className="bg-gray-700/50 p-4 rounded-lg">
//                   <p className="text-gray-300">{api.description || 'No description provided'}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Controller Code Tab */}
//           {activeTab === 'code' && (
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-white">Controller Code</h3>
//                 <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
//                   Copy Code
//                 </button>
//               </div>
              
//               {isEditing ? (
//                 <textarea
//                   value={editData.controllerCode}
//                   onChange={(e) => setEditData({ ...editData, controllerCode: e.target.value })}
//                   className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-lg px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   rows="20"
//                   placeholder="Enter controller code..."
//                 />
//               ) : (
//                 <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
//                   <code>{api.controllerCode || '// No controller code provided'}</code>
//                 </pre>
//               )}
//             </div>
//           )}

//           {/* Documentation Tab */}
//           {activeTab === 'documentation' && (
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-white mb-3">API Documentation</h3>
//                 <div className="bg-gray-700/50 p-4 rounded-lg">
//                   <p className="text-gray-300">
//                     {api.documentation?.summary || 'No documentation summary provided'}
//                   </p>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-lg font-semibold text-white mb-3">Parameters</h3>
//                 {api.documentation?.parameters && api.documentation.parameters.length > 0 ? (
//                   <div className="space-y-2">
//                     {api.documentation.parameters.map((param, index) => (
//                       <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
//                         <div className="flex items-center space-x-2">
//                           <code className="text-blue-400 font-mono">{param.name}</code>
//                           <span className="text-gray-400">({param.type})</span>
//                           {param.required && (
//                             <span className="text-red-400 text-xs">Required</span>
//                           )}
//                         </div>
//                         <p className="text-gray-300 text-sm mt-1">{param.description}</p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="bg-gray-700/50 p-4 rounded-lg text-center">
//                     <p className="text-gray-400">No parameters documented</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Testing Tab */}
//           {activeTab === 'testing' && (
//             <div className="space-y-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold text-white">Test Cases</h3>
//                 <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
//                   <Plus className="h-4 w-4" />
//                   <span>Add Test</span>
//                 </button>
//               </div>
              
//               {api.testCases && api.testCases.length > 0 ? (
//                 <div className="space-y-4">
//                   {api.testCases.map((testCase, index) => (
//                     <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
//                       <div className="flex items-center justify-between mb-2">
//                         <h4 className="font-medium text-white">{testCase.name || `Test Case ${index + 1}`}</h4>
//                         <div className="flex space-x-2">
//                           <button className="text-green-400 hover:text-green-300">
//                             <Play className="h-4 w-4" />
//                           </button>
//                           <button className="text-red-400 hover:text-red-300">
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                       <p className="text-gray-300 text-sm">{testCase.description}</p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="bg-gray-700/50 p-8 rounded-lg text-center">
//                   <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h4 className="text-lg font-medium text-gray-300 mb-2">No test cases</h4>
//                   <p className="text-gray-400 mb-4">Create test cases to validate your API</p>
//                   <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
//                     Create First Test
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default FolderManagement;
"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  FileCode,
  AlertCircle,
  ArrowLeft,
  Eye,
  Code,
  BookOpen,
  ChevronRight,
  Search,
  Copy,
  Sparkles,
  Check,
  Play,
  Zap,
  Terminal,
  Database,
  Globe,
  Activity,
} from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../config"

const FolderManagement = ({ projectId = "684e85c2e4057008b9532c30", userId = "684d4af18371719a6892c8ed" }) => {
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [currentView, setCurrentView] = useState("folders") // 'folders', 'apis', 'api-detail'
  const [selectedApi, setSelectedApi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingFolder, setEditingFolder] = useState(null)
  const [editingApi, setEditingApi] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // AI Generation states
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showAIUpdateGenerator, setShowAIUpdateGenerator] = useState(false)
  const [aiPrompt, setAiPrompt] = useState({ name: "", description: "" })
  const [aiUpdatePrompt, setAiUpdatePrompt] = useState({ name: "", description: "" })
  const [generatedAPI, setGeneratedAPI] = useState(null)
  const [generatedUpdateAPI, setGeneratedUpdateAPI] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingUpdate, setIsGeneratingUpdate] = useState(false)
  const [showAIPreview, setShowAIPreview] = useState(false)
  const [showAIUpdatePreview, setShowAIUpdatePreview] = useState(false)

  // Common Prompt states
  const [showCommonPromptModal, setShowCommonPromptModal] = useState(false)
  const [commonPrompt, setCommonPrompt] = useState("")
  const [isUpdatingCommonPrompt, setIsUpdatingCommonPrompt] = useState(false)
  const [commonPromptError, setCommonPromptError] = useState("")

  const [newFolder, setNewFolder] = useState({ name: "", description: "" })
  const [error, setError] = useState("")
  const [aiError, setAiError] = useState("")
  const [aiUpdateError, setAiUpdateError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [authToken, setAuthToken] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setAuthToken(token)
    }
  }, [])

  useEffect(() => {
    if (projectId && authToken) {
      fetchFolders()
    }
  }, [projectId, authToken])

  const fetchFolders = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/folders/project/${projectId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setFolders(res.data.data || [])
    } catch (err) {
      setError("Failed to fetch folders")
      console.error("Error fetching folders:", err)
    } finally {
      setLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolder.name.trim()) {
      setError("Folder name is required")
      return
    }

    setError("")
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/folders/`,
        {
          name: newFolder.name,
          description: newFolder.description,
          projectId,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      setFolders((prev) => [...prev, res.data.data])
      setNewFolder({ name: "", description: "" })
      setShowCreateForm(false)
    } catch (err) {
      setError("Failed to create folder")
      console.error("Error creating folder:", err)
    }
  }

  const updateFolder = async (folderId, updatedData) => {
    setError("")
    try {
      await axios.put(`${BACKEND_URL}/api/v1/folders/${folderId}`, updatedData, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) => prev.map((f) => (f._id === folderId ? { ...f, ...updatedData } : f)))

      if (selectedFolder && selectedFolder._id === folderId) {
        setSelectedFolder({ ...selectedFolder, ...updatedData })
      }

      setEditingFolder(null)
    } catch (err) {
      setError("Failed to update folder")
      console.error("Error updating folder:", err)
    }
  }

  const deleteFolder = async (folderId) => {
    const confirmed = window.confirm("Are you sure you want to delete this folder and its APIs?")
    if (!confirmed) return

    setError("")
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) => prev.filter((f) => f._id !== folderId))

      if (selectedFolder && selectedFolder._id === folderId) {
        handleBackToFolders()
      }
    } catch (err) {
      setError("Failed to delete folder")
      console.error("Error deleting folder:", err)
    }
  }

  const fetchFolderDetails = async (folderId) => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setSelectedFolder(res.data.data)
    } catch (err) {
      setError("Failed to fetch folder details")
      console.error("Error fetching folder details:", err)
    } finally {
      setLoading(false)
    }
  }

  // AI Generation functions for creating APIs
  const handleGenerateAPI = async () => {
    if (!aiPrompt.name.trim()) {
      setAiError("Please provide a name for the API")
      return
    }

    setIsGenerating(true)
    setAiError("")

    try {
      const prompt = `Create an API with name: "${aiPrompt.name}"${aiPrompt.description.trim() ? ` and description: "${aiPrompt.description}"` : ""}`

      const response = await axios.post(
        `${BACKEND_URL}/api/ai/generate-api`,
        {
          prompt: prompt,
          projectId,
          folderId: selectedFolder._id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )
      console.log(response.data)
      if (response.data.success) {
        setGeneratedAPI(response.data.api)
        setShowAIGenerator(false)
        setShowAIPreview(true)
      } else {
        setAiError("Failed to generate API")
      }
    } catch (error) {
      console.error("AI Generation Error:", error)
      setAiError(error.response?.data?.error || "Failed to generate API")
    } finally {
      setIsGenerating(false)
    }
  }

  // AI Generation functions for updating APIs
  const handleGenerateUpdateAPI = async () => {
    if (!aiUpdatePrompt.description.trim()) {
      setAiUpdateError("Please provide a description for the update")
      return
    }

    setIsGeneratingUpdate(true)
    setAiUpdateError("")

    try {
      const prompt = `Update the existing API "${selectedApi.name}" with new requirements: ${aiUpdatePrompt.name.trim() ? `name: "${aiUpdatePrompt.name}" and ` : ""}description: "${aiUpdatePrompt.description}". Current API details: ${JSON.stringify(
        {
          name: selectedApi.name,
          method: selectedApi.method,
          endpoint: selectedApi.endpoint,
          description: selectedApi.description,
        },
      )}`

      const response = await axios.post(
        `${BACKEND_URL}/api/ai/generate-api`,
        {
          prompt: prompt,
          projectId,
          folderId: selectedFolder._id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      if (response.data.success) {
        setGeneratedUpdateAPI(response.data.api)
        setShowAIUpdateGenerator(false)
        setShowAIUpdatePreview(true)
      } else {
        setAiUpdateError("Failed to generate API update")
      }
    } catch (error) {
      console.error("AI Update Generation Error:", error)
      setAiUpdateError(error.response?.data?.error || "Failed to generate API update")
    } finally {
      setIsGeneratingUpdate(false)
    }
  }

  const handleApplyGeneratedAPI = async () => {
    if (!generatedAPI) return

    setError("")
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api`, generatedAPI, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      // Update folders state
      setFolders((prev) =>
        prev.map((f) => (f._id === selectedFolder._id ? { ...f, apis: [...(f.apis || []), res.data.data] } : f)),
      )

      // Update selected folder
      setSelectedFolder((prev) => ({
        ...prev,
        apis: [...(prev.apis || []), res.data.data],
      }))

      // Reset states
      setGeneratedAPI(null)
      setShowAIPreview(false)
      setAiPrompt({ name: "", description: "" })
      setAiError("")
    } catch (err) {
      setError("Failed to create API")
      console.error("Error creating API:", err)
    }
  }

  const handleApplyGeneratedUpdateAPI = async () => {
    if (!generatedUpdateAPI || !selectedApi) return

    setError("")
    try {
      await updateApi(selectedApi._id, generatedUpdateAPI)

      // Reset states
      setGeneratedUpdateAPI(null)
      setShowAIUpdatePreview(false)
      setAiUpdatePrompt({ name: "", description: "" })
      setAiUpdateError("")
    } catch (err) {
      setError("Failed to update API")
      console.error("Error updating API:", err)
    }
  }

  const handleDiscardGeneratedAPI = () => {
    setGeneratedAPI(null)
    setShowAIPreview(false)
    setAiPrompt({ name: "", description: "" })
    setAiError("")
  }

  const handleDiscardGeneratedUpdateAPI = () => {
    setGeneratedUpdateAPI(null)
    setShowAIUpdatePreview(false)
    setAiUpdatePrompt({ name: "", description: "" })
    setAiUpdateError("")
  }

  const fetchApiDetails = async (folderId, apiId) => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/folders/${folderId}/api/${apiId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setSelectedApi(res.data.data)
    } catch (err) {
      setError("Failed to fetch API details")
      console.error("Error fetching API details:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateApi = async (apiId, updatedData) => {
    setError("")
    try {
      await axios.put(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api/${apiId}`, updatedData, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) =>
        prev.map((f) =>
          f._id === selectedFolder._id
            ? { ...f, apis: f.apis.map((api) => (api._id === apiId ? { ...api, ...updatedData } : api)) }
            : f,
        ),
      )

      setSelectedFolder((prev) => ({
        ...prev,
        apis: prev.apis.map((api) => (api._id === apiId ? { ...api, ...updatedData } : api)),
      }))

      if (selectedApi && selectedApi._id === apiId) {
        setSelectedApi({ ...selectedApi, ...updatedData })
      }

      setEditingApi(null)
    } catch (err) {
      setError("Failed to update API")
      console.error("Error updating API:", err)
    }
  }

  const deleteApi = async (apiId) => {
    const confirmed = window.confirm("Are you sure you want to delete this API?")
    if (!confirmed) return

    setError("")
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api/${apiId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) =>
        prev.map((f) => (f._id === selectedFolder._id ? { ...f, apis: f.apis.filter((api) => api._id !== apiId) } : f)),
      )

      setSelectedFolder((prev) => ({
        ...prev,
        apis: prev.apis.filter((api) => api._id !== apiId),
      }))

      if (selectedApi && selectedApi._id === apiId) {
        setCurrentView("apis")
        setSelectedApi(null)
      }
    } catch (err) {
      setError("Failed to delete API")
      console.error("Error deleting API:", err)
    }
  }

  const handleUpdateCommonPrompt = async () => {
    if (!commonPrompt.trim()) {
      setCommonPromptError("Please enter a common prompt")
      return
    }

    setIsUpdatingCommonPrompt(true)
    setCommonPromptError("")

    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/folders/${selectedFolder._id}`,
        {
          commonPrompt: commonPrompt,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      // Update the selected folder with the new common prompt
      setSelectedFolder((prev) => ({
        ...prev,
        commonPrompt: commonPrompt,
      }))

      // Update folders state
      setFolders((prev) => prev.map((f) => (f._id === selectedFolder._id ? { ...f, commonPrompt: commonPrompt } : f)))

      setShowCommonPromptModal(false)
      setCommonPrompt("")
    } catch (err) {
      setCommonPromptError("Failed to update common prompt")
      console.error("Error updating common prompt:", err)
    } finally {
      setIsUpdatingCommonPrompt(false)
    }
  }

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder)
    setCurrentView("apis")
    if (!folder.apis || folder.apis.length === 0) {
      fetchFolderDetails(folder._id)
    }
  }

  const handleApiClick = (api) => {
    setSelectedApi(api)
    setCurrentView("api-detail")
    fetchApiDetails(selectedFolder._id, api._id)
  }

  const handleBackToFolders = () => {
    setCurrentView("folders")
    setSelectedFolder(null)
    setSelectedApi(null)
  }

  const handleBackToApis = () => {
    setCurrentView("apis")
    setSelectedApi(null)
  }

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-400 border-green-500/40 shadow-green-500/20"
      case "POST":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-blue-500/20"
      case "PUT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-orange-500/20"
      case "PATCH":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-yellow-500/20"
      case "DELETE":
        return "bg-red-500/20 text-red-400 border-red-500/40 shadow-red-500/20"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/40 shadow-slate-500/20"
    }
  }

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredApis =
    selectedFolder && selectedFolder.apis
      ? selectedFolder.apis.filter(
          (api) =>
            api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (api.description && api.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            api.endpoint.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : []

  if (loading && currentView === "folders") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-cyan-300 rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-1">Loading Workspace</h3>
            <p className="text-slate-400 text-sm">Initializing your API management system...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Futuristic Header */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentView !== "folders" && (
                <button
                  onClick={currentView === "api-detail" ? handleBackToApis : handleBackToFolders}
                  className="group flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-slate-400 group-hover:text-white transition-colors text-sm">Back</span>
                </button>
              )}

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 to-purple-900 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-3 rounded-xl border border-slate-700/50">
                    {currentView === "folders" ? (
                      <Database className="h-6 w-6 text-cyan-400" />
                    ) : currentView === "apis" ? (
                      <Globe className="h-6 w-6 text-purple-400" />
                    ) : (
                      <Terminal className="h-6 w-6 text-emerald-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    {currentView === "folders"
                      ? "API Workspace"
                      : currentView === "apis"
                        ? selectedFolder?.name
                        : selectedApi?.name}
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {currentView === "folders"
                      ? "Manage your API collections with AI-powered tools"
                      : currentView === "apis"
                        ? `${selectedFolder?.apis?.length || 0} APIs • AI-Enhanced Development`
                        : "Advanced API Configuration & Testing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Actions */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 z-10" />
                  <input
                    type="text"
                    placeholder={`Search ${currentView}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/50 backdrop-blur-sm text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-64 transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              {currentView === "folders" && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25 text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Folder</span>
                  </div>
                </button>
              )}

              {currentView === "apis" && (
                <>
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Generate</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setCommonPrompt(selectedFolder?.commonPrompt || "")
                      setShowCommonPromptModal(true)
                    }}
                    className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCode className="h-4 w-4" />
                      <span>Common Prompt</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error Message */}
      {error && (
        <div className="mx-6 mt-4">
          <div className="relative bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-300 font-medium text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Folders View */}
        {currentView === "folders" && (
          <>
            {/* Enhanced Create Folder Form */}
            {showCreateForm && (
              <div className="mb-6">
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
                  <div className="relative">
                    <h3 className="text-lg font-bold text-white mb-4">Create New Folder</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Folder Name *</label>
                        <input
                          type="text"
                          placeholder="Enter folder name..."
                          value={newFolder.name}
                          onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                          className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Description</label>
                        <input
                          type="text"
                          placeholder="Enter description..."
                          value={newFolder.description}
                          onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                          className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={createFolder}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25 text-sm"
                      >
                        Create Folder
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewFolder({ name: "", description: "" })
                          setError("")
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Folders Grid */}
            {filteredFolders.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-20"></div>
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
                    <Database className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No folders found</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Create your first folder to organize your APIs and start building with AI assistance
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                >
                  Create Your First Folder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFolders.map((folder) => (
                  <ModernFolderCard
                    key={folder._id}
                    folder={folder}
                    onEdit={setEditingFolder}
                    onDelete={deleteFolder}
                    onUpdate={updateFolder}
                    onClick={handleFolderClick}
                    isEditing={editingFolder === folder._id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* APIs View */}
        {currentView === "apis" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-purple-300 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <p className="text-slate-400 text-sm">Loading APIs...</p>
                </div>
              </div>
            ) : filteredApis.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-20"></div>
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
                    <Globe className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No APIs found</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Generate your first API using our advanced AI system
                </p>
                <button
                  onClick={() => setShowAIGenerator(true)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Generate with AI</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApis.map((api) => (
                  <ModernApiCard
                    key={api._id}
                    api={api}
                    onEdit={setEditingApi}
                    onDelete={deleteApi}
                    onUpdate={updateApi}
                    onClick={handleApiClick}
                    isEditing={editingApi === api._id}
                    getMethodColor={getMethodColor}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* API Detail View */}
        {currentView === "api-detail" && selectedApi && (
          <ModernApiDetailView
            api={selectedApi}
            onUpdate={updateApi}
            getMethodColor={getMethodColor}
            loading={loading}
            onAIUpdate={() => setShowAIUpdateGenerator(true)}
          />
        )}
      </div>

      {/* Modern AI Generator Modal for Creating APIs */}
      {showAIGenerator && (
        <ModernModal
          title="AI API Generator"
          subtitle="Describe your API and let AI create it for you"
          onClose={() => {
            setShowAIGenerator(false)
            setAiPrompt({ name: "", description: "" })
            setAiError("")
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">API Name *</label>
              <input
                type="text"
                value={aiPrompt.name}
                onChange={(e) => setAiPrompt({ ...aiPrompt, name: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm"
                placeholder="e.g., User Authentication System"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Description (Optional)</label>
              <textarea
                value={aiPrompt.description}
                onChange={(e) => setAiPrompt({ ...aiPrompt, description: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm"
                rows="3"
                placeholder="Describe what this API should do, its functionality, and any specific requirements..."
              />
            </div>

            {aiError && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm">{aiError}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleGenerateAPI}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-purple-800 disabled:to-purple-700 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-sm"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Generate API</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAIGenerator(false)
                  setAiPrompt({ name: "", description: "" })
                  setAiError("")
                }}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModernModal>
      )}

      {/* Modern AI Generator Modal for Updating APIs */}
      {showAIUpdateGenerator && (
        <ModernModal
          title="AI API Updater"
          subtitle="Enhance your existing API with AI-powered improvements"
          onClose={() => {
            setShowAIUpdateGenerator(false)
            setAiUpdatePrompt({ name: "", description: "" })
            setAiUpdateError("")
          }}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
              <p className="text-cyan-300 text-sm">
                <strong>Current API:</strong> {selectedApi?.name}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">New API Name (Optional)</label>
              <input
                type="text"
                value={aiUpdatePrompt.name}
                onChange={(e) => setAiUpdatePrompt({ ...aiUpdatePrompt, name: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm"
                placeholder="e.g., Enhanced User Authentication with 2FA"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Update Description *</label>
              <textarea
                value={aiUpdatePrompt.description}
                onChange={(e) => setAiUpdatePrompt({ ...aiUpdatePrompt, description: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm"
                rows="3"
                placeholder="Describe what changes or improvements you want to make to this API..."
              />
            </div>

            {aiUpdateError && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm">{aiUpdateError}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleGenerateUpdateAPI}
                disabled={isGeneratingUpdate}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-orange-800 disabled:to-orange-700 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 text-sm"
              >
                {isGeneratingUpdate ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Update with AI</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAIUpdateGenerator(false)
                  setAiUpdatePrompt({ name: "", description: "" })
                  setAiUpdateError("")
                }}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModernModal>
      )}

      {/* Common Prompt Modal */}
      {showCommonPromptModal && (
        <ModernModal
          title="Common Prompt"
          subtitle="Set a common prompt for all APIs in this folder"
          onClose={() => {
            setShowCommonPromptModal(false)
            setCommonPrompt("")
            setCommonPromptError("")
          }}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
              <p className="text-indigo-300 text-sm">
                <strong>Folder:</strong> {selectedFolder?.name}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Common Prompt *</label>
              <textarea
                value={commonPrompt}
                onChange={(e) => setCommonPrompt(e.target.value)}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-sm"
                rows="4"
                placeholder="Enter a common prompt that will be applied to all APIs in this folder..."
              />
            </div>

            {commonPromptError && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm">{commonPromptError}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleUpdateCommonPrompt}
                disabled={isUpdatingCommonPrompt}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-indigo-800 disabled:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25 text-sm"
              >
                {isUpdatingCommonPrompt ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FileCode className="h-4 w-4" />
                    <span>Update Prompt</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCommonPromptModal(false)
                  setCommonPrompt("")
                  setCommonPromptError("")
                }}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </ModernModal>
      )}

      {/* AI Preview Modals */}
      {showAIPreview && generatedAPI && (
        <ModernAIPreviewModal
          title="AI Generated API Preview"
          generatedAPI={generatedAPI}
          onApply={handleApplyGeneratedAPI}
          onDiscard={handleDiscardGeneratedAPI}
          getMethodColor={getMethodColor}
        />
      )}

      {showAIUpdatePreview && generatedUpdateAPI && (
        <ModernAIPreviewModal
          title="AI Updated API Preview"
          generatedAPI={generatedUpdateAPI}
          onApply={handleApplyGeneratedUpdateAPI}
          onDiscard={handleDiscardGeneratedUpdateAPI}
          getMethodColor={getMethodColor}
          isUpdate={true}
        />
      )}
    </div>
  )
}

// Modern Modal Component
const ModernModal = ({ title, subtitle, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

// Modern AI Preview Modal Component
const ModernAIPreviewModal = ({ title, generatedAPI, onApply, onDiscard, getMethodColor, isUpdate = false }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-slate-400 text-sm mt-1">Review and approve the AI-generated API</p>
            </div>
            <button
              onClick={onDiscard}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className={`${isUpdate ? "bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20" : "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-cyan-500/20"} border rounded-lg p-3 mb-6`}
          >
            <p className={`${isUpdate ? "text-orange-300" : "text-cyan-300"} text-sm`}>
              <strong>Preview:</strong> Review the {isUpdate ? "updated" : "generated"} API below. Click "Apply" to{" "}
              {isUpdate ? "update" : "create"} this API, or "Discard" to cancel.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <p className="text-white font-semibold">{generatedAPI.name}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-2">Method & Endpoint</label>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-semibold border shadow-lg ${getMethodColor(generatedAPI.method)}`}
                  >
                    {generatedAPI.method}
                  </span>
                  <code className="text-slate-300 font-mono text-sm bg-slate-800/50 px-2 py-1 rounded">
                    {generatedAPI.endpoint}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <p className="text-slate-300 leading-relaxed text-sm">{generatedAPI.description}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-3">Controller Code</label>
              <div className="bg-slate-900 rounded-lg border border-slate-700/50 overflow-hidden">
                <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">controller.js</span>
                </div>
                <pre
                  className="p-4 text-slate-300 font-mono text-xs overflow-x-auto max-h-48 leading-relaxed"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                  }}
                >
                  <code>{generatedAPI.controllerCode}</code>
                </pre>
              </div>
            </div>

            {generatedAPI.documentation && (
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3">Documentation</label>
                <p className="text-slate-300 mb-4 leading-relaxed text-sm">{generatedAPI.documentation.summary}</p>

                {generatedAPI.documentation.parameters && generatedAPI.documentation.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Parameters:</h4>
                    <div className="space-y-2">
                      {generatedAPI.documentation.parameters.map((param, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm">
                          <code className="text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded">{param.name}</code>
                          <span className="text-slate-400">({param.type})</span>
                          {param.required && (
                            <span className="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded">Required</span>
                          )}
                          <span className="text-slate-300">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {generatedAPI.testCases && generatedAPI.testCases.length > 0 && (
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3">Test Case</label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">Input</h4>
                    <pre className="bg-slate-900 text-slate-300 p-3 rounded text-xs overflow-x-auto font-mono border border-slate-700/50">
                      <code>{JSON.stringify(generatedAPI.testCases[0]?.input || {}, null, 2)}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2 text-sm">Expected Output</h4>
                    <pre className="bg-slate-900 text-slate-300 p-3 rounded text-xs overflow-x-auto font-mono border border-slate-700/50">
                      <code>{JSON.stringify(generatedAPI.testCases[0]?.expectedOutput || {}, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onApply}
                className={`px-6 py-2 rounded-lg ${isUpdate ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-500/25" : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25"} text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm`}
              >
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Apply Changes</span>
                </div>
              </button>
              <button
                onClick={onDiscard}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Discard</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modern Folder Card Component
const ModernFolderCard = ({ folder, onEdit, onDelete, onUpdate, onClick, isEditing }) => {
  const [editData, setEditData] = useState({
    name: folder.name,
    description: folder.description || "",
  })

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1" onClick={() => onClick(folder)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gradient-to-br from-cyan-500/20 to-purple-500/20 p-3 rounded-lg border border-slate-700/50">
                <Database className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className=" font-bold bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                  {folder.name}
                </h3>
                <p className="text-slate-400 text-sm flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>{folder.apis?.length || 0} APIs</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isEditing ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate(folder._id, editData)
                  }}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4 text-emerald-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditData({ name: folder.name, description: folder.description || "" })
                    onEdit(null)
                  }}
                  className="p-2 hover:bg-slate-500/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(folder._id)
                  }}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-blue-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(folder._id)
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Enter folder description..."
            className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            rows="2"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {!isEditing && (
          <div onClick={() => onClick(folder)} className="flex items-center justify-end">
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </div>
        )}
      </div>
    </div>
  )
}

// Modern API Card Component
const ModernApiCard = ({ api, onEdit, onDelete, onUpdate, onClick, isEditing, getMethodColor }) => {
  const [editData, setEditData] = useState({
    name: api.name,
    description: api.description || "",
    method: api.method,
    endpoint: api.endpoint,
    controllerCode: api.controllerCode || "",
  })

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1" onClick={() => onClick(api)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-3 rounded-lg border border-slate-700/50">
                <Globe className="h-6 w-6 text-emerald-400" />
              </div>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className=" font-bold bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    placeholder="API Name"
                  />
                  <div className="flex space-x-2">
                    <select
                      value={editData.method}
                      onChange={(e) => setEditData({ ...editData, method: e.target.value })}
                      className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                    <input
                      type="text"
                      value={editData.endpoint}
                      onChange={(e) => setEditData({ ...editData, endpoint: e.target.value })}
                      className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm flex-1 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Endpoint"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {api.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border shadow-lg ${getMethodColor(api.method)}`}
                    >
                      {api.method}
                    </span>
                    <code className="text-slate-300 text-sm bg-slate-800/50 px-2 py-1 rounded font-mono border border-slate-700/50">
                      {api.endpoint}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isEditing ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate(api._id, editData)
                  }}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4 text-emerald-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditData({
                      name: api.name,
                      description: api.description || "",
                      method: api.method,
                      endpoint: api.endpoint,
                      controllerCode: api.controllerCode || "",
                    })
                    onEdit(null)
                  }}
                  className="p-2 hover:bg-slate-500/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(api._id)
                  }}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-blue-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(api._id)
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="space-y-3">
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Enter API description..."
              className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows="2"
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              value={editData.controllerCode}
              onChange={(e) => setEditData({ ...editData, controllerCode: e.target.value })}
              placeholder="Enter controller code..."
              className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows="4"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {!isEditing && (
          <div onClick={() => onClick(api)} className="flex items-center justify-end mt-3">
            <div className="flex items-center space-x-1 text-slate-400 group-hover:text-emerald-400 transition-colors">
              <Eye className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Modern API Detail View Component
const ModernApiDetailView = ({ api, onUpdate, getMethodColor, loading, onAIUpdate }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: api?.name || "",
    description: api?.description || "",
    method: api?.method || "GET",
    endpoint: api?.endpoint || "",
    controllerCode: api?.controllerCode || "",
    documentation: api?.documentation || { summary: "", parameters: [] },
  })

  useEffect(() => {
    if (api) {
      setEditData({
        name: api.name || "",
        description: api.description || "",
        method: api.method || "GET",
        endpoint: api.endpoint || "",
        controllerCode: api.controllerCode || "",
        documentation: api.documentation || { summary: "", parameters: [] },
      })
    }
  }, [api])

  const handleSave = () => {
    onUpdate(api._id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      name: api.name || "",
      description: api.description || "",
      method: api.method || "GET",
      endpoint: api.endpoint || "",
      controllerCode: api.controllerCode || "",
      documentation: api.documentation || { summary: "", parameters: [] },
    })
    setIsEditing(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-emerald-300 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-slate-400 text-sm">Loading API details...</p>
        </div>
      </div>
    )
  }

  if (!api) {
    return (
      <div className="text-center py-16">
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">API not found</h3>
        <p className="text-slate-400">The requested API could not be loaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modern API Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-blue-700/20 to-purple-800/20 rounded-2xl blur"></div>
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-purple-500/5 rounded-2xl"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center space-x-6 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-blue-900 rounded-xl blur opacity-40"></div>
                <div className="relative bg-gradient-to-br from-emerald-500/30 to-blue-500/30 p-4 rounded-xl border border-slate-700/50">
                  <Terminal className="h-10 w-10 text-emerald-400" />
                </div>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-2xl font-bold bg-slate-800/50 text-white border border-slate-600/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="API Name"
                    />
                    <div className="flex space-x-3">
                      <select
                        value={editData.method}
                        onChange={(e) => setEditData({ ...editData, method: e.target.value })}
                        className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                      <input
                        type="text"
                        value={editData.endpoint}
                        onChange={(e) => setEditData({ ...editData, endpoint: e.target.value })}
                        className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-4 py-3 flex-1 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                        placeholder="Endpoint"
                      />
                    </div>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      rows="2"
                      placeholder="API Description"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3 leading-tight">
                      {api.name}
                    </h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <span
                        className={`px-4 py-2 rounded-lg font-bold border-2 shadow-xl ${getMethodColor(api.method)}`}
                      >
                        {api.method}
                      </span>
                      <code className="text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg font-mono border border-slate-700/50 shadow-lg">
                        {api.endpoint}
                      </code>
                    </div>
                    {api.description && <p className="text-slate-300 leading-relaxed max-w-3xl">{api.description}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-900 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl shadow-emerald-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </div>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all duration-300 border border-slate-600/50 shadow-xl text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onAIUpdate}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-orange-800 to-orange-500 hover:from-orange-700 hover:to-orange-400 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl shadow-orange-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>AI Enhance</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-800 to-blue-800 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Edit2 className="h-4 w-4" />
                      <span>Manual Edit</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl blur"></div>
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
          <div className="border-b border-slate-700/50 bg-slate-800/30">
            <nav className="flex space-x-0 px-6">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "code", label: "Controller Code", icon: Code },
                { id: "documentation", label: "Documentation", icon: BookOpen },
                { id: "test-input", label: "Test Case", icon: FileCode },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">API Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-blue-1000/20 rounded-xl "></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Method</label>
                        <span
                          className={`inline-block px-4 py-2 rounded-lg font-bold border-2  ${getMethodColor(api.method)}`}
                        >
                          {api.method}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl blur "></div>
                      <div className="relative bg-gradient-to-br from-slate-900/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Endpoint</label>
                        <code className="text-slate-300 font-mono bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-600/50 shadow-lg">
                          {api.endpoint}
                        </code>
                      </div>
                    </div>
                  </div>
                  {api.description && (
                    <div className="relative mt-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-xl blur"></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <p className="text-slate-300 leading-relaxed">{api.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modern Controller Code Tab */}
            {activeTab === "code" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Controller Code</h3>
                  <button
                    onClick={() => copyToClipboard(api.controllerCode || "")}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-xl text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Copy className="h-4 w-4" />
                      <span>Copy Code</span>
                    </div>
                  </button>
                </div>

                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur"></div>
                    <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                        </div>
                        <span className="text-slate-400 text-sm font-mono">controller.js</span>
                        <div className="ml-auto flex items-center space-x-2">
                          <span className="text-xs text-orange-400 font-medium">Editing Mode</span>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-lg"></div>
                        </div>
                      </div>
                      <textarea
                        value={editData.controllerCode}
                        onChange={(e) => setEditData({ ...editData, controllerCode: e.target.value })}
                        className="w-full bg-slate-900 text-slate-300 border-0 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-6"
                        rows="20"
                        placeholder="Enter controller code..."
                        style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          tabSize: 2,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur"></div>
                    <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                        </div>
                        <span className="text-slate-400 text-sm font-mono">controller.js</span>
                        <div className="ml-auto flex items-center space-x-2">
                          <span className="text-xs text-emerald-400 font-medium">Read Only</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg"></div>
                        </div>
                      </div>
                      <div className="relative group">
                        <pre
                          className="p-4 text-slate-300 font-mono text-sm overflow-x-auto leading-6 max-h-80 overflow-y-auto"
                          style={{
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                            fontSize: "13px",
                            lineHeight: "1.6",
                          }}
                        >
                          <code className="language-javascript">
                            {api.controllerCode || "// No controller code provided"}
                          </code>
                        </pre>
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => copyToClipboard(api.controllerCode || "")}
                            className="bg-slate-700/80 hover:bg-slate-600/80 text-white p-2 rounded-lg text-xs transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modern Documentation Tab */}
            {activeTab === "documentation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">API Documentation</h3>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl blur"></div>
                    <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <p className="text-slate-300 leading-relaxed">
                        {api.documentation?.summary || "No documentation summary provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Parameters</h3>
                  {api.documentation?.parameters && api.documentation.parameters.length > 0 ? (
                    <div className="space-y-3">
                      {api.documentation.parameters.map((param, index) => (
                        <div key={index} className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 rounded-xl blur"></div>
                          <div className="relative bg-gradient-to-br from-slate-900/30 to-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex items-center space-x-4 mb-2">
                              <code className="text-cyan-400 font-mono font-semibold bg-cyan-700/10 px-3 py-1 rounded-lg border border-cyan-500/20 shadow-lg">
                                {param.name}
                              </code>
                              <span className="text-slate-400">({param.type})</span>
                              {param.required && (
                                <span className="text-red-400 text-sm font-semibold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 shadow-lg">
                                  Required
                                </span>
                              )}
                              <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full font-medium shadow-lg">
                                {param.location}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-xl blur"></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-8 rounded-xl border border-slate-700/50 text-center">
                        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No parameters documented</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modern Test Case Tab */}
            {activeTab === "test-input" && <ModernTestCaseView api={api} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modern Test Case View Component
const ModernTestCaseView = ({ api }) => {
  // Get the first test case if available
  const testCase = api.testCases && api.testCases.length > 0 ? api.testCases[0] : null

  const formatJson = (obj) => {
    if (!obj) return "{}"
    try {
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      return "{}"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Test Case</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full shadow-lg ${testCase ? "bg-emerald-500" : "bg-slate-500"}`}></div>
          <span className="text-sm text-slate-400 font-medium">
            {testCase ? "Test case available" : "No test case defined"}
          </span>
        </div>
      </div>

      {testCase ? (
        <div className="space-y-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Input */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-40"></div>
                  <div className="relative bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                    <Play className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white">Input</h4>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur"></div>
                <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-mono">input.json</span>
                  </div>
                  <pre
                    className="p-4 text-slate-300 font-mono text-xs overflow-x-auto leading-6"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                      fontSize: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <code className="language-json">{formatJson(testCase.input)}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Expected Output */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-40"></div>
                  <div className="relative bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                    <Check className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white">Expected Output</h4>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
                <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-mono">output.json</span>
                  </div>
                  <pre
                    className="p-4 text-slate-300 font-mono text-xs overflow-x-auto leading-6"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                      fontSize: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <code className="language-json">{formatJson(testCase.expectedOutput)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full blur opacity-20"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
              <FileCode className="h-12 w-12 text-slate-400 mx-auto" />
            </div>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">No Test Case Available</h4>
          <p className="text-slate-400">This API doesn't have any test cases defined yet.</p>
        </div>
      )}
    </div>
  )
}

export default FolderManagement
