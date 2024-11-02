import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [draggedDocument, setDraggedDocument] = useState(null);
    const [folderDocuments, setFolderDocuments] = useState([]);

    const navigate = useNavigate();

   
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_FAST_API}/check-login/`, { credentials: 'include' });
                const data = await response.json();
                setIsLoggedIn(data.status === "Logged in");
            } catch (error) {
                console.error('Error checking login status:', error);
                setIsLoggedIn(false);
            }
        };
        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchFolders();
            fetchDocuments();
        }
    }, [isLoggedIn]);

    // Fetch folders
    const fetchFolders = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/folders-view/`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setFolders(data);
            } else {
                console.error('Error fetching folders:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    // Fetch documents
    const fetchDocuments = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/documents-view/`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            } else {
                console.error('Error fetching documents:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    // Fetch documents for a specific folder
    const fetchDocumentsForFolder = async (folderId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/folders/${folderId}/documents/`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                return data; 
            } else {
                console.error('Error fetching documents for folder:', response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error fetching documents for folder:', error);
            return [];
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName) {
            setStatusMessage('Folder name cannot be empty.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/folders/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name: newFolderName }),
            });

            if (response.ok) {
                const newFolder = await response.json();
                setFolders([...folders, newFolder]);
                setNewFolderName('');
                setIsModalOpen(false);
                setStatusMessage('Folder created successfully!');
            } else {
                throw new Error('Folder creation failed');
            }
        } catch (error) {
            setStatusMessage(error.message);
            console.error(error);
        }
    };

 //  navigating with a fileUrl
 const handleDocumentClick = async (documentId) => {
    console.log(`Fetching document with ID: ${documentId}`);
    try {
        const response = await fetch(`${process.env.REACT_APP_FAST_API}/documents/${documentId}/`, { credentials: 'include' });
        console.log('Response Status:', response.status); 

        if (response.ok) {
            const blob = await response.blob(); 
            const fileUrl = URL.createObjectURL(blob); 
            console.log('File URL:', fileUrl); 

            navigate('/document-chat', { state: { fileUrl, documentId } });
        } else {
            console.error('Error fetching document content:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching document content:', error);
    }
};


    
    

    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_FAST_API}/logout/`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setIsLoggedIn(false);
                window.location.reload();
                navigate('/');

            } else {
                console.error('Error logging out:', response.statusText);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

const toggleFolderExpansion = async (folderId) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folderId]: !prev[folderId],
        }));

        if (!expandedFolders[folderId]) {
            const documents = await fetchDocumentsForFolder(folderId);
            setFolderDocuments((prev) => ({
                ...prev,
                [folderId]: documents,
            }));
        }
    };

    const handleDragStart = (document) => {
        setDraggedDocument(document);
    };

    const handleDrop = async (folderId) => {
        if (draggedDocument) {
            try {
                const response = await fetch(`${process.env.REACT_APP_FAST_API}/folders/${folderId}/documents/${draggedDocument.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ folder_id: folderId })
                });
                
                if (response.ok) {
                    setDocuments((prevDocuments) =>
                        prevDocuments.map((doc) =>
                            doc.id === draggedDocument.id ? { ...doc, folder_id: folderId } : doc
                        )
                    );
                    setDraggedDocument(null);
                    setStatusMessage('Document moved successfully!');
                } else {
                    const errorData = await response.json();
                    setStatusMessage(`Error moving document: ${errorData.message || response.statusText}`);
                    console.error('Error moving document:', errorData);
                }
            } catch (error) {
                setStatusMessage(`Error moving document: ${error.message}`);
                console.error('Error moving document:', error);
            }
        }
    };
    const handleCreateFolderClick = () => {
        if (isLoggedIn) {
            setIsModalOpen(true);
        } else {
            navigate('/register');
        }
    };
    
    const handleNavigateHome = () => {
        if (isLoggedIn) {
            navigate('/');
        } else {
            navigate('/register');
        }
    };
    
    const unassignedDocuments = documents.filter(doc => !doc.folder_id);

    return (
        <div className="layout-container">
            <aside className="sidebar">
            <div>
    <button className="navigate-home-btn" onClick={handleNavigateHome}>
        Add File
    </button>
</div>
<button className="create-folder-btn" onClick={handleCreateFolderClick}>
    Create New Folder
</button>


           <ul>
                    {folders.map((folder) => (
                        <li key={folder.id} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(folder.id)}>
                            <div className="folder-header" onClick={() => toggleFolderExpansion(folder.id)}>
                                <span>{folder.name}</span>
                                <span className="arrow">
                                    {expandedFolders[folder.id] ? '▲' : '▼'}
                                </span>
                            </div>
                            
                            {expandedFolders[folder.id] && (
                       <ul className="document-list">
                       {(folderDocuments[folder.id] || []).map((doc) => (
                           <li key={doc.id} className="document-item" onClick={() => handleDocumentClick(doc.id)}  >
                               {doc.file_name}
                           </li>
                       ))}
                   </ul>
                            )}
                        </li>
                    ))}
                </ul>


                <ul>
                    {unassignedDocuments.map((document) => (
                        <li

                            key={document.id}
                            className="document-item"
                            draggable
                            onDragStart={() => handleDragStart(document)}
                            onClick={() => handleDocumentClick(document.id)}
                        >
                            {document.file_name}
                        </li>
                    ))}
                </ul>

                {statusMessage && <p>{statusMessage}</p>}

                <div className="sign-up">
                    {isLoggedIn ? (
                        <button onClick={handleLogout}>Logout</button>
                    ) : (
                        <button onClick={() => navigate('/register')}>Sign Up</button>
                    )}
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Folder</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="New Folder Name"
                                required
                            />
                            <button type="submit">Create Folder</button>
                            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;
