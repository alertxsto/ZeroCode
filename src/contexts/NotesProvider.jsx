import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiClient';
import { useAuth } from './AuthProvider';
import { SYSTEM_MANUAL } from '../data/neuralVaultTemplates';

const NotesContext = createContext({});

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
    const { user } = useAuth();
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVault = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [foldersData, notesData] = await Promise.all([
                apiFetch('/api/vault?resource=folders'),
                apiFetch('/api/vault?resource=notes'),
            ]);
            setFolders(foldersData.folders || []);

            // Inject System Note
            const systemNote = {
                id: 'sys-manual',
                title: 'HOW_TO_USE_VAULT.md',
                content: SYSTEM_MANUAL,
                folder_id: null,
                is_system: true,
                tags: ['system', 'read-only'],
                last_modified: new Date().toISOString()
            };

            setNotes([systemNote, ...(notesData.notes || [])]);
        } catch (error) {
            console.error('Error fetching vault:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchVault();
    }, [user]);

    const createFolder = async (name, parentId = null) => {
        try {
            const data = await apiFetch('/api/vault?resource=folders', {
                method: 'POST',
                body: { name, parentId }
            });
            const newFolder = data.folder;
            setFolders(prev => [...prev, newFolder]);
            return { success: true, folder: newFolder };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const createNote = async (title, content = '', folderId = null) => {
        try {
            const data = await apiFetch('/api/vault?resource=notes', {
                method: 'POST',
                body: { title, content, folderId }
            });
            const newNote = data.note;
            setNotes(prev => [newNote, ...prev]);
            return { success: true, note: newNote };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateNote = async (id, updates) => {
        try {
            const data = await apiFetch(`/api/vault?resource=notes&id=${id}`, {
                method: 'PATCH',
                body: updates
            });
            const updatedNote = data.note;
            setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
            return { success: true, note: updatedNote };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteNote = async (id) => {
        try {
            await apiFetch(`/api/vault?resource=notes&id=${id}`, { method: 'DELETE' });
            setNotes(prev => prev.filter(n => n.id !== id));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateFolder = async (id, name) => {
        try {
            const data = await apiFetch(`/api/vault?resource=folders&id=${id}`, {
                method: 'PATCH',
                body: { name }
            });
            const updatedFolder = data.folder;
            setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f));
            return { success: true, folder: updatedFolder };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteFolder = async (id) => {
        try {
            await apiFetch(`/api/vault?resource=folders&id=${id}`, { method: 'DELETE' });
            setFolders(prev => prev.filter(f => f.id !== id));
            setNotes(prev => prev.filter(n => n.folder_id !== id)); // Remove notes locally
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <NotesContext.Provider value={{
            folders, notes, loading,
            createFolder, updateFolder, deleteFolder,
            createNote, updateNote, deleteNote,
            refreshVault: fetchVault
        }}>
            {children}
        </NotesContext.Provider>
    );
};
